mod commands;
mod config;
mod utils;

use clap::{Parser, Subcommand};
use anyhow::Result;

#[derive(Parser)]
#[command(version, about, long_about = None, arg_required_else_help = true)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>
}

#[derive(Subcommand)]
enum Commands {
    New { name: Option<String> },
    Generate { template: String, name: String },
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match &cli.command {
        Some(Commands::New { name }) => commands::new::run(name),
        Some(Commands::Generate { template, name }) => commands::generate::run(template, name),
        None => Ok(()),
    }
}
