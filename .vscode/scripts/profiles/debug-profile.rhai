//=============================================================================//
// Rhai Script: Debug Profile Configuration
//=============================================================================//
// Profile: Debug
//
// Description: Debug build profile with full logging and development features.
// This script allows dynamic environment variable calculation without
// recompiling the Rust maintain crate.
//
// Usage:
//   - Loaded by the Maintain Build crate during build orchestration
//   - Returns environment variables that can override or extend static config
//   - Can include conditional logic based on system state
//
// Exports:
//   - get_env_vars(): Returns a map of environment variables
//   - pre_build_hook(): Called before build starts
//   - post_build_hook(result): Called after build completes
//=============================================================================//

/// Get environment variables for debug build.
///
/// Returns: Map of environment variable name to value
fn get_env_vars() {
    let vars = new_map();

    // Build configuration
    vars["Debug"] = "true";
    vars["Browser"] = "true";
    vars["Bundle"] = "true";
    vars["Clean"] = "true";
    vars["Compile"] = "false";

    // Node.js configuration for development
    vars["NODE_ENV"] = "development";
    vars["NODE_VERSION"] = "22";
    vars["NODE_OPTIONS"] = "--max-old-space-size=16384";

    // Logging - most verbose
    vars["RUST_LOG"] = "debug";
    vars["AIR_LOG_JSON"] = "false";
    vars["AIR_LOG_FILE"] = "";

    // Dependency configuration
    vars["Dependency"] = "Microsoft/VSCode";
    vars["Level"] = "silent";

    vars
}

/// Pre-build hook - executed before build starts.
///
/// Can be used to:
/// - Validate environment
/// - Print build information
/// - Perform setup tasks
///
/// Returns: true to continue, false to abort
fn pre_build_hook() {
    print("=== Starting Debug Build ===");
    print("Profile: Debug");
    print("NODE_ENV: development");
    print("NODE_VERSION: 22");
    true
}

/// Post-build hook - executed after build completes.
///
/// Can be used to:
/// - Print build results
/// - Run post-build tasks
/// - Validate build artifacts
///
/// Args:
///   result: Build result object with fields:
///     - success: bool
///     - duration: number
///     - stdout: string
///     - stderr: string
///
/// Returns: Build result (possibly modified)
fn post_build_hook(result) {
    if result.success == true {
        print("=== Debug Build Completed Successfully ===");
        print(`Build duration: ${result.duration}ms`);
    } else {
        print("=== Debug Build Failed ===");
        print(result.stderr);
    }
    result
}

/// Validate environment requirements for this profile.
///
/// Returns: true if environment is valid, false otherwise
fn validate_environment() {
    // Check for required tools, paths, etc.
    // This can be extended with custom validation logic
    true
}

export get_env_vars, pre_build_hook, post_build_hook, validate_environment;
