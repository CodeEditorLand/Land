/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Menu } from './web.api.js';
import { BrowserMain } from './web.main.js';
import { toDisposable } from '../../base/common/lifecycle.js';
import { CommandsRegistry } from '../../platform/commands/common/commands.js';
import { mark } from '../../base/common/performance.js';
import { MenuId, MenuRegistry } from '../../platform/actions/common/actions.js';
import { DeferredPromise } from '../../base/common/async.js';
import { asArray } from '../../base/common/arrays.js';
let created = false;
const workbenchPromise = new DeferredPromise();
/**
 * Creates the workbench with the provided options in the provided container.
 *
 * @param domElement the container to create the workbench in
 * @param options for setting up the workbench
 */
export function create(domElement, options) {
    // Mark start of workbench
    mark('code/didLoadWorkbenchMain');
    // Assert that the workbench is not created more than once. We currently
    // do not support this and require a full context switch to clean-up.
    if (created) {
        throw new Error('Unable to create the VSCode workbench more than once.');
    }
    else {
        created = true;
    }
    // Register commands if any
    if (Array.isArray(options.commands)) {
        for (const command of options.commands) {
            CommandsRegistry.registerCommand(command.id, (accessor, ...args) => {
                // we currently only pass on the arguments but not the accessor
                // to the command to reduce our exposure of internal API.
                return command.handler(...args);
            });
            // Commands with labels appear in the command palette
            if (command.label) {
                for (const menu of asArray(command.menu ?? Menu.CommandPalette)) {
                    MenuRegistry.appendMenuItem(asMenuId(menu), { command: { id: command.id, title: command.label } });
                }
            }
        }
    }
    // Startup workbench and resolve waiters
    let instantiatedWorkbench = undefined;
    new BrowserMain(domElement, options).open().then(workbench => {
        instantiatedWorkbench = workbench;
        workbenchPromise.complete(workbench);
    });
    return toDisposable(() => {
        if (instantiatedWorkbench) {
            instantiatedWorkbench.shutdown();
        }
        else {
            workbenchPromise.p.then(instantiatedWorkbench => instantiatedWorkbench.shutdown());
        }
    });
}
function asMenuId(menu) {
    switch (menu) {
        case Menu.CommandPalette: return MenuId.CommandPalette;
        case Menu.StatusBarWindowIndicatorMenu: return MenuId.StatusBarWindowIndicatorMenu;
    }
}
export var commands;
(function (commands) {
    /**
     * {@linkcode IWorkbench.commands IWorkbench.commands.executeCommand}
     */
    async function executeCommand(command, ...args) {
        const workbench = await workbenchPromise.p;
        return workbench.commands.executeCommand(command, ...args);
    }
    commands.executeCommand = executeCommand;
})(commands || (commands = {}));
export var logger;
(function (logger) {
    /**
     * {@linkcode IWorkbench.logger IWorkbench.logger.log}
     */
    function log(level, message) {
        workbenchPromise.p.then(workbench => workbench.logger.log(level, message));
    }
    logger.log = log;
})(logger || (logger = {}));
export var env;
(function (env) {
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.retrievePerformanceMarks}
     */
    async function retrievePerformanceMarks() {
        const workbench = await workbenchPromise.p;
        return workbench.env.retrievePerformanceMarks();
    }
    env.retrievePerformanceMarks = retrievePerformanceMarks;
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.getUriScheme}
     */
    async function getUriScheme() {
        const workbench = await workbenchPromise.p;
        return workbench.env.getUriScheme();
    }
    env.getUriScheme = getUriScheme;
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.openUri}
     */
    async function openUri(target) {
        const workbench = await workbenchPromise.p;
        return workbench.env.openUri(target);
    }
    env.openUri = openUri;
})(env || (env = {}));
export var window;
(function (window) {
    /**
     * {@linkcode IWorkbench.window IWorkbench.window.withProgress}
     */
    async function withProgress(options, task) {
        const workbench = await workbenchPromise.p;
        return workbench.window.withProgress(options, task);
    }
    window.withProgress = withProgress;
    async function createTerminal(options) {
        const workbench = await workbenchPromise.p;
        workbench.window.createTerminal(options);
    }
    window.createTerminal = createTerminal;
    async function showInformationMessage(message, ...items) {
        const workbench = await workbenchPromise.p;
        return await workbench.window.showInformationMessage(message, ...items);
    }
    window.showInformationMessage = showInformationMessage;
})(window || (window = {}));
export var workspace;
(function (workspace) {
    /**
     * {@linkcode IWorkbench.workspace IWorkbench.workspace.didResolveRemoteAuthority}
     */
    async function didResolveRemoteAuthority() {
        const workbench = await workbenchPromise.p;
        await workbench.workspace.didResolveRemoteAuthority();
    }
    workspace.didResolveRemoteAuthority = didResolveRemoteAuthority;
    /**
     * {@linkcode IWorkbench.workspace IWorkbench.workspace.openTunnel}
     */
    async function openTunnel(tunnelOptions) {
        const workbench = await workbenchPromise.p;
        return workbench.workspace.openTunnel(tunnelOptions);
    }
    workspace.openTunnel = openTunnel;
})(workspace || (workspace = {}));
