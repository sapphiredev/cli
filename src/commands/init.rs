use crate::config::{Config, Project};
use crate::utils::{console_box, copy};
use crate::EXAMPLES_REPO_URL;
use anyhow::Result;
use dialoguer::{Input, Select};
use git2::Repository;
use indicatif::{ProgressBar, ProgressStyle};
use regex::Regex;
use std::collections::HashMap;
use std::time::Duration;
use std::{env, fs};

pub fn run() -> Result<()> {
    let project_dir = env::current_dir()?;

    let project_language = Select::new()
        .with_prompt("Which language do you want to use?")
        .items(&["TypeScript (Recommended)", "JavaScript"])
        .default(0)
        .interact()
        .unwrap();

    let module_system = Select::new()
        .with_prompt("Which module system do you want to use?")
        .items(&[
            "CommonJS (a.k.a. CJS; Legacy NodeJS, easy for beginners, a lot of online resources will reference CJS)",
            "ES Modules (ak.a. ESM; Modern JavaScript and the future of NodeJS)"
        ])
        .default(0)
        .interact()
        .unwrap();

    let base = Input::new()
        .with_prompt("What's the base/source directory of your project?")
        .default("src".to_string())
        .interact_text()?;

    let progress_style = ProgressStyle::default_spinner().tick_strings(&[
        "▰▱▱▱▱",
        "▰▰▱▱▱",
        "▰▰▰▱▱",
        "▰▰▰▰▱",
        "▰▰▰▰▰",
        "▰▰▰▰▰",
    ]);

    let pb = ProgressBar::new_spinner().with_style(progress_style);

    pb.set_message("Initializing project...");
    pb.enable_steady_tick(Duration::new(0, 100000000));

    fs::create_dir("temp")?;
    let temp = project_dir.join("temp");

    Repository::clone(EXAMPLES_REPO_URL, &temp)?;

    let template_extension = match project_language {
        0 => "ts",
        1 => match module_system {
            0 => "cjs",
            1 => "mjs",
            _ => unreachable!(),
        },
        _ => unreachable!(),
    };

    fs::create_dir(project_dir.join(".sapphire"))?;
    copy(
        &temp.join("examples/pieces"),
        &project_dir.join(".sapphire/templates"),
        Some(&vec![template_extension, "toml"]),
    )?;

    let template_config_path = &project_dir.join(".sapphire/templates/cli.toml");
    let template_config = fs::read_to_string(template_config_path)?;

    let config = Config {
        project: Project {
            language: match project_language {
                0 => "ts".to_string(),
                1 => "js".to_string(),
                _ => unreachable!(),
            },
            module_system: match module_system {
                0 => "cjs".to_string(),
                1 => "esm".to_string(),
                _ => unreachable!(),
            },
            base,
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

    fs::write(project_dir.join("sapphire.toml"), config_string)?;
    fs::remove_dir_all(temp)?;
    fs::remove_file(template_config_path)?;

    pb.finish_and_clear();

    console_box(
        &[
            "Project initialized!",
            "https://sapphirejs.dev for documentation",
        ],
        None,
    );

    Ok(())
}
