use console::Style;
use std::fs;
use std::path::PathBuf;

pub fn copy(from: &PathBuf, to: &PathBuf, extensions: Option<&Vec<&str>>) -> std::io::Result<u64> {
    if from.is_file() {
        if extensions.is_some()
            && from.extension().is_some()
            && !extensions
                .unwrap()
                .contains(&from.extension().unwrap().to_str().unwrap())
        {
            return Ok(0);
        }

        fs::copy(from, to)
    } else if from.is_dir() {
        if to.exists() && !to.is_dir() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Cannot copy directory to file",
            ));
        } else if !to.exists() {
            fs::create_dir(to)?;
        }

        for entry in fs::read_dir(from)? {
            let entry = entry?;
            let path = entry.path();
            let new_path = to.join(path.file_name().unwrap());

            copy(&path, &new_path, extensions)?;
        }

        Ok(0)
    } else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Cannot read file, missing permissions?",
        ));
    }
}

// Ported from https://github.com/unjs/consola/blob/54bf971d5ccae00cac7a12646783462b74c85fc4/src/utils/box.ts

pub fn console_box(lines: &[&str], title: Option<&str>) {
    let green = Style::new().green();
    let cyan = Style::new().cyan();

    let box_tl = "╭";
    let box_tr = "╮";
    let box_bl = "╰";
    let box_br = "╯";
    let box_h = "─";
    let box_v = "│";

    let mut box_lines: Vec<String> = vec![];
    let max_len = lines
        .iter()
        .map(|line| line.len())
        .max()
        .unwrap()
        .max(title.unwrap_or("").len());

    let padding_offset = 2;
    let margin_left = 1;
    let margin_top = 1;
    let margin_bottom = 1;
    let height = lines.len() + padding_offset;
    let width = max_len + padding_offset;
    let width_offset = width + padding_offset;
    let valign_offset: usize = (height - lines.len()) / 2;

    let left_space = " ".repeat(margin_left);

    for _ in 0..margin_top {
        box_lines.push("".to_string());
    }

    if let Some(title) = title {
        let left = box_h.repeat((width - title.len()) / 2);
        let right = box_h.repeat(((width - title.len()) / 2) + padding_offset);

        box_lines.push(format!(
            "{}{}{}{}{}{}",
            left_space,
            green.apply_to(box_tl),
            green.apply_to(left),
            cyan.apply_to(title),
            green.apply_to(right),
            green.apply_to(box_tr)
        ));
    } else {
        box_lines.push(format!(
            "{}{}{}{}",
            left_space,
            green.apply_to(box_tl),
            green.apply_to(box_h.repeat(width_offset)),
            green.apply_to(box_tr)
        ));
    }

    for i in 0..height {
        if i < valign_offset || i >= valign_offset + lines.len() {
            box_lines.push(format!(
                "{}{}{}{}",
                left_space,
                green.apply_to(box_v),
                " ".repeat(width_offset),
                green.apply_to(box_v)
            ));
        } else {
            let line = lines[i - valign_offset];
            let left = " ".repeat(padding_offset);
            let right = " ".repeat(width - line.len());
            box_lines.push(format!(
                "{}{}{}{}{}{}",
                left_space,
                green.apply_to(box_v),
                left,
                cyan.apply_to(line),
                right,
                green.apply_to(box_v)
            ));
        }
    }

    box_lines.push(format!(
        "{}{}{}{}",
        left_space,
        green.apply_to(box_bl),
        green.apply_to(box_h.repeat(width_offset)),
        green.apply_to(box_br)
    ));

    for _ in 0..margin_bottom {
        box_lines.push("".to_string());
    }

    for line in box_lines {
        println!("{}", line);
    }
}
