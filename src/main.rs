mod commands;
mod task_runner;

use clap::{Parser, Subcommand, Args};

#[derive(Parser)]
#[command(version, about, long_about = None, arg_required_else_help = true)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>
}

#[derive(Subcommand)]
enum Commands {
    New {
        name: Option<String>
    }
}

fn main() {
    let cli = Cli::parse();
    
    match &cli.command {
        Some(Commands::New { name }) => commands::new::run(name),
        None => {}
    }
    
    
}
