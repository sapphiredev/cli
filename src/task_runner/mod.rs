use git2::Repository;
use spinners::{Spinner, Spinners};
use std::fs;
use std::path::PathBuf;
use serde_json::Value;
use crate::task_runner::tasks::Tasks;
pub mod tasks;

pub fn run_tasks(tasks: &Vec<Tasks>) {
    for task in tasks {
        match task {
            Tasks::Clone(task) => {
                print!("Cloning repository: {}", task.repo_url);

                let res = Repository::clone(task.repo_url, task.clone_into);

                if res.is_err() {
                    eprintln!("Failed to clone repository: {}", res.err().unwrap());
                    std::process::exit(1);
                }

                println!(" | ✔")
            }
            Tasks::Mkdir(task) => {
                print!("Creating directory: {}", task.path.display());

                let res = fs::create_dir_all(task.path);

                if res.is_err() {
                    eprintln!("Failed to create directory: {}", res.err().unwrap());
                    std::process::exit(1);
                }

                println!(" | ✔")
            }
            Tasks::Copy(task) => {
                print!("Copying files from: {} to: {}", task.from.display(), task.to.display());

                let res = copy(task.from, task.to);

                if res.is_err() {
                    eprintln!("Failed to copy files: {}", res.err().unwrap());
                    std::process::exit(1);
                }

                println!(" | ✔")
            }
            Tasks::Rm(task) => {
                print!("Removing files: {}", task.path.display());

                let res = if task.dir {
                    fs::remove_dir_all(task.path)
                } else {
                    fs::remove_file(task.path)
                };

                if res.is_err() {
                    eprintln!("Failed to remove files: {}", res.err().unwrap());
                    std::process::exit(1);
                }

                println!(" | ✔")
            }
            Tasks::SetupPackageJson(task) => {
                print!("Setting up package.json: {}", task.path.display());

                let package_json = fs::read_to_string(task.path).unwrap_or_else(|_| {
                    eprintln!("Failed to read package.json");
                    std::process::exit(1);
                });

                let mut package_json: Value = serde_json::from_str(package_json.as_str()).unwrap_or_else(|_| {
                    eprintln!("Failed to parse package.json");
                    std::process::exit(1);
                });

                package_json["name"] = Value::String(task.project_name.to_string());
                package_json["type"] = Value::String(match task.esm {
                    true => "module".to_string(),
                    false => "commonjs".to_string(),
                });

                if task.setup_for_tsup {
                    package_json["devDependencies"]["tsup"] = Value::String("latest".to_string());

                    package_json["scripts"]["build"] = Value::String("tsup".to_string());
                    package_json["scripts"]["watch"] = Value::String("tsup --watch".to_string());
                    package_json["scripts"]["dev"] = Value::String("tsup --watch --onSuccess \"node ./dist/index.js\"".to_string());
                } else if task.setup_for_swc {
                    package_json["devDependencies"]["@swc/cli"] = Value::String("latest".to_string());
                    package_json["devDependencies"]["@swc/core"] = Value::String("latest".to_string());
                    package_json["devDependencies"]["npm-run-all2"] = Value::String("latest".to_string());
                    package_json["devDependencies"]["tsc-watch"] = Value::String("latest".to_string());

                    package_json["scripts"]["build"] = Value::String("swc src -d dist --strip-leading-paths".to_string());
                    package_json["scripts"]["watch"] = Value::String("swc src -d dist -w --strip-leading-paths".to_string());
                    package_json["scripts"]["dev"] = Value::String("run-s build start".to_string());
                    package_json["scripts"]["watch:start"] = Value::String("tsc-watch --onSuccess \"node ./dist/index.js\"".to_string());
                }

                let res = fs::write(task.path, serde_json::to_string_pretty(&package_json).unwrap());

                if res.is_err() {
                    eprintln!("Failed to write package.json: {}", res.err().unwrap());
                    std::process::exit(1);
                }

                println!(" | ✔")
            }
        }
    }
}

fn copy(from: &PathBuf, to: &PathBuf) -> std::io::Result<u64> {
    if from.is_file() {
       fs::copy(from, to)
    } else if from.is_dir() {
        if to.exists() && !to.is_dir() {
            return Err(std::io::Error::new(std::io::ErrorKind::Other, "Cannot copy directory to file"));
        } else if !to.exists() {
            fs::create_dir(to)?;
        }

        for entry in fs::read_dir(from)? {
            let entry = entry?;
            let path = entry.path();
            let new_path = to.join(path.file_name().unwrap());

            copy(&path, &new_path)?;
        }

        Ok(0)
    } else {
        return Err(std::io::Error::new(std::io::ErrorKind::Other, "Cannot read file, missing permissions?"));
    }
}
