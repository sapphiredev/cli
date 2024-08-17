use crate::config::{Config, Project};
use crate::utils::{console_box, copy};
use crate::EXAMPLES_REPO_URL;
use anyhow::Result;
use dialoguer::{Input, Select};
use git2::Repository;
use indicatif::{ProgressBar, ProgressStyle};
use regex::Regex;
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::time::Duration;

pub fn run(name_s: &Option<String>) -> Result<()> {
    let cwd = std::env::current_dir().unwrap();

    let name = if let Some(name) = name_s {
        name.clone()
    } else {
        Input::new()
            .with_prompt("What's the name of your project?")
            .interact_text()
            .unwrap()
    };

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

    let project_dir = cwd.join(&name);
    let temp = project_dir.join("temp");
    let template_files = &temp.join("examples").join(match project_language {
        0 => "with-typescript-complete",
        1 => match module_system {
            0 => "with-javascript-cjs",
            1 => "with-esm",
            _ => unreachable!(),
        },
        _ => unreachable!(),
    });

    let compiler = if project_language == 0 {
        Select::new()
            .with_prompt("Which compiler do you want to use?")
            .items(&[
                "TypeScript Compiler",
                "tsup (Faster, no type checking) (https://tsup.egoist.dev)",
                "SWC (Faster, no type checking) (https://swc.rs)",
            ])
            .default(0)
            .interact()
            .unwrap()
    } else {
        0
    };

    let progress_style = ProgressStyle::default_spinner().tick_strings(&[
        "▰▱▱▱▱",
        "▰▰▱▱▱",
        "▰▰▰▱▱",
        "▰▰▰▰▱",
        "▰▰▰▰▰",
        "▰▰▰▰▰",
    ]);

    let pb = ProgressBar::new_spinner().with_style(progress_style);

    pb.set_message("Creating project...");
    pb.enable_steady_tick(Duration::new(0, 100000000));

    fs::create_dir_all(&project_dir)?;

    Repository::clone(EXAMPLES_REPO_URL, &temp)?;

    copy(template_files, &project_dir, None)?;

    let package_json_path = project_dir.join("package.json");
    let package_json = fs::read_to_string(&package_json_path)?;
    let mut package_json: Value = serde_json::from_str(package_json.as_str())?;

    package_json["name"] = Value::String(name.clone());
    package_json["type"] = Value::String(match module_system {
        0 => "commonjs".to_string(),
        1 => "module".to_string(),
        _ => unreachable!(),
    });

    if project_language == 0
    /* TypeScript */
    {
        match compiler {
            0 => {}
            1 => {
                package_json["devDependencies"]["tsup"] = Value::String("latest".to_string());

                package_json["scripts"]["build"] = Value::String("tsup".to_string());
                package_json["scripts"]["watch"] = Value::String("tsup --watch".to_string());
                package_json["scripts"]["dev"] =
                    Value::String("tsup --watch --onSuccess \"node ./dist/index.js\"".to_string());
            }
            2 => {
                package_json["devDependencies"]["@swc/cli"] = Value::String("latest".to_string());
                package_json["devDependencies"]["@swc/core"] = Value::String("latest".to_string());
                package_json["devDependencies"]["npm-run-all2"] =
                    Value::String("latest".to_string());
                package_json["devDependencies"]["tsc-watch"] = Value::String("latest".to_string());

                package_json["scripts"]["build"] =
                    Value::String("swc src -d dist --strip-leading-paths".to_string());
                package_json["scripts"]["watch"] =
                    Value::String("swc src -d dist -w --strip-leading-paths".to_string());
                package_json["scripts"]["dev"] = Value::String("run-s build start".to_string());
                package_json["scripts"]["watch:start"] =
                    Value::String("tsc-watch --onSuccess \"node ./dist/index.js\"".to_string());
            }
            _ => unreachable!(),
        }

        let tsconfig_path = project_dir.join("tsconfig.json");
        let tsconfig = fs::read_to_string(&tsconfig_path)?;
        let mut tsconfig: Value = serde_json::from_str(tsconfig.as_str())?;

        let mut extends_array = vec![
            "@sapphire/ts-config",
            "@sapphire/ts-config/extra-strict",
            "@sapphire/ts-config/decorators",
        ];

        if module_system == 1 {
            extends_array.push("@sapphire/ts-config/verbatim");
        }

        tsconfig["extends"] = Value::Array(
            extends_array
                .into_iter()
                .map(|v| Value::String(v.to_string()))
                .collect(),
        );

        fs::write(
            &tsconfig_path,
            serde_json::to_string_pretty(&tsconfig).unwrap(),
        )?;
    }

    fs::write(
        &package_json_path,
        serde_json::to_string_pretty(&package_json).unwrap(),
    )?;

    fs::create_dir(project_dir.join(".sapphire"))?;

    let template_extension = match project_language {
        0 => "ts",
        1 => match module_system {
            0 => "cjs",
            1 => "mjs",
            _ => unreachable!(),
        },
        _ => unreachable!(),
    };

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
            base: "src".to_string(),
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
    fs::remove_dir_all(&temp)?;
    fs::remove_file(template_config_path)?;

    pb.finish_and_clear();

    console_box(
        &[
            "To get started, run the following commands:",
            "",
            &format!("cd {}", name),
            "npm install",
            "npm run dev",
        ],
        Some("Project created successfully!"),
    );

    Ok(())
}
