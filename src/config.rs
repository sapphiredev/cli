use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Config {
    pub project: Project,
    pub variables: HashMap<String, String>,
    pub categories: HashMap<String, Category>,
    pub templates: HashMap<String, HashMap<String, Template>>,
}

impl Config {
    pub fn load() -> Result<Self> {
        let config = std::fs::read_to_string("sapphire.toml")?;
        Ok(toml::from_str(&config)?)
    }
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Project {
    pub language: String,
    pub module_system: String,
    pub base: String,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Category {
    pub source_path: String,
    pub target_path: String,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Template {
    pub aliases: Option<Vec<String>>,
}
