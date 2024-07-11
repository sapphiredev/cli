use dialoguer::{Input, MultiSelect, Select};
use spinners::{Spinner, Spinners};
use crate::task_runner::run_tasks;
use crate::task_runner::tasks::{CloneTask, CopyTask, MkdirTask, RmTask, SetupPackageJsonTask, Tasks};

pub fn run(name_s: &Option<String>) {
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
        .items(&[
            "TypeScript (Recommended)",
            "JavaScript"
        ])
        .default(0)
        .interact()
        .unwrap();

    let module_system = Select::new()
        .with_prompt("Which module system do you want to use?")
        .items(&[
            "CommonJS (a.k.a. CJS; easy for beginners, a lot of online resources will reference CommonJS, but will need migration in the long term)",
            "ES Modules (ak.a. ESM; Modern JavaScript and the future of NodeJS)"
        ])
        .default(0)
        .interact()
        .unwrap();

    let pdir = cwd.join(&name);
    let temp = pdir.join("temp");
    let template_files = temp.join("examples").join(
        match project_language {
            0 => "with-typescript-complete",
            1 => match module_system {
                0 => "with-javascript-cjs",
                1 => "with-esm",
                _ => unreachable!(),
            }
            _ => unreachable!(),
        }
    );

    let mut tasks = vec![
        Tasks::Mkdir(MkdirTask {
            path: &pdir,
        }),
        Tasks::Clone(CloneTask {
            repo_url: "https://github.com/enxg/sapphire-examples.git",
            clone_into: &temp,
        }),
        Tasks::Copy(CopyTask {
            from: &template_files,
            to: &pdir,
        }),
    ];

    let tsup_config = temp.join("examples/with-tsup/tsup.config.ts");
    let tsup_config_target = pdir.join("tsup.config.ts");
    let swc_config = temp.join("examples/with-swc/.swcrc");
    let swc_config_target = pdir.join(".swcrc");
    
    let package_json = pdir.join("package.json");

    if project_language == 0 /* TypeScript */ {
        // TODO: Need to do needed modifications in config files for ESM/CJS choice
        
        let compiler = Select::new()
            .with_prompt("Which compiler do you want to use?")
            .items(&[
                "TypeScript Compiler",
                "tsup (Faster, no type checking) (https://tsup.egoist.dev)",
                "SWC (Faster, no type checking) (https://swc.rs)"
            ])
            .default(0)
            .interact()
            .unwrap();

        tasks.push(Tasks::SetupPackageJson(SetupPackageJsonTask {
            path: &package_json,
            project_name: &name,
            setup_for_tsup: compiler == 1,
            setup_for_swc: compiler == 2,
            esm: module_system == 1,
        }));

        match compiler {
            0 => {}
            1 => {
                tasks.push(Tasks::Copy(CopyTask {
                    from: &tsup_config,
                    to: &tsup_config_target,
                }));
            }
            2 => {
                tasks.push(Tasks::Copy(CopyTask {
                    from: &swc_config,
                    to: &swc_config_target,
                }));
            }
            _ => { unreachable!() }
        }
    } else /* JavaScript */ {
        tasks.push(Tasks::SetupPackageJson(SetupPackageJsonTask {
            path: &package_json,
            project_name: &name,
            setup_for_tsup: false,
            setup_for_swc: false,
            esm: module_system == 1,
        }));
    }
    
    tasks.push(Tasks::Rm(RmTask {
        path: &temp,
        dir: true,
    }));
    
    // TODO: Create a config file

    run_tasks(&tasks);
}
