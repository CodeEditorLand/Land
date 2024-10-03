import * as nls from '../../../../nls.js';
import * as Objects from '../../../../base/common/objects.js';
import * as Types from '../../../../base/common/types.js';
import * as UUID from '../../../../base/common/uuid.js';
import { ProblemMatcherParser, isNamedProblemMatcher, ProblemMatcherRegistry } from './problemMatcher.js';
import * as Tasks from './tasks.js';
import { TaskDefinitionRegistry } from './taskDefinitionRegistry.js';
import { ShellExecutionSupportedContext, ProcessExecutionSupportedContext } from './taskService.js';
export var ITaskIdentifier;
(function (ITaskIdentifier) {
    function is(value) {
        const candidate = value;
        return candidate !== undefined && Types.isString(value.type);
    }
    ITaskIdentifier.is = is;
})(ITaskIdentifier || (ITaskIdentifier = {}));
export var CommandString;
(function (CommandString) {
    function value(value) {
        if (Types.isString(value)) {
            return value;
        }
        else if (Types.isStringArray(value)) {
            return value.join(' ');
        }
        else {
            if (Types.isString(value.value)) {
                return value.value;
            }
            else {
                return value.value.join(' ');
            }
        }
    }
    CommandString.value = value;
})(CommandString || (CommandString = {}));
var ProblemMatcherKind;
(function (ProblemMatcherKind) {
    ProblemMatcherKind[ProblemMatcherKind["Unknown"] = 0] = "Unknown";
    ProblemMatcherKind[ProblemMatcherKind["String"] = 1] = "String";
    ProblemMatcherKind[ProblemMatcherKind["ProblemMatcher"] = 2] = "ProblemMatcher";
    ProblemMatcherKind[ProblemMatcherKind["Array"] = 3] = "Array";
})(ProblemMatcherKind || (ProblemMatcherKind = {}));
const EMPTY_ARRAY = [];
Object.freeze(EMPTY_ARRAY);
function assignProperty(target, source, key) {
    const sourceAtKey = source[key];
    if (sourceAtKey !== undefined) {
        target[key] = sourceAtKey;
    }
}
function fillProperty(target, source, key) {
    const sourceAtKey = source[key];
    if (target[key] === undefined && sourceAtKey !== undefined) {
        target[key] = sourceAtKey;
    }
}
function _isEmpty(value, properties, allowEmptyArray = false) {
    if (value === undefined || value === null || properties === undefined) {
        return true;
    }
    for (const meta of properties) {
        const property = value[meta.property];
        if (property !== undefined && property !== null) {
            if (meta.type !== undefined && !meta.type.isEmpty(property)) {
                return false;
            }
            else if (!Array.isArray(property) || (property.length > 0) || allowEmptyArray) {
                return false;
            }
        }
    }
    return true;
}
function _assignProperties(target, source, properties) {
    if (!source || _isEmpty(source, properties)) {
        return target;
    }
    if (!target || _isEmpty(target, properties)) {
        return source;
    }
    for (const meta of properties) {
        const property = meta.property;
        let value;
        if (meta.type !== undefined) {
            value = meta.type.assignProperties(target[property], source[property]);
        }
        else {
            value = source[property];
        }
        if (value !== undefined && value !== null) {
            target[property] = value;
        }
    }
    return target;
}
function _fillProperties(target, source, properties, allowEmptyArray = false) {
    if (!source || _isEmpty(source, properties)) {
        return target;
    }
    if (!target || _isEmpty(target, properties, allowEmptyArray)) {
        return source;
    }
    for (const meta of properties) {
        const property = meta.property;
        let value;
        if (meta.type) {
            value = meta.type.fillProperties(target[property], source[property]);
        }
        else if (target[property] === undefined) {
            value = source[property];
        }
        if (value !== undefined && value !== null) {
            target[property] = value;
        }
    }
    return target;
}
function _fillDefaults(target, defaults, properties, context) {
    if (target && Object.isFrozen(target)) {
        return target;
    }
    if (target === undefined || target === null || defaults === undefined || defaults === null) {
        if (defaults !== undefined && defaults !== null) {
            return Objects.deepClone(defaults);
        }
        else {
            return undefined;
        }
    }
    for (const meta of properties) {
        const property = meta.property;
        if (target[property] !== undefined) {
            continue;
        }
        let value;
        if (meta.type) {
            value = meta.type.fillDefaults(target[property], context);
        }
        else {
            value = defaults[property];
        }
        if (value !== undefined && value !== null) {
            target[property] = value;
        }
    }
    return target;
}
function _freeze(target, properties) {
    if (target === undefined || target === null) {
        return undefined;
    }
    if (Object.isFrozen(target)) {
        return target;
    }
    for (const meta of properties) {
        if (meta.type) {
            const value = target[meta.property];
            if (value) {
                meta.type.freeze(value);
            }
        }
    }
    Object.freeze(target);
    return target;
}
export var RunOnOptions;
(function (RunOnOptions) {
    function fromString(value) {
        if (!value) {
            return Tasks.RunOnOptions.default;
        }
        switch (value.toLowerCase()) {
            case 'folderopen':
                return Tasks.RunOnOptions.folderOpen;
            case 'default':
            default:
                return Tasks.RunOnOptions.default;
        }
    }
    RunOnOptions.fromString = fromString;
})(RunOnOptions || (RunOnOptions = {}));
export var RunOptions;
(function (RunOptions) {
    const properties = [{ property: 'reevaluateOnRerun' }, { property: 'runOn' }, { property: 'instanceLimit' }];
    function fromConfiguration(value) {
        return {
            reevaluateOnRerun: value ? value.reevaluateOnRerun : true,
            runOn: value ? RunOnOptions.fromString(value.runOn) : Tasks.RunOnOptions.default,
            instanceLimit: value ? value.instanceLimit : 1
        };
    }
    RunOptions.fromConfiguration = fromConfiguration;
    function assignProperties(target, source) {
        return _assignProperties(target, source, properties);
    }
    RunOptions.assignProperties = assignProperties;
    function fillProperties(target, source) {
        return _fillProperties(target, source, properties);
    }
    RunOptions.fillProperties = fillProperties;
})(RunOptions || (RunOptions = {}));
var ShellConfiguration;
(function (ShellConfiguration) {
    const properties = [{ property: 'executable' }, { property: 'args' }, { property: 'quoting' }];
    function is(value) {
        const candidate = value;
        return candidate && (Types.isString(candidate.executable) || Types.isStringArray(candidate.args));
    }
    ShellConfiguration.is = is;
    function from(config, context) {
        if (!is(config)) {
            return undefined;
        }
        const result = {};
        if (config.executable !== undefined) {
            result.executable = config.executable;
        }
        if (config.args !== undefined) {
            result.args = config.args.slice();
        }
        if (config.quoting !== undefined) {
            result.quoting = Objects.deepClone(config.quoting);
        }
        return result;
    }
    ShellConfiguration.from = from;
    function isEmpty(value) {
        return _isEmpty(value, properties, true);
    }
    ShellConfiguration.isEmpty = isEmpty;
    function assignProperties(target, source) {
        return _assignProperties(target, source, properties);
    }
    ShellConfiguration.assignProperties = assignProperties;
    function fillProperties(target, source) {
        return _fillProperties(target, source, properties, true);
    }
    ShellConfiguration.fillProperties = fillProperties;
    function fillDefaults(value, context) {
        return value;
    }
    ShellConfiguration.fillDefaults = fillDefaults;
    function freeze(value) {
        if (!value) {
            return undefined;
        }
        return Object.freeze(value);
    }
    ShellConfiguration.freeze = freeze;
})(ShellConfiguration || (ShellConfiguration = {}));
var CommandOptions;
(function (CommandOptions) {
    const properties = [{ property: 'cwd' }, { property: 'env' }, { property: 'shell', type: ShellConfiguration }];
    const defaults = { cwd: '${workspaceFolder}' };
    function from(options, context) {
        const result = {};
        if (options.cwd !== undefined) {
            if (Types.isString(options.cwd)) {
                result.cwd = options.cwd;
            }
            else {
                context.taskLoadIssues.push(nls.localize('ConfigurationParser.invalidCWD', 'Warning: options.cwd must be of type string. Ignoring value {0}\n', options.cwd));
            }
        }
        if (options.env !== undefined) {
            result.env = Objects.deepClone(options.env);
        }
        result.shell = ShellConfiguration.from(options.shell, context);
        return isEmpty(result) ? undefined : result;
    }
    CommandOptions.from = from;
    function isEmpty(value) {
        return _isEmpty(value, properties);
    }
    CommandOptions.isEmpty = isEmpty;
    function assignProperties(target, source) {
        if ((source === undefined) || isEmpty(source)) {
            return target;
        }
        if ((target === undefined) || isEmpty(target)) {
            return source;
        }
        assignProperty(target, source, 'cwd');
        if (target.env === undefined) {
            target.env = source.env;
        }
        else if (source.env !== undefined) {
            const env = Object.create(null);
            if (target.env !== undefined) {
                Object.keys(target.env).forEach(key => env[key] = target.env[key]);
            }
            if (source.env !== undefined) {
                Object.keys(source.env).forEach(key => env[key] = source.env[key]);
            }
            target.env = env;
        }
        target.shell = ShellConfiguration.assignProperties(target.shell, source.shell);
        return target;
    }
    CommandOptions.assignProperties = assignProperties;
    function fillProperties(target, source) {
        return _fillProperties(target, source, properties);
    }
    CommandOptions.fillProperties = fillProperties;
    function fillDefaults(value, context) {
        return _fillDefaults(value, defaults, properties, context);
    }
    CommandOptions.fillDefaults = fillDefaults;
    function freeze(value) {
        return _freeze(value, properties);
    }
    CommandOptions.freeze = freeze;
})(CommandOptions || (CommandOptions = {}));
var CommandConfiguration;
(function (CommandConfiguration) {
    let PresentationOptions;
    (function (PresentationOptions) {
        const properties = [{ property: 'echo' }, { property: 'reveal' }, { property: 'revealProblems' }, { property: 'focus' }, { property: 'panel' }, { property: 'showReuseMessage' }, { property: 'clear' }, { property: 'group' }, { property: 'close' }];
        function from(config, context) {
            let echo;
            let reveal;
            let revealProblems;
            let focus;
            let panel;
            let showReuseMessage;
            let clear;
            let group;
            let close;
            let hasProps = false;
            if (Types.isBoolean(config.echoCommand)) {
                echo = config.echoCommand;
                hasProps = true;
            }
            if (Types.isString(config.showOutput)) {
                reveal = Tasks.RevealKind.fromString(config.showOutput);
                hasProps = true;
            }
            const presentation = config.presentation || config.terminal;
            if (presentation) {
                if (Types.isBoolean(presentation.echo)) {
                    echo = presentation.echo;
                }
                if (Types.isString(presentation.reveal)) {
                    reveal = Tasks.RevealKind.fromString(presentation.reveal);
                }
                if (Types.isString(presentation.revealProblems)) {
                    revealProblems = Tasks.RevealProblemKind.fromString(presentation.revealProblems);
                }
                if (Types.isBoolean(presentation.focus)) {
                    focus = presentation.focus;
                }
                if (Types.isString(presentation.panel)) {
                    panel = Tasks.PanelKind.fromString(presentation.panel);
                }
                if (Types.isBoolean(presentation.showReuseMessage)) {
                    showReuseMessage = presentation.showReuseMessage;
                }
                if (Types.isBoolean(presentation.clear)) {
                    clear = presentation.clear;
                }
                if (Types.isString(presentation.group)) {
                    group = presentation.group;
                }
                if (Types.isBoolean(presentation.close)) {
                    close = presentation.close;
                }
                hasProps = true;
            }
            if (!hasProps) {
                return undefined;
            }
            return { echo: echo, reveal: reveal, revealProblems: revealProblems, focus: focus, panel: panel, showReuseMessage: showReuseMessage, clear: clear, group, close: close };
        }
        PresentationOptions.from = from;
        function assignProperties(target, source) {
            return _assignProperties(target, source, properties);
        }
        PresentationOptions.assignProperties = assignProperties;
        function fillProperties(target, source) {
            return _fillProperties(target, source, properties);
        }
        PresentationOptions.fillProperties = fillProperties;
        function fillDefaults(value, context) {
            const defaultEcho = context.engine === Tasks.ExecutionEngine.Terminal ? true : false;
            return _fillDefaults(value, { echo: defaultEcho, reveal: Tasks.RevealKind.Always, revealProblems: Tasks.RevealProblemKind.Never, focus: false, panel: Tasks.PanelKind.Shared, showReuseMessage: true, clear: false }, properties, context);
        }
        PresentationOptions.fillDefaults = fillDefaults;
        function freeze(value) {
            return _freeze(value, properties);
        }
        PresentationOptions.freeze = freeze;
        function isEmpty(value) {
            return _isEmpty(value, properties);
        }
        PresentationOptions.isEmpty = isEmpty;
    })(PresentationOptions = CommandConfiguration.PresentationOptions || (CommandConfiguration.PresentationOptions = {}));
    let ShellString;
    (function (ShellString) {
        function from(value) {
            if (value === undefined || value === null) {
                return undefined;
            }
            if (Types.isString(value)) {
                return value;
            }
            else if (Types.isStringArray(value)) {
                return value.join(' ');
            }
            else {
                const quoting = Tasks.ShellQuoting.from(value.quoting);
                const result = Types.isString(value.value) ? value.value : Types.isStringArray(value.value) ? value.value.join(' ') : undefined;
                if (result) {
                    return {
                        value: result,
                        quoting: quoting
                    };
                }
                else {
                    return undefined;
                }
            }
        }
        ShellString.from = from;
    })(ShellString || (ShellString = {}));
    const properties = [
        { property: 'runtime' }, { property: 'name' }, { property: 'options', type: CommandOptions },
        { property: 'args' }, { property: 'taskSelector' }, { property: 'suppressTaskName' },
        { property: 'presentation', type: PresentationOptions }
    ];
    function from(config, context) {
        let result = fromBase(config, context);
        let osConfig = undefined;
        if (config.windows && context.platform === 3) {
            osConfig = fromBase(config.windows, context);
        }
        else if (config.osx && context.platform === 1) {
            osConfig = fromBase(config.osx, context);
        }
        else if (config.linux && context.platform === 2) {
            osConfig = fromBase(config.linux, context);
        }
        if (osConfig) {
            result = assignProperties(result, osConfig, context.schemaVersion === 2);
        }
        return isEmpty(result) ? undefined : result;
    }
    CommandConfiguration.from = from;
    function fromBase(config, context) {
        const name = ShellString.from(config.command);
        let runtime;
        if (Types.isString(config.type)) {
            if (config.type === 'shell' || config.type === 'process') {
                runtime = Tasks.RuntimeType.fromString(config.type);
            }
        }
        if (Types.isBoolean(config.isShellCommand) || ShellConfiguration.is(config.isShellCommand)) {
            runtime = Tasks.RuntimeType.Shell;
        }
        else if (config.isShellCommand !== undefined) {
            runtime = !!config.isShellCommand ? Tasks.RuntimeType.Shell : Tasks.RuntimeType.Process;
        }
        const result = {
            name: name,
            runtime: runtime,
            presentation: PresentationOptions.from(config, context)
        };
        if (config.args !== undefined) {
            result.args = [];
            for (const arg of config.args) {
                const converted = ShellString.from(arg);
                if (converted !== undefined) {
                    result.args.push(converted);
                }
                else {
                    context.taskLoadIssues.push(nls.localize('ConfigurationParser.inValidArg', 'Error: command argument must either be a string or a quoted string. Provided value is:\n{0}', arg ? JSON.stringify(arg, undefined, 4) : 'undefined'));
                }
            }
        }
        if (config.options !== undefined) {
            result.options = CommandOptions.from(config.options, context);
            if (result.options && result.options.shell === undefined && ShellConfiguration.is(config.isShellCommand)) {
                result.options.shell = ShellConfiguration.from(config.isShellCommand, context);
                if (context.engine !== Tasks.ExecutionEngine.Terminal) {
                    context.taskLoadIssues.push(nls.localize('ConfigurationParser.noShell', 'Warning: shell configuration is only supported when executing tasks in the terminal.'));
                }
            }
        }
        if (Types.isString(config.taskSelector)) {
            result.taskSelector = config.taskSelector;
        }
        if (Types.isBoolean(config.suppressTaskName)) {
            result.suppressTaskName = config.suppressTaskName;
        }
        return isEmpty(result) ? undefined : result;
    }
    function hasCommand(value) {
        return value && !!value.name;
    }
    CommandConfiguration.hasCommand = hasCommand;
    function isEmpty(value) {
        return _isEmpty(value, properties);
    }
    CommandConfiguration.isEmpty = isEmpty;
    function assignProperties(target, source, overwriteArgs) {
        if (isEmpty(source)) {
            return target;
        }
        if (isEmpty(target)) {
            return source;
        }
        assignProperty(target, source, 'name');
        assignProperty(target, source, 'runtime');
        assignProperty(target, source, 'taskSelector');
        assignProperty(target, source, 'suppressTaskName');
        if (source.args !== undefined) {
            if (target.args === undefined || overwriteArgs) {
                target.args = source.args;
            }
            else {
                target.args = target.args.concat(source.args);
            }
        }
        target.presentation = PresentationOptions.assignProperties(target.presentation, source.presentation);
        target.options = CommandOptions.assignProperties(target.options, source.options);
        return target;
    }
    CommandConfiguration.assignProperties = assignProperties;
    function fillProperties(target, source) {
        return _fillProperties(target, source, properties);
    }
    CommandConfiguration.fillProperties = fillProperties;
    function fillGlobals(target, source, taskName) {
        if ((source === undefined) || isEmpty(source)) {
            return target;
        }
        target = target || {
            name: undefined,
            runtime: undefined,
            presentation: undefined
        };
        if (target.name === undefined) {
            fillProperty(target, source, 'name');
            fillProperty(target, source, 'taskSelector');
            fillProperty(target, source, 'suppressTaskName');
            let args = source.args ? source.args.slice() : [];
            if (!target.suppressTaskName && taskName) {
                if (target.taskSelector !== undefined) {
                    args.push(target.taskSelector + taskName);
                }
                else {
                    args.push(taskName);
                }
            }
            if (target.args) {
                args = args.concat(target.args);
            }
            target.args = args;
        }
        fillProperty(target, source, 'runtime');
        target.presentation = PresentationOptions.fillProperties(target.presentation, source.presentation);
        target.options = CommandOptions.fillProperties(target.options, source.options);
        return target;
    }
    CommandConfiguration.fillGlobals = fillGlobals;
    function fillDefaults(value, context) {
        if (!value || Object.isFrozen(value)) {
            return;
        }
        if (value.name !== undefined && value.runtime === undefined) {
            value.runtime = Tasks.RuntimeType.Process;
        }
        value.presentation = PresentationOptions.fillDefaults(value.presentation, context);
        if (!isEmpty(value)) {
            value.options = CommandOptions.fillDefaults(value.options, context);
        }
        if (value.args === undefined) {
            value.args = EMPTY_ARRAY;
        }
        if (value.suppressTaskName === undefined) {
            value.suppressTaskName = (context.schemaVersion === 2);
        }
    }
    CommandConfiguration.fillDefaults = fillDefaults;
    function freeze(value) {
        return _freeze(value, properties);
    }
    CommandConfiguration.freeze = freeze;
})(CommandConfiguration || (CommandConfiguration = {}));
export var ProblemMatcherConverter;
(function (ProblemMatcherConverter) {
    function namedFrom(declares, context) {
        const result = Object.create(null);
        if (!Array.isArray(declares)) {
            return result;
        }
        declares.forEach((value) => {
            const namedProblemMatcher = (new ProblemMatcherParser(context.problemReporter)).parse(value);
            if (isNamedProblemMatcher(namedProblemMatcher)) {
                result[namedProblemMatcher.name] = namedProblemMatcher;
            }
            else {
                context.problemReporter.error(nls.localize('ConfigurationParser.noName', 'Error: Problem Matcher in declare scope must have a name:\n{0}\n', JSON.stringify(value, undefined, 4)));
            }
        });
        return result;
    }
    ProblemMatcherConverter.namedFrom = namedFrom;
    function fromWithOsConfig(external, context) {
        let result = {};
        if (external.windows && external.windows.problemMatcher && context.platform === 3) {
            result = from(external.windows.problemMatcher, context);
        }
        else if (external.osx && external.osx.problemMatcher && context.platform === 1) {
            result = from(external.osx.problemMatcher, context);
        }
        else if (external.linux && external.linux.problemMatcher && context.platform === 2) {
            result = from(external.linux.problemMatcher, context);
        }
        else if (external.problemMatcher) {
            result = from(external.problemMatcher, context);
        }
        return result;
    }
    ProblemMatcherConverter.fromWithOsConfig = fromWithOsConfig;
    function from(config, context) {
        const result = [];
        if (config === undefined) {
            return { value: result };
        }
        const errors = [];
        function addResult(matcher) {
            if (matcher.value) {
                result.push(matcher.value);
            }
            if (matcher.errors) {
                errors.push(...matcher.errors);
            }
        }
        const kind = getProblemMatcherKind(config);
        if (kind === ProblemMatcherKind.Unknown) {
            const error = nls.localize('ConfigurationParser.unknownMatcherKind', 'Warning: the defined problem matcher is unknown. Supported types are string | ProblemMatcher | Array<string | ProblemMatcher>.\n{0}\n', JSON.stringify(config, null, 4));
            context.problemReporter.warn(error);
        }
        else if (kind === ProblemMatcherKind.String || kind === ProblemMatcherKind.ProblemMatcher) {
            addResult(resolveProblemMatcher(config, context));
        }
        else if (kind === ProblemMatcherKind.Array) {
            const problemMatchers = config;
            problemMatchers.forEach(problemMatcher => {
                addResult(resolveProblemMatcher(problemMatcher, context));
            });
        }
        return { value: result, errors };
    }
    ProblemMatcherConverter.from = from;
    function getProblemMatcherKind(value) {
        if (Types.isString(value)) {
            return ProblemMatcherKind.String;
        }
        else if (Array.isArray(value)) {
            return ProblemMatcherKind.Array;
        }
        else if (!Types.isUndefined(value)) {
            return ProblemMatcherKind.ProblemMatcher;
        }
        else {
            return ProblemMatcherKind.Unknown;
        }
    }
    function resolveProblemMatcher(value, context) {
        if (Types.isString(value)) {
            let variableName = value;
            if (variableName.length > 1 && variableName[0] === '$') {
                variableName = variableName.substring(1);
                const global = ProblemMatcherRegistry.get(variableName);
                if (global) {
                    return { value: Objects.deepClone(global) };
                }
                let localProblemMatcher = context.namedProblemMatchers[variableName];
                if (localProblemMatcher) {
                    localProblemMatcher = Objects.deepClone(localProblemMatcher);
                    delete localProblemMatcher.name;
                    return { value: localProblemMatcher };
                }
            }
            return { errors: [nls.localize('ConfigurationParser.invalidVariableReference', 'Error: Invalid problemMatcher reference: {0}\n', value)] };
        }
        else {
            const json = value;
            return { value: new ProblemMatcherParser(context.problemReporter).parse(json) };
        }
    }
})(ProblemMatcherConverter || (ProblemMatcherConverter = {}));
export var GroupKind;
(function (GroupKind) {
    function from(external) {
        if (external === undefined) {
            return undefined;
        }
        else if (Types.isString(external) && Tasks.TaskGroup.is(external)) {
            return { _id: external, isDefault: false };
        }
        else if (Types.isString(external.kind) && Tasks.TaskGroup.is(external.kind)) {
            const group = external.kind;
            const isDefault = Types.isUndefined(external.isDefault) ? false : external.isDefault;
            return { _id: group, isDefault };
        }
        return undefined;
    }
    GroupKind.from = from;
    function to(group) {
        if (Types.isString(group)) {
            return group;
        }
        else if (!group.isDefault) {
            return group._id;
        }
        return {
            kind: group._id,
            isDefault: group.isDefault,
        };
    }
    GroupKind.to = to;
})(GroupKind || (GroupKind = {}));
var TaskDependency;
(function (TaskDependency) {
    function uriFromSource(context, source) {
        switch (source) {
            case TaskConfigSource.User: return Tasks.USER_TASKS_GROUP_KEY;
            case TaskConfigSource.TasksJson: return context.workspaceFolder.uri;
            default: return context.workspace && context.workspace.configuration ? context.workspace.configuration : context.workspaceFolder.uri;
        }
    }
    function from(external, context, source) {
        if (Types.isString(external)) {
            return { uri: uriFromSource(context, source), task: external };
        }
        else if (ITaskIdentifier.is(external)) {
            return {
                uri: uriFromSource(context, source),
                task: Tasks.TaskDefinition.createTaskIdentifier(external, context.problemReporter)
            };
        }
        else {
            return undefined;
        }
    }
    TaskDependency.from = from;
})(TaskDependency || (TaskDependency = {}));
var DependsOrder;
(function (DependsOrder) {
    function from(order) {
        switch (order) {
            case "sequence":
                return "sequence";
            case "parallel":
            default:
                return "parallel";
        }
    }
    DependsOrder.from = from;
})(DependsOrder || (DependsOrder = {}));
var ConfigurationProperties;
(function (ConfigurationProperties) {
    const properties = [
        { property: 'name' },
        { property: 'identifier' },
        { property: 'group' },
        { property: 'isBackground' },
        { property: 'promptOnClose' },
        { property: 'dependsOn' },
        { property: 'presentation', type: CommandConfiguration.PresentationOptions },
        { property: 'problemMatchers' },
        { property: 'options' },
        { property: 'icon' },
        { property: 'hide' }
    ];
    function from(external, context, includeCommandOptions, source, properties) {
        if (!external) {
            return {};
        }
        const result = {};
        if (properties) {
            for (const propertyName of Object.keys(properties)) {
                if (external[propertyName] !== undefined) {
                    result[propertyName] = Objects.deepClone(external[propertyName]);
                }
            }
        }
        if (Types.isString(external.taskName)) {
            result.name = external.taskName;
        }
        if (Types.isString(external.label) && context.schemaVersion === 2) {
            result.name = external.label;
        }
        if (Types.isString(external.identifier)) {
            result.identifier = external.identifier;
        }
        result.icon = external.icon;
        result.hide = external.hide;
        if (external.isBackground !== undefined) {
            result.isBackground = !!external.isBackground;
        }
        if (external.promptOnClose !== undefined) {
            result.promptOnClose = !!external.promptOnClose;
        }
        result.group = GroupKind.from(external.group);
        if (external.dependsOn !== undefined) {
            if (Array.isArray(external.dependsOn)) {
                result.dependsOn = external.dependsOn.reduce((dependencies, item) => {
                    const dependency = TaskDependency.from(item, context, source);
                    if (dependency) {
                        dependencies.push(dependency);
                    }
                    return dependencies;
                }, []);
            }
            else {
                const dependsOnValue = TaskDependency.from(external.dependsOn, context, source);
                result.dependsOn = dependsOnValue ? [dependsOnValue] : undefined;
            }
        }
        result.dependsOrder = DependsOrder.from(external.dependsOrder);
        if (includeCommandOptions && (external.presentation !== undefined || external.terminal !== undefined)) {
            result.presentation = CommandConfiguration.PresentationOptions.from(external, context);
        }
        if (includeCommandOptions && (external.options !== undefined)) {
            result.options = CommandOptions.from(external.options, context);
        }
        const configProblemMatcher = ProblemMatcherConverter.fromWithOsConfig(external, context);
        if (configProblemMatcher.value !== undefined) {
            result.problemMatchers = configProblemMatcher.value;
        }
        if (external.detail) {
            result.detail = external.detail;
        }
        return isEmpty(result) ? {} : { value: result, errors: configProblemMatcher.errors };
    }
    ConfigurationProperties.from = from;
    function isEmpty(value) {
        return _isEmpty(value, properties);
    }
    ConfigurationProperties.isEmpty = isEmpty;
})(ConfigurationProperties || (ConfigurationProperties = {}));
const label = 'Workspace';
var ConfiguringTask;
(function (ConfiguringTask) {
    const grunt = 'grunt.';
    const jake = 'jake.';
    const gulp = 'gulp.';
    const npm = 'vscode.npm.';
    const typescript = 'vscode.typescript.';
    function from(external, context, index, source, registry) {
        if (!external) {
            return undefined;
        }
        const type = external.type;
        const customize = external.customize;
        if (!type && !customize) {
            context.problemReporter.error(nls.localize('ConfigurationParser.noTaskType', 'Error: tasks configuration must have a type property. The configuration will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
            return undefined;
        }
        const typeDeclaration = type ? registry?.get?.(type) || TaskDefinitionRegistry.get(type) : undefined;
        if (!typeDeclaration) {
            const message = nls.localize('ConfigurationParser.noTypeDefinition', 'Error: there is no registered task type \'{0}\'. Did you miss installing an extension that provides a corresponding task provider?', type);
            context.problemReporter.error(message);
            return undefined;
        }
        let identifier;
        if (Types.isString(customize)) {
            if (customize.indexOf(grunt) === 0) {
                identifier = { type: 'grunt', task: customize.substring(grunt.length) };
            }
            else if (customize.indexOf(jake) === 0) {
                identifier = { type: 'jake', task: customize.substring(jake.length) };
            }
            else if (customize.indexOf(gulp) === 0) {
                identifier = { type: 'gulp', task: customize.substring(gulp.length) };
            }
            else if (customize.indexOf(npm) === 0) {
                identifier = { type: 'npm', script: customize.substring(npm.length + 4) };
            }
            else if (customize.indexOf(typescript) === 0) {
                identifier = { type: 'typescript', tsconfig: customize.substring(typescript.length + 6) };
            }
        }
        else {
            if (Types.isString(external.type)) {
                identifier = external;
            }
        }
        if (identifier === undefined) {
            context.problemReporter.error(nls.localize('ConfigurationParser.missingType', 'Error: the task configuration \'{0}\' is missing the required property \'type\'. The task configuration will be ignored.', JSON.stringify(external, undefined, 0)));
            return undefined;
        }
        const taskIdentifier = Tasks.TaskDefinition.createTaskIdentifier(identifier, context.problemReporter);
        if (taskIdentifier === undefined) {
            context.problemReporter.error(nls.localize('ConfigurationParser.incorrectType', 'Error: the task configuration \'{0}\' is using an unknown type. The task configuration will be ignored.', JSON.stringify(external, undefined, 0)));
            return undefined;
        }
        const configElement = {
            workspaceFolder: context.workspaceFolder,
            file: '.vscode/tasks.json',
            index,
            element: external
        };
        let taskSource;
        switch (source) {
            case TaskConfigSource.User: {
                taskSource = { kind: Tasks.TaskSourceKind.User, config: configElement, label };
                break;
            }
            case TaskConfigSource.WorkspaceFile: {
                taskSource = { kind: Tasks.TaskSourceKind.WorkspaceFile, config: configElement, label };
                break;
            }
            default: {
                taskSource = { kind: Tasks.TaskSourceKind.Workspace, config: configElement, label };
                break;
            }
        }
        const result = new Tasks.ConfiguringTask(`${typeDeclaration.extensionId}.${taskIdentifier._key}`, taskSource, undefined, type, taskIdentifier, RunOptions.fromConfiguration(external.runOptions), { hide: external.hide });
        const configuration = ConfigurationProperties.from(external, context, true, source, typeDeclaration.properties);
        result.addTaskLoadMessages(configuration.errors);
        if (configuration.value) {
            result.configurationProperties = Object.assign(result.configurationProperties, configuration.value);
            if (result.configurationProperties.name) {
                result._label = result.configurationProperties.name;
            }
            else {
                let label = result.configures.type;
                if (typeDeclaration.required && typeDeclaration.required.length > 0) {
                    for (const required of typeDeclaration.required) {
                        const value = result.configures[required];
                        if (value) {
                            label = label + ': ' + value;
                            break;
                        }
                    }
                }
                result._label = label;
            }
            if (!result.configurationProperties.identifier) {
                result.configurationProperties.identifier = taskIdentifier._key;
            }
        }
        return result;
    }
    ConfiguringTask.from = from;
})(ConfiguringTask || (ConfiguringTask = {}));
var CustomTask;
(function (CustomTask) {
    function from(external, context, index, source) {
        if (!external) {
            return undefined;
        }
        let type = external.type;
        if (type === undefined || type === null) {
            type = Tasks.CUSTOMIZED_TASK_TYPE;
        }
        if (type !== Tasks.CUSTOMIZED_TASK_TYPE && type !== 'shell' && type !== 'process') {
            context.problemReporter.error(nls.localize('ConfigurationParser.notCustom', 'Error: tasks is not declared as a custom task. The configuration will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
            return undefined;
        }
        let taskName = external.taskName;
        if (Types.isString(external.label) && context.schemaVersion === 2) {
            taskName = external.label;
        }
        if (!taskName) {
            context.problemReporter.error(nls.localize('ConfigurationParser.noTaskName', 'Error: a task must provide a label property. The task will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
            return undefined;
        }
        let taskSource;
        switch (source) {
            case TaskConfigSource.User: {
                taskSource = { kind: Tasks.TaskSourceKind.User, config: { index, element: external, file: '.vscode/tasks.json', workspaceFolder: context.workspaceFolder }, label };
                break;
            }
            case TaskConfigSource.WorkspaceFile: {
                taskSource = { kind: Tasks.TaskSourceKind.WorkspaceFile, config: { index, element: external, file: '.vscode/tasks.json', workspaceFolder: context.workspaceFolder, workspace: context.workspace }, label };
                break;
            }
            default: {
                taskSource = { kind: Tasks.TaskSourceKind.Workspace, config: { index, element: external, file: '.vscode/tasks.json', workspaceFolder: context.workspaceFolder }, label };
                break;
            }
        }
        const result = new Tasks.CustomTask(context.uuidMap.getUUID(taskName), taskSource, taskName, Tasks.CUSTOMIZED_TASK_TYPE, undefined, false, RunOptions.fromConfiguration(external.runOptions), {
            name: taskName,
            identifier: taskName,
        });
        const configuration = ConfigurationProperties.from(external, context, false, source);
        result.addTaskLoadMessages(configuration.errors);
        if (configuration.value) {
            result.configurationProperties = Object.assign(result.configurationProperties, configuration.value);
        }
        const supportLegacy = true;
        if (supportLegacy) {
            const legacy = external;
            if (result.configurationProperties.isBackground === undefined && legacy.isWatching !== undefined) {
                result.configurationProperties.isBackground = !!legacy.isWatching;
            }
            if (result.configurationProperties.group === undefined) {
                if (legacy.isBuildCommand === true) {
                    result.configurationProperties.group = Tasks.TaskGroup.Build;
                }
                else if (legacy.isTestCommand === true) {
                    result.configurationProperties.group = Tasks.TaskGroup.Test;
                }
            }
        }
        const command = CommandConfiguration.from(external, context);
        if (command) {
            result.command = command;
        }
        if (external.command !== undefined) {
            command.suppressTaskName = true;
        }
        return result;
    }
    CustomTask.from = from;
    function fillGlobals(task, globals) {
        if (CommandConfiguration.hasCommand(task.command) || task.configurationProperties.dependsOn === undefined) {
            task.command = CommandConfiguration.fillGlobals(task.command, globals.command, task.configurationProperties.name);
        }
        if (task.configurationProperties.problemMatchers === undefined && globals.problemMatcher !== undefined) {
            task.configurationProperties.problemMatchers = Objects.deepClone(globals.problemMatcher);
            task.hasDefinedMatchers = true;
        }
        if (task.configurationProperties.promptOnClose === undefined && task.configurationProperties.isBackground === undefined && globals.promptOnClose !== undefined) {
            task.configurationProperties.promptOnClose = globals.promptOnClose;
        }
    }
    CustomTask.fillGlobals = fillGlobals;
    function fillDefaults(task, context) {
        CommandConfiguration.fillDefaults(task.command, context);
        if (task.configurationProperties.promptOnClose === undefined) {
            task.configurationProperties.promptOnClose = task.configurationProperties.isBackground !== undefined ? !task.configurationProperties.isBackground : true;
        }
        if (task.configurationProperties.isBackground === undefined) {
            task.configurationProperties.isBackground = false;
        }
        if (task.configurationProperties.problemMatchers === undefined) {
            task.configurationProperties.problemMatchers = EMPTY_ARRAY;
        }
    }
    CustomTask.fillDefaults = fillDefaults;
    function createCustomTask(contributedTask, configuredProps) {
        const result = new Tasks.CustomTask(configuredProps._id, Object.assign({}, configuredProps._source, { customizes: contributedTask.defines }), configuredProps.configurationProperties.name || contributedTask._label, Tasks.CUSTOMIZED_TASK_TYPE, contributedTask.command, false, contributedTask.runOptions, {
            name: configuredProps.configurationProperties.name || contributedTask.configurationProperties.name,
            identifier: configuredProps.configurationProperties.identifier || contributedTask.configurationProperties.identifier,
            icon: configuredProps.configurationProperties.icon,
            hide: configuredProps.configurationProperties.hide
        });
        result.addTaskLoadMessages(configuredProps.taskLoadMessages);
        const resultConfigProps = result.configurationProperties;
        assignProperty(resultConfigProps, configuredProps.configurationProperties, 'group');
        assignProperty(resultConfigProps, configuredProps.configurationProperties, 'isBackground');
        assignProperty(resultConfigProps, configuredProps.configurationProperties, 'dependsOn');
        assignProperty(resultConfigProps, configuredProps.configurationProperties, 'problemMatchers');
        assignProperty(resultConfigProps, configuredProps.configurationProperties, 'promptOnClose');
        assignProperty(resultConfigProps, configuredProps.configurationProperties, 'detail');
        result.command.presentation = CommandConfiguration.PresentationOptions.assignProperties(result.command.presentation, configuredProps.configurationProperties.presentation);
        result.command.options = CommandOptions.assignProperties(result.command.options, configuredProps.configurationProperties.options);
        result.runOptions = RunOptions.assignProperties(result.runOptions, configuredProps.runOptions);
        const contributedConfigProps = contributedTask.configurationProperties;
        fillProperty(resultConfigProps, contributedConfigProps, 'group');
        fillProperty(resultConfigProps, contributedConfigProps, 'isBackground');
        fillProperty(resultConfigProps, contributedConfigProps, 'dependsOn');
        fillProperty(resultConfigProps, contributedConfigProps, 'problemMatchers');
        fillProperty(resultConfigProps, contributedConfigProps, 'promptOnClose');
        fillProperty(resultConfigProps, contributedConfigProps, 'detail');
        result.command.presentation = CommandConfiguration.PresentationOptions.fillProperties(result.command.presentation, contributedConfigProps.presentation);
        result.command.options = CommandOptions.fillProperties(result.command.options, contributedConfigProps.options);
        result.runOptions = RunOptions.fillProperties(result.runOptions, contributedTask.runOptions);
        if (contributedTask.hasDefinedMatchers === true) {
            result.hasDefinedMatchers = true;
        }
        return result;
    }
    CustomTask.createCustomTask = createCustomTask;
})(CustomTask || (CustomTask = {}));
export var TaskParser;
(function (TaskParser) {
    function isCustomTask(value) {
        const type = value.type;
        const customize = value.customize;
        return customize === undefined && (type === undefined || type === null || type === Tasks.CUSTOMIZED_TASK_TYPE || type === 'shell' || type === 'process');
    }
    const builtinTypeContextMap = {
        shell: ShellExecutionSupportedContext,
        process: ProcessExecutionSupportedContext
    };
    function from(externals, globals, context, source, registry) {
        const result = { custom: [], configured: [] };
        if (!externals) {
            return result;
        }
        const defaultBuildTask = { task: undefined, rank: -1 };
        const defaultTestTask = { task: undefined, rank: -1 };
        const schema2_0_0 = context.schemaVersion === 2;
        const baseLoadIssues = Objects.deepClone(context.taskLoadIssues);
        for (let index = 0; index < externals.length; index++) {
            const external = externals[index];
            const definition = external.type ? registry?.get?.(external.type) || TaskDefinitionRegistry.get(external.type) : undefined;
            let typeNotSupported = false;
            if (definition && definition.when && !context.contextKeyService.contextMatchesRules(definition.when)) {
                typeNotSupported = true;
            }
            else if (!definition && external.type) {
                for (const key of Object.keys(builtinTypeContextMap)) {
                    if (external.type === key) {
                        typeNotSupported = !ShellExecutionSupportedContext.evaluate(context.contextKeyService.getContext(null));
                        break;
                    }
                }
            }
            if (typeNotSupported) {
                context.problemReporter.info(nls.localize('taskConfiguration.providerUnavailable', 'Warning: {0} tasks are unavailable in the current environment.\n', external.type));
                continue;
            }
            if (isCustomTask(external)) {
                const customTask = CustomTask.from(external, context, index, source);
                if (customTask) {
                    CustomTask.fillGlobals(customTask, globals);
                    CustomTask.fillDefaults(customTask, context);
                    if (schema2_0_0) {
                        if ((customTask.command === undefined || customTask.command.name === undefined) && (customTask.configurationProperties.dependsOn === undefined || customTask.configurationProperties.dependsOn.length === 0)) {
                            context.problemReporter.error(nls.localize('taskConfiguration.noCommandOrDependsOn', 'Error: the task \'{0}\' neither specifies a command nor a dependsOn property. The task will be ignored. Its definition is:\n{1}', customTask.configurationProperties.name, JSON.stringify(external, undefined, 4)));
                            continue;
                        }
                    }
                    else {
                        if (customTask.command === undefined || customTask.command.name === undefined) {
                            context.problemReporter.warn(nls.localize('taskConfiguration.noCommand', 'Error: the task \'{0}\' doesn\'t define a command. The task will be ignored. Its definition is:\n{1}', customTask.configurationProperties.name, JSON.stringify(external, undefined, 4)));
                            continue;
                        }
                    }
                    if (customTask.configurationProperties.group === Tasks.TaskGroup.Build && defaultBuildTask.rank < 2) {
                        defaultBuildTask.task = customTask;
                        defaultBuildTask.rank = 2;
                    }
                    else if (customTask.configurationProperties.group === Tasks.TaskGroup.Test && defaultTestTask.rank < 2) {
                        defaultTestTask.task = customTask;
                        defaultTestTask.rank = 2;
                    }
                    else if (customTask.configurationProperties.name === 'build' && defaultBuildTask.rank < 1) {
                        defaultBuildTask.task = customTask;
                        defaultBuildTask.rank = 1;
                    }
                    else if (customTask.configurationProperties.name === 'test' && defaultTestTask.rank < 1) {
                        defaultTestTask.task = customTask;
                        defaultTestTask.rank = 1;
                    }
                    customTask.addTaskLoadMessages(context.taskLoadIssues);
                    result.custom.push(customTask);
                }
            }
            else {
                const configuredTask = ConfiguringTask.from(external, context, index, source, registry);
                if (configuredTask) {
                    configuredTask.addTaskLoadMessages(context.taskLoadIssues);
                    result.configured.push(configuredTask);
                }
            }
            context.taskLoadIssues = Objects.deepClone(baseLoadIssues);
        }
        const defaultBuildGroupName = Types.isString(defaultBuildTask.task?.configurationProperties.group) ? defaultBuildTask.task?.configurationProperties.group : defaultBuildTask.task?.configurationProperties.group?._id;
        const defaultTestTaskGroupName = Types.isString(defaultTestTask.task?.configurationProperties.group) ? defaultTestTask.task?.configurationProperties.group : defaultTestTask.task?.configurationProperties.group?._id;
        if ((defaultBuildGroupName !== Tasks.TaskGroup.Build._id) && (defaultBuildTask.rank > -1) && (defaultBuildTask.rank < 2) && defaultBuildTask.task) {
            defaultBuildTask.task.configurationProperties.group = Tasks.TaskGroup.Build;
        }
        else if ((defaultTestTaskGroupName !== Tasks.TaskGroup.Test._id) && (defaultTestTask.rank > -1) && (defaultTestTask.rank < 2) && defaultTestTask.task) {
            defaultTestTask.task.configurationProperties.group = Tasks.TaskGroup.Test;
        }
        return result;
    }
    TaskParser.from = from;
    function assignTasks(target, source) {
        if (source === undefined || source.length === 0) {
            return target;
        }
        if (target === undefined || target.length === 0) {
            return source;
        }
        if (source) {
            const map = Object.create(null);
            target.forEach((task) => {
                map[task.configurationProperties.name] = task;
            });
            source.forEach((task) => {
                map[task.configurationProperties.name] = task;
            });
            const newTarget = [];
            target.forEach(task => {
                newTarget.push(map[task.configurationProperties.name]);
                delete map[task.configurationProperties.name];
            });
            Object.keys(map).forEach(key => newTarget.push(map[key]));
            target = newTarget;
        }
        return target;
    }
    TaskParser.assignTasks = assignTasks;
})(TaskParser || (TaskParser = {}));
var Globals;
(function (Globals) {
    function from(config, context) {
        let result = fromBase(config, context);
        let osGlobals = undefined;
        if (config.windows && context.platform === 3) {
            osGlobals = fromBase(config.windows, context);
        }
        else if (config.osx && context.platform === 1) {
            osGlobals = fromBase(config.osx, context);
        }
        else if (config.linux && context.platform === 2) {
            osGlobals = fromBase(config.linux, context);
        }
        if (osGlobals) {
            result = Globals.assignProperties(result, osGlobals);
        }
        const command = CommandConfiguration.from(config, context);
        if (command) {
            result.command = command;
        }
        Globals.fillDefaults(result, context);
        Globals.freeze(result);
        return result;
    }
    Globals.from = from;
    function fromBase(config, context) {
        const result = {};
        if (config.suppressTaskName !== undefined) {
            result.suppressTaskName = !!config.suppressTaskName;
        }
        if (config.promptOnClose !== undefined) {
            result.promptOnClose = !!config.promptOnClose;
        }
        if (config.problemMatcher) {
            result.problemMatcher = ProblemMatcherConverter.from(config.problemMatcher, context).value;
        }
        return result;
    }
    Globals.fromBase = fromBase;
    function isEmpty(value) {
        return !value || value.command === undefined && value.promptOnClose === undefined && value.suppressTaskName === undefined;
    }
    Globals.isEmpty = isEmpty;
    function assignProperties(target, source) {
        if (isEmpty(source)) {
            return target;
        }
        if (isEmpty(target)) {
            return source;
        }
        assignProperty(target, source, 'promptOnClose');
        assignProperty(target, source, 'suppressTaskName');
        return target;
    }
    Globals.assignProperties = assignProperties;
    function fillDefaults(value, context) {
        if (!value) {
            return;
        }
        CommandConfiguration.fillDefaults(value.command, context);
        if (value.suppressTaskName === undefined) {
            value.suppressTaskName = (context.schemaVersion === 2);
        }
        if (value.promptOnClose === undefined) {
            value.promptOnClose = true;
        }
    }
    Globals.fillDefaults = fillDefaults;
    function freeze(value) {
        Object.freeze(value);
        if (value.command) {
            CommandConfiguration.freeze(value.command);
        }
    }
    Globals.freeze = freeze;
})(Globals || (Globals = {}));
export var ExecutionEngine;
(function (ExecutionEngine) {
    function from(config) {
        const runner = config.runner || config._runner;
        let result;
        if (runner) {
            switch (runner) {
                case 'terminal':
                    result = Tasks.ExecutionEngine.Terminal;
                    break;
                case 'process':
                    result = Tasks.ExecutionEngine.Process;
                    break;
            }
        }
        const schemaVersion = JsonSchemaVersion.from(config);
        if (schemaVersion === 1) {
            return result || Tasks.ExecutionEngine.Process;
        }
        else if (schemaVersion === 2) {
            return Tasks.ExecutionEngine.Terminal;
        }
        else {
            throw new Error('Shouldn\'t happen.');
        }
    }
    ExecutionEngine.from = from;
})(ExecutionEngine || (ExecutionEngine = {}));
export var JsonSchemaVersion;
(function (JsonSchemaVersion) {
    const _default = 2;
    function from(config) {
        const version = config.version;
        if (!version) {
            return _default;
        }
        switch (version) {
            case '0.1.0':
                return 1;
            case '2.0.0':
                return 2;
            default:
                return _default;
        }
    }
    JsonSchemaVersion.from = from;
})(JsonSchemaVersion || (JsonSchemaVersion = {}));
export class UUIDMap {
    constructor(other) {
        this.current = Object.create(null);
        if (other) {
            for (const key of Object.keys(other.current)) {
                const value = other.current[key];
                if (Array.isArray(value)) {
                    this.current[key] = value.slice();
                }
                else {
                    this.current[key] = value;
                }
            }
        }
    }
    start() {
        this.last = this.current;
        this.current = Object.create(null);
    }
    getUUID(identifier) {
        const lastValue = this.last ? this.last[identifier] : undefined;
        let result = undefined;
        if (lastValue !== undefined) {
            if (Array.isArray(lastValue)) {
                result = lastValue.shift();
                if (lastValue.length === 0) {
                    delete this.last[identifier];
                }
            }
            else {
                result = lastValue;
                delete this.last[identifier];
            }
        }
        if (result === undefined) {
            result = UUID.generateUuid();
        }
        const currentValue = this.current[identifier];
        if (currentValue === undefined) {
            this.current[identifier] = result;
        }
        else {
            if (Array.isArray(currentValue)) {
                currentValue.push(result);
            }
            else {
                const arrayValue = [currentValue];
                arrayValue.push(result);
                this.current[identifier] = arrayValue;
            }
        }
        return result;
    }
    finish() {
        this.last = undefined;
    }
}
export var TaskConfigSource;
(function (TaskConfigSource) {
    TaskConfigSource[TaskConfigSource["TasksJson"] = 0] = "TasksJson";
    TaskConfigSource[TaskConfigSource["WorkspaceFile"] = 1] = "WorkspaceFile";
    TaskConfigSource[TaskConfigSource["User"] = 2] = "User";
})(TaskConfigSource || (TaskConfigSource = {}));
class ConfigurationParser {
    constructor(workspaceFolder, workspace, platform, problemReporter, uuidMap) {
        this.workspaceFolder = workspaceFolder;
        this.workspace = workspace;
        this.platform = platform;
        this.problemReporter = problemReporter;
        this.uuidMap = uuidMap;
    }
    run(fileConfig, source, contextKeyService) {
        const engine = ExecutionEngine.from(fileConfig);
        const schemaVersion = JsonSchemaVersion.from(fileConfig);
        const context = {
            workspaceFolder: this.workspaceFolder,
            workspace: this.workspace,
            problemReporter: this.problemReporter,
            uuidMap: this.uuidMap,
            namedProblemMatchers: {},
            engine,
            schemaVersion,
            platform: this.platform,
            taskLoadIssues: [],
            contextKeyService
        };
        const taskParseResult = this.createTaskRunnerConfiguration(fileConfig, context, source);
        return {
            validationStatus: this.problemReporter.status,
            custom: taskParseResult.custom,
            configured: taskParseResult.configured,
            engine
        };
    }
    createTaskRunnerConfiguration(fileConfig, context, source) {
        const globals = Globals.from(fileConfig, context);
        if (this.problemReporter.status.isFatal()) {
            return { custom: [], configured: [] };
        }
        context.namedProblemMatchers = ProblemMatcherConverter.namedFrom(fileConfig.declares, context);
        let globalTasks = undefined;
        let externalGlobalTasks = undefined;
        if (fileConfig.windows && context.platform === 3) {
            globalTasks = TaskParser.from(fileConfig.windows.tasks, globals, context, source).custom;
            externalGlobalTasks = fileConfig.windows.tasks;
        }
        else if (fileConfig.osx && context.platform === 1) {
            globalTasks = TaskParser.from(fileConfig.osx.tasks, globals, context, source).custom;
            externalGlobalTasks = fileConfig.osx.tasks;
        }
        else if (fileConfig.linux && context.platform === 2) {
            globalTasks = TaskParser.from(fileConfig.linux.tasks, globals, context, source).custom;
            externalGlobalTasks = fileConfig.linux.tasks;
        }
        if (context.schemaVersion === 2 && globalTasks && globalTasks.length > 0 && externalGlobalTasks && externalGlobalTasks.length > 0) {
            const taskContent = [];
            for (const task of externalGlobalTasks) {
                taskContent.push(JSON.stringify(task, null, 4));
            }
            context.problemReporter.error(nls.localize({ key: 'TaskParse.noOsSpecificGlobalTasks', comment: ['\"Task version 2.0.0\" refers to the 2.0.0 version of the task system. The \"version 2.0.0\" is not localizable as it is a json key and value.'] }, 'Task version 2.0.0 doesn\'t support global OS specific tasks. Convert them to a task with a OS specific command. Affected tasks are:\n{0}', taskContent.join('\n')));
        }
        let result = { custom: [], configured: [] };
        if (fileConfig.tasks) {
            result = TaskParser.from(fileConfig.tasks, globals, context, source);
        }
        if (globalTasks) {
            result.custom = TaskParser.assignTasks(result.custom, globalTasks);
        }
        if ((!result.custom || result.custom.length === 0) && (globals.command && globals.command.name)) {
            const matchers = ProblemMatcherConverter.from(fileConfig.problemMatcher, context).value ?? [];
            const isBackground = fileConfig.isBackground ? !!fileConfig.isBackground : fileConfig.isWatching ? !!fileConfig.isWatching : undefined;
            const name = Tasks.CommandString.value(globals.command.name);
            const task = new Tasks.CustomTask(context.uuidMap.getUUID(name), Object.assign({}, source, 'workspace', { config: { index: -1, element: fileConfig, workspaceFolder: context.workspaceFolder } }), name, Tasks.CUSTOMIZED_TASK_TYPE, {
                name: undefined,
                runtime: undefined,
                presentation: undefined,
                suppressTaskName: true
            }, false, { reevaluateOnRerun: true }, {
                name: name,
                identifier: name,
                group: Tasks.TaskGroup.Build,
                isBackground: isBackground,
                problemMatchers: matchers
            });
            const taskGroupKind = GroupKind.from(fileConfig.group);
            if (taskGroupKind !== undefined) {
                task.configurationProperties.group = taskGroupKind;
            }
            else if (fileConfig.group === 'none') {
                task.configurationProperties.group = undefined;
            }
            CustomTask.fillGlobals(task, globals);
            CustomTask.fillDefaults(task, context);
            result.custom = [task];
        }
        result.custom = result.custom || [];
        result.configured = result.configured || [];
        return result;
    }
}
const uuidMaps = new Map();
const recentUuidMaps = new Map();
export function parse(workspaceFolder, workspace, platform, configuration, logger, source, contextKeyService, isRecents = false) {
    const recentOrOtherMaps = isRecents ? recentUuidMaps : uuidMaps;
    let selectedUuidMaps = recentOrOtherMaps.get(source);
    if (!selectedUuidMaps) {
        recentOrOtherMaps.set(source, new Map());
        selectedUuidMaps = recentOrOtherMaps.get(source);
    }
    let uuidMap = selectedUuidMaps.get(workspaceFolder.uri.toString());
    if (!uuidMap) {
        uuidMap = new UUIDMap();
        selectedUuidMaps.set(workspaceFolder.uri.toString(), uuidMap);
    }
    try {
        uuidMap.start();
        return (new ConfigurationParser(workspaceFolder, workspace, platform, logger, uuidMap)).run(configuration, source, contextKeyService);
    }
    finally {
        uuidMap.finish();
    }
}
export function createCustomTask(contributedTask, configuredProps) {
    return CustomTask.createCustomTask(contributedTask, configuredProps);
}
