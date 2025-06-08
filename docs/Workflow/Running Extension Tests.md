### **Workflow Example #10: Running Extension Tests**

**Goal:** An extension developer wants to run automated tests for their
extension. They trigger a command that launches a new, clean instance of the
application (the "Extension Development Host"), runs the extension's tests
within it, and reports the results.

---

#### **Phase 1: Test Discovery and Command Registration**

1.  **Extension Manifest (`package.json`)**

    - **Action:** The extension being developed includes a `"test"` script in
      its `package.json`, for example: `"test": "node ./test/runTest.js"`.
    - The extension also contributes a command, such as
      `"command": "my-extension.runTests"`, which will be the entry point for
      its test runner.

2.  **Launching the "Main" Instance**
    - **Action:** The developer launches `Mountain` with special flags pointing
      to the extension they are developing (e.g.,
      `mountain --extensionDevelopmentPath /path/to/my-extension`).
    - The `ExtensionHost` in `Cocoon` activates this extension in "development
      mode".

#### **Phase 2: Initiating the Test Run**

3.  **User Action**

    - **Action:** The developer uses the Command Palette (`Ctrl+Shift+P`) in the
      main `Mountain` window and executes a command like "Run Tests".
    - This command is handled by a "Test Runner" service within `Mountain`.

4.  **Test Runner Service (`Mountain`)**

    - **Action:** The test runner service prepares to launch a _second_,
      separate instance of the application.
    - **Crucial Step:** It constructs a special set of arguments and environment
      variables for this new instance. These will include:
        - `--extensionDevelopmentPath`: The path to the extension under test.
        - `--extensionTestsPath`: A path to a test runner script (e.g.,
          `/path/to/my-extension/out/test/suite/index.js`).
        - `VSCODE_IPC_HOOK_CLI`: A special environment variable that tells the
          new `Cocoon` instance it is running in "test mode".

5.  **Spawning the Test Host (`Mountain`)**
    - **Action:** The Test Runner Service spawns a new `Mountain` process using
      these special arguments. This new instance is the **"Extension Development
      Host"**.

#### **Phase 3: Test Execution in the Development Host**

6.  **Test Host Startup (`Mountain` Test Instance)**

    - **Action:** The new `Mountain` instance starts up. It sees the
      `--extension...` flags and knows it's a test instance.
    - It launches its own `Cocoon` sidecar, passing along the special
      environment variables, including `VSCODE_IPC_HOOK_CLI`.

7.  **Test Mode Activation (`Cocoon` Test Instance)**

    - **Action:** The test `Cocoon` instance starts.
    - Its `bootstrap` logic detects `VSCODE_IPC_HOOK_CLI`. This tells it not to
      run as a normal extension host, but as a special **CLI test runner**.
    - It does _not_ start its normal gRPC server or wait for the
      `initExtensionHost` handshake.

8.  **Test Runner Script (`Cocoon` Test Instance)**

    - **Action:** Instead of starting the extension host, the test `Cocoon`
      process `require`s and executes the script specified by the
      `--extensionTestsPath` argument.
    - This script is typically a test runner like `mocha`.

9.  **Mocha Test Execution (`Cocoon` Test Instance)**

    - **Action:** The `mocha` runner starts.
    - It loads the extension's test files (e.g., `my-extension.test.js`).
    - Each test file will contain code like:

        ```typescript
        import * as assert from "assert";
        import * as vscode from "vscode";

        test("My Extension Feature", async () => {
        	await vscode.commands.executeCommand("my-extension.doSomething");
        	const document = vscode.workspace.textDocuments[0];
        	assert.strictEqual(document.getText(), "Expected Result");
        });
        ```

    - **Crucial Step:** The `require('vscode')` call inside the test is
      intercepted by a special, lightweight version of the `RequireInterceptor`.
      This version connects back to the **main `Mountain` instance** (the one
      the developer is looking at), not the test instance. This allows the tests
      to drive the UI of the main window.

#### **Phase 4: Remote Control and Result Reporting**

10. **Test API Execution (`Cocoon` Test Instance -> `Mountain` Main Instance)**

    - **Action:** When the test code calls
      `vscode.commands.executeCommand(...)`, the lightweight test `vscode` shim
      sends a gRPC request **back to the original `Mountain` instance's gRPC
      server.**
    - The main `Mountain` instance receives this request and executes the
      command, just as if it had come from its own `Cocoon` instance. The UI of
      the main window updates, files are opened, etc.
    - The result is sent back to the test `Cocoon` instance.

11. **Test Assertion**

    - **Action:** The `executeCommand` promise resolves in the test `Cocoon`
      instance.
    - The test proceeds to the next line, e.g.,
      `vscode.workspace.textDocuments[0]`. This is another gRPC call to the main
      `Mountain` instance to get the state of its documents.
    - The `assert` call checks if the state of the main application is as
      expected.

12. **Test Completion and Reporting**
    - **Action:** The `mocha` runner completes all tests. It aggregates the
      number of passes and failures.
    - It prints the results to its `stdout` and exits with a specific code
      (e.g., `0` for success, `1` for failure).
    - The main `Mountain` instance's Test Runner Service was monitoring the test
      process's `stdout` and exit code.
    - It parses the test results from the output.
    - **It displays a notification in the main window's UI: "Tests finished: 10
      passed, 0 failed."** The test run is complete.
