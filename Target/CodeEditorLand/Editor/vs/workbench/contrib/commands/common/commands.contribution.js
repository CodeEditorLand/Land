import { safeStringify } from '../../../../base/common/objects.js';
import * as nls from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
class RunCommands extends Action2 {
    constructor() {
        super({
            id: 'runCommands',
            title: nls.localize2('runCommands', "Run Commands"),
            f1: false,
            metadata: {
                description: nls.localize('runCommands.description', "Run several commands"),
                args: [
                    {
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['commands'],
                            properties: {
                                commands: {
                                    type: 'array',
                                    description: nls.localize('runCommands.commands', "Commands to run"),
                                    items: {
                                        anyOf: [
                                            {
                                                $ref: 'vscode://schemas/keybindings#/definitions/commandNames'
                                            },
                                            {
                                                type: 'string',
                                            },
                                            {
                                                type: 'object',
                                                required: ['command'],
                                                properties: {
                                                    command: {
                                                        'anyOf': [
                                                            {
                                                                $ref: 'vscode://schemas/keybindings#/definitions/commandNames'
                                                            },
                                                            {
                                                                type: 'string'
                                                            },
                                                        ]
                                                    }
                                                },
                                                $ref: 'vscode://schemas/keybindings#/definitions/commandsSchemas'
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        });
    }
    async run(accessor, args) {
        const notificationService = accessor.get(INotificationService);
        if (!this._isCommandArgs(args)) {
            notificationService.error(nls.localize('runCommands.invalidArgs', "'runCommands' has received an argument with incorrect type. Please, review the argument passed to the command."));
            return;
        }
        if (args.commands.length === 0) {
            notificationService.warn(nls.localize('runCommands.noCommandsToRun', "'runCommands' has not received commands to run. Did you forget to pass commands in the 'runCommands' argument?"));
            return;
        }
        const commandService = accessor.get(ICommandService);
        const logService = accessor.get(ILogService);
        let i = 0;
        try {
            for (; i < args.commands.length; ++i) {
                const cmd = args.commands[i];
                logService.debug(`runCommands: executing ${i}-th command: ${safeStringify(cmd)}`);
                await this._runCommand(commandService, cmd);
                logService.debug(`runCommands: executed ${i}-th command`);
            }
        }
        catch (err) {
            logService.debug(`runCommands: executing ${i}-th command resulted in an error: ${err instanceof Error ? err.message : safeStringify(err)}`);
            notificationService.error(err);
        }
    }
    _isCommandArgs(args) {
        if (!args || typeof args !== 'object') {
            return false;
        }
        if (!('commands' in args) || !Array.isArray(args.commands)) {
            return false;
        }
        for (const cmd of args.commands) {
            if (typeof cmd === 'string') {
                continue;
            }
            if (typeof cmd === 'object' && typeof cmd.command === 'string') {
                continue;
            }
            return false;
        }
        return true;
    }
    _runCommand(commandService, cmd) {
        let commandID, commandArgs;
        if (typeof cmd === 'string') {
            commandID = cmd;
        }
        else {
            commandID = cmd.command;
            commandArgs = cmd.args;
        }
        if (commandArgs === undefined) {
            return commandService.executeCommand(commandID);
        }
        else {
            if (Array.isArray(commandArgs)) {
                return commandService.executeCommand(commandID, ...commandArgs);
            }
            else {
                return commandService.executeCommand(commandID, commandArgs);
            }
        }
    }
}
registerAction2(RunCommands);
