use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Config {
    pub project: Project,
    pub variables: HashMap<String, String>,
    pub categories: HashMap<String, Category>,
    pub templates: HashMap<String, Template>,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Project {
    pub language: String,
    pub module_system: String,
    pub base: String,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Category {
    pub path: String,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Template {
    pub category: String,
    pub aliases: Vec<String>,
}
