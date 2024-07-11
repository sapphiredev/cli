use std::path::PathBuf;

pub enum Tasks<'a> {
    Clone(CloneTask<'a>),
    Mkdir(MkdirTask<'a>),
    Copy(CopyTask<'a>),
    Rm(RmTask<'a>),
    SetupPackageJson(SetupPackageJsonTask<'a>),
}
pub struct CloneTask<'a> {
    pub repo_url: &'a str,
    pub clone_into: &'a PathBuf,
}

pub struct MkdirTask<'a> {
    pub path: &'a PathBuf,
}

pub struct CopyTask<'a> {
    pub from: &'a PathBuf,
    pub to: &'a PathBuf,
}

pub struct RmTask<'a> {
    pub path: &'a PathBuf,
    pub dir: bool,
}

pub struct SetupPackageJsonTask<'a> {
    pub path: &'a PathBuf,
    pub project_name: &'a str,
    pub setup_for_tsup: bool,
    pub setup_for_swc: bool,
    pub esm: bool,
}