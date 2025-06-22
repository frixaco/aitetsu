pub fn read_file(cwd: &String, args: ReadFileToolArgs) -> Result<String, String> {
    let full_path = format!("{}/{}", cwd, args.path);
    println!("Attempting to read file: {}", full_path);
    match fs::read_to_string(&full_path) {
        Ok(v) => {
            println!("Successfully read file: {}", full_path);
            Ok(v)
        }
        Err(e) => {
            println!("Failed to read file {}: {}", full_path, e);
            Err(format!("Failed to read {}: {}", args.path, e))
        }
    }
}
