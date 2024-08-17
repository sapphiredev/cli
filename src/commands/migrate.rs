use crate::config::{Config, Project};
use crate::utils::copy;
use anyhow::Result;
use console::Style;
use dialoguer::{Confirm, Input, MultiSelect, Select};
use git2::Repository;
use indicatif::{ProgressBar, ProgressStyle};
use regex::{Captures, Regex};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;
use std::{fs, process};

#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OldConfig {
    project_language: String,
    locations: HashMap<String, String>,
    custom_file_templates: OldConfigCFT,
}

#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OldConfigCFT {
    enabled: bool,
    location: String,
}

pub fn run() -> Result<()> {
    let confirmation = Confirm::new()
        .with_prompt("This command is for migrating Sapphire CLI v1 project over to Sapphire CLI v2. Do you want to continue?")
        .interact()
        .unwrap();

    if !confirmation {
        return Ok(());
    }

    let mut config_json = true;

    let old_config = if let Ok(old_config) = std::fs::read_to_string(".sapphirerc.json") {
        serde_json::from_str::<OldConfig>(&old_config)?
    } else if let Ok(old_config) = std::fs::read_to_string(".sapphirerc.yml") {
        config_json = false;
        serde_yaml::from_str::<OldConfig>(&old_config)?
    } else {
        let cyan = Style::new().cyan();

        println!("No configuration file found for Sapphire CLI v1 project. Use {} to initialize a project.", cyan.apply_to(
            "sapphire init"
        ));

        process::exit(1);
    };

    let language = match old_config.project_language.as_str() {
        "ts" => "ts",
        "js" => "js",
        _ => anyhow::bail!("Invalid configuration file"),
    };

    let module_system = Select::new()
        .with_prompt("Which module system do you use?")
        .items(&["CommonJS", "ES Modules"])
        .default(0)
        .interact()
        .unwrap();

    let template_extension = match language {
        "ts" => "ts",
        "js" => match module_system {
            0 => "cjs",
            1 => "mjs",
            _ => unreachable!(),
        },
        _ => unreachable!(),
    };

    let cwd = std::env::current_dir()?;

    let progress_style = ProgressStyle::default_spinner().tick_strings(&[
        "▰▱▱▱▱",
        "▰▰▱▱▱",
        "▰▰▰▱▱",
        "▰▰▰▰▱",
        "▰▰▰▰▰",
        "▰▰▰▰▰",
    ]);

    let pb = ProgressBar::new_spinner().with_style(progress_style);

    pb.set_message("Migrating project...");
    pb.enable_steady_tick(Duration::new(0, 100000000));

    fs::create_dir("temp")?;
    let temp = cwd.join("temp");

    let examples_url = "https://github.com/enxg/sapphire-examples.git";
    Repository::clone(examples_url, &temp)?;

    fs::create_dir(cwd.join(".sapphire"))?;
    copy(
        &temp.join("examples/pieces"),
        &cwd.join(".sapphire/templates"),
        Some(&vec![template_extension, "toml"]),
    )?;

    let template_config_path = &cwd.join(".sapphire/templates/cli.toml");
    let template_config = fs::read_to_string(template_config_path)?;

    let config = Config {
        project: Project {
            language: language.to_string(),
            module_system: match module_system {
                0 => "cjs".to_string(),
                1 => "esm".to_string(),
                _ => unreachable!(),
            },
            base: old_config
                .locations
                .get("base")
                .unwrap_or(&"src".to_string())
                .to_string(),
        },
        variables: HashMap::new(),
        categories: HashMap::new(),
        templates: HashMap::new(),
    };

    let config_string = toml::to_string_pretty(&config)?;
    let replace_regex = Regex::new(r"\[categories]\n\n\[templates]")?;
    let config_string = replace_regex
        .replace(&config_string, &template_config)
        .to_string();

    fs::write(cwd.join("sapphire.toml"), config_string)?;
    fs::remove_dir_all(temp)?;
    fs::remove_file(template_config_path)?;

    pb.finish_and_clear();

    if !old_config.custom_file_templates.enabled {
        fs::remove_file(if config_json {
            ".sapphirerc.json"
        } else {
            ".sapphirerc.yml"
        })?;

        println!("Project migrated!");
        return Ok(());
    }

    let ch = Select::new()
        .with_prompt("Custom file templates are enabled.")
        .items(&["Migrate interactively", "Finish and migrate manually"])
        .default(0)
        .interact()
        .unwrap();

    if ch == 1 {
        println!("Project migrated!");
        return Ok(());
    }

    let config = Config::load()?;
    let mut config_str = fs::read_to_string("sapphire.toml")?;

    let template_dir = cwd.join(old_config.custom_file_templates.location);
    let template_files = fs::read_dir(&template_dir)?
        .map(|x| {
            let file_name = x.unwrap().file_name();
            file_name.to_str().unwrap().to_string()
        })
        .collect::<Vec<String>>();

    let selected_files = MultiSelect::new()
        .with_prompt("Select files to migrate")
        .items_checked(
            &template_files
                .iter()
                .map(|x| (x, true))
                .collect::<Vec<(&String, bool)>>(),
        )
        .interact()?;

    let template_files = template_files
        .iter()
        .enumerate()
        .filter_map(|(i, x)| {
            if selected_files.contains(&i) {
                Some(x)
            } else {
                None
            }
        })
        .collect::<Vec<&String>>();

    let cat_select_options = config
        .categories
        .keys()
        .map(|x| x.as_str())
        .collect::<Vec<&str>>();

    for file_name in template_files {
        let file = fs::read_to_string(template_dir.join(file_name))?;
        let (file_cfg, file) = {
            let split: Vec<&str> = file.split("\n---\n").collect();
            if split.len() != 2 {
                println!("Invalid V1 file template: {}. Skipping.", file_name);
                continue;
            }

            let cfg = serde_json::from_str::<FileCfg>(split[0])?;

            let re = Regex::new(r"\{\{(\w+)}}")?;
            let file = re.replace_all(split[1], |caps: &Captures| {
                format!("/*{{{{{}}}}}*/", &caps[1])
            });

            (cfg, file)
        };

        let cat = Select::new()
            .with_prompt(&format!(
                "Select category for {}. (Current category: {})",
                file_name, file_cfg.category
            ))
            .items(&cat_select_options)
            .default(0)
            .interact()?;
        let cat = cat_select_options[cat];

        let name: String = Input::new()
            .with_prompt(&format!("Enter template name for {}", file_name))
            .interact_text()?;

        config_str = config_str.replace(
            &format!("[templates.{}]", cat),
            &format!("[templates.{}]\n{} = {{ aliases = [] }}", cat, name),
        );

        fs::write(
            cwd.join(".sapphire/templates")
                .join(cat)
                .join(format!("{}.{}", name, template_extension)),
            file.as_ref(),
        )?;
    }

    fs::write(cwd.join("sapphire.toml"), config_str)?;
    fs::remove_file(if config_json {
        ".sapphirerc.json"
    } else {
        ".sapphirerc.yml"
    })?;
    fs::remove_dir_all(template_dir)?;

    println!("Project migrated!");

    Ok(())
}

#[derive(Deserialize)]
struct FileCfg {
    category: String,
}
