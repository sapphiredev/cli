use crate::config::Config;
use anyhow::{anyhow, bail, Result};
use regex::{Captures, Regex};
use std::collections::HashMap;
use std::env;
use std::fs;

pub fn run(template: &String, name: &String) -> Result<()> {
    let cfg = Config::load()?;

    let mut templates: HashMap<&str, TemplateMap> = HashMap::new();

    for (cat, temps) in &cfg.templates {
        for (temp, con) in temps {
            templates.insert(
                temp,
                TemplateMap {
                    category: cat,
                    template: temp,
                },
            );

            if let Some(aliases) = &con.aliases {
                for alias in aliases {
                    templates.insert(
                        alias,
                        TemplateMap {
                            category: cat,
                            template: temp,
                        },
                    );
                }
            }
        }
    }

    let template = templates
        .get(template.as_str())
        .ok_or_else(|| anyhow!("Template not found"))?;
    let category = cfg
        .categories
        .get(template.category)
        .ok_or_else(|| anyhow!("Category not found"))?;

    let mut variables = cfg.variables.clone();
    variables.insert("name".to_string(), name.clone());

    let source_extension = match cfg.project.language.as_str() {
        "ts" => "ts",
        "js" => match cfg.project.module_system.as_str() {
            "cjs" => "cjs",
            "esm" => "mjs",
            _ => bail!("Config: Invalid module system"),
        },
        _ => bail!("Config: Invalid language"),
    };

    let source = fs::read_to_string(
        env::current_dir()?
            .join(".sapphire/templates")
            .join(&category.source_path)
            .join(&format!("{}.{}", template.template, source_extension)),
    )?;

    let re = Regex::new(r"/\*\{\{(\w+)}}\*/")?;

    let output = re.replace_all(&source, |caps: &Captures| match variables.get(&caps[1]) {
        Some(value) => value.clone(),
        None => {
            println!("Variable not found: {}. Skipping.", &caps[1]);
            let formatted = format!("/*{{{{{}}}}}*/", &caps[1]);
            formatted
        }
    });

    let output_extension = cfg.project.language;

    fs::write(
        env::current_dir()?
            .join(&cfg.project.base)
            .join(&category.target_path)
            .join(&format!("{}.{}", name, &output_extension)),
        output.as_ref(),
    )?;

    Ok(())
}

struct TemplateMap<'a> {
    category: &'a str,
    template: &'a str,
}
