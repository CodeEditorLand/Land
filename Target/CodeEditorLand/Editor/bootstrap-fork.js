import * as performance from './vs/base/common/performance.js';
import { removeGlobalNodeJsModuleLookupPaths, devInjectNodeModuleLookupPath } from './bootstrap-node.js';
import { bootstrapESM } from './bootstrap-esm.js';
performance.mark('code/fork/start');
function pipeLoggingToParent() {
    const MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;
    const MAX_LENGTH = 100000;
    function safeToString(args) {
        const seen = [];
        const argsArray = [];
        if (args.length) {
            for (let i = 0; i < args.length; i++) {
                let arg = args[i];
                if (typeof arg === 'undefined') {
                    arg = 'undefined';
                }
                else if (arg instanceof Error) {
                    const errorObj = arg;
                    if (errorObj.stack) {
                        arg = errorObj.stack;
                    }
                    else {
                        arg = errorObj.toString();
                    }
                }
                argsArray.push(arg);
            }
        }
        try {
            const res = JSON.stringify(argsArray, function (key, value) {
                if (isObject(value) || Array.isArray(value)) {
                    if (seen.indexOf(value) !== -1) {
                        return '[Circular]';
                    }
                    seen.push(value);
                }
                return value;
            });
            if (res.length > MAX_LENGTH) {
                return 'Output omitted for a large object that exceeds the limits';
            }
            return res;
        }
        catch (error) {
            return `Output omitted for an object that cannot be inspected ('${error.toString()}')`;
        }
    }
    function safeSend(arg) {
        try {
            if (process.send) {
                process.send(arg);
            }
        }
        catch (error) {
        }
    }
    function isObject(obj) {
        return typeof obj === 'object'
            && obj !== null
            && !Array.isArray(obj)
            && !(obj instanceof RegExp)
            && !(obj instanceof Date);
    }
    function safeSendConsoleMessage(severity, args) {
        safeSend({ type: '__$console', severity, arguments: args });
    }
    function wrapConsoleMethod(method, severity) {
        Object.defineProperty(console, method, {
            set: () => { },
            get: () => function () { safeSendConsoleMessage(severity, safeToString(arguments)); },
        });
    }
    function wrapStream(streamName, severity) {
        const stream = process[streamName];
        const original = stream.write;
        let buf = '';
        Object.defineProperty(stream, 'write', {
            set: () => { },
            get: () => (chunk, encoding, callback) => {
                buf += chunk.toString(encoding);
                const eol = buf.length > MAX_STREAM_BUFFER_LENGTH ? buf.length : buf.lastIndexOf('\n');
                if (eol !== -1) {
                    console[severity](buf.slice(0, eol));
                    buf = buf.slice(eol + 1);
                }
                original.call(stream, chunk, encoding, callback);
            },
        });
    }
    if (process.env['VSCODE_VERBOSE_LOGGING'] === 'true') {
        wrapConsoleMethod('info', 'log');
        wrapConsoleMethod('log', 'log');
        wrapConsoleMethod('warn', 'warn');
        wrapConsoleMethod('error', 'error');
    }
    else {
        console.log = function () { };
        console.warn = function () { };
        console.info = function () { };
        wrapConsoleMethod('error', 'error');
    }
    wrapStream('stderr', 'error');
    wrapStream('stdout', 'log');
}
function handleExceptions() {
    process.on('uncaughtException', function (err) {
        console.error('Uncaught Exception: ', err);
    });
    process.on('unhandledRejection', function (reason) {
        console.error('Unhandled Promise Rejection: ', reason);
    });
}
function terminateWhenParentTerminates() {
    const parentPid = Number(process.env['VSCODE_PARENT_PID']);
    if (typeof parentPid === 'number' && !isNaN(parentPid)) {
        setInterval(function () {
            try {
                process.kill(parentPid, 0);
            }
            catch (e) {
                process.exit();
            }
        }, 5000);
    }
}
function configureCrashReporter() {
    const crashReporterProcessType = process.env['VSCODE_CRASH_REPORTER_PROCESS_TYPE'];
    if (crashReporterProcessType) {
        try {
            if (process['crashReporter'] && typeof process['crashReporter'].addExtraParameter === 'function') {
                process['crashReporter'].addExtraParameter('processType', crashReporterProcessType);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}
configureCrashReporter();
removeGlobalNodeJsModuleLookupPaths();
if (process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH']) {
    devInjectNodeModuleLookupPath(process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH']);
}
if (!!process.send && process.env['VSCODE_PIPE_LOGGING'] === 'true') {
    pipeLoggingToParent();
}
if (!process.env['VSCODE_HANDLES_UNCAUGHT_ERRORS']) {
    handleExceptions();
}
if (process.env['VSCODE_PARENT_PID']) {
    terminateWhenParentTerminates();
}
await bootstrapESM();
await import([`./${process.env['VSCODE_ESM_ENTRYPOINT']}.js`].join('/'));
