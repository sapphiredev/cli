mod commands;
mod config;
mod utils;

use anyhow::Result;
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(version, about, long_about = None, arg_required_else_help = true)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    New { name: Option<String> },
    Generate { template: String, name: String },
    Migrate,
    Init,
}

pub const EXAMPLES_REPO_URL: &str = "https://github.com/enxg/sapphire-examples.git";

fn main() -> Result<()> {
    let cli = Cli::parse();

    match &cli.command {
        Some(Commands::New { name }) => commands::new::run(name),
        Some(Commands::Generate { template, name }) => commands::generate::run(template, name),
        Some(Commands::Migrate) => commands::migrate::run(),
        Some(Commands::Init) => commands::init::run(),
        None => Ok(()),
    }
}