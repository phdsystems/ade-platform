use clap::{Parser, Subcommand};
use serde::Serialize;
use anyhow::Result;

#[derive(Parser, Debug)]
#[command(name="phd-core")]
struct Cli { #[command(subcommand)] cmd: Cmd }
#[derive(Subcommand,Debug)]
enum Cmd {
  Scaffold {
    #[arg(long)] language: String,
    #[arg(long)] framework: String,
    #[arg(long)] service: String,
    #[arg(long)] domain: String,
    #[arg(long, default_value_t=false)] preview: bool,
    #[arg(long, default_value="cli/config/stack-registry.json")] registry: String,
    #[arg(long)] with: Option<String>
  }
}
#[derive(Serialize)]
struct Preview { language:String, framework:String, service:String, domain:String, folders:Vec<String>, files:Vec<String>, notes:Vec<String> }

fn main() -> Result<()> {
  let cli = Cli::parse();
  match cli.cmd {
    Cmd::Scaffold { language, framework, service, domain, .. } => {
      let p = Preview{
        language, framework, service: service.clone(), domain: domain.clone(),
        folders: vec![format!("{}/src", domain), format!("{}/docs", domain), format!("{}/tests", domain), format!("{}/deploy", domain)],
        files: vec![format!("{}/src/README.md", domain)],
        notes: vec!["preview only".into()]
      };
      serde_json::to_writer(std::io::stdout(), &p)?;
    }
  }
  Ok(())
}
