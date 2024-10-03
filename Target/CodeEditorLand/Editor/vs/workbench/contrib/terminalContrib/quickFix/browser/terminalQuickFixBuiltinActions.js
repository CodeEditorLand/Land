import { URI } from '../../../../../base/common/uri.js';
import { localize } from '../../../../../nls.js';
import { TerminalQuickFixType } from './quickFix.js';
export const GitCommandLineRegex = /git/;
export const GitFastForwardPullOutputRegex = /and can be fast-forwarded/;
export const GitPushCommandLineRegex = /git\s+push/;
export const GitTwoDashesRegex = /error: did you mean `--(.+)` \(with two dashes\)\?/;
export const GitSimilarOutputRegex = /(?:(most similar commands? (is|are)))/;
export const FreePortOutputRegex = /(?:address already in use (?:0\.0\.0\.0|127\.0\.0\.1|localhost|::):|Unable to bind [^ ]*:|can't listen on port |listen EADDRINUSE [^ ]*:)(?<portNumber>\d{4,5})/;
export const GitPushOutputRegex = /git push --set-upstream origin (?<branchName>[^\s]+)/;
export const GitCreatePrOutputRegex = /remote:\s*(?<link>https:\/\/github\.com\/.+\/.+\/pull\/new\/.+)/;
export const PwshGeneralErrorOutputRegex = /Suggestion \[General\]:/;
export const PwshUnixCommandNotFoundErrorOutputRegex = /Suggestion \[cmd-not-found\]:/;
export function gitSimilar() {
    return {
        id: 'Git Similar',
        type: 'internal',
        commandLineMatcher: GitCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitSimilarOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 10
        },
        commandExitResult: 'error',
        getQuickFixes: (matchResult) => {
            const regexMatch = matchResult.outputMatch?.regexMatch[0];
            if (!regexMatch || !matchResult.outputMatch) {
                return;
            }
            const actions = [];
            const startIndex = matchResult.outputMatch.outputLines.findIndex(l => l.includes(regexMatch)) + 1;
            const results = matchResult.outputMatch.outputLines.map(r => r.trim());
            for (let i = startIndex; i < results.length; i++) {
                const fixedCommand = results[i];
                if (fixedCommand) {
                    actions.push({
                        id: 'Git Similar',
                        type: TerminalQuickFixType.TerminalCommand,
                        terminalCommand: matchResult.commandLine.replace(/git\s+[^\s]+/, () => `git ${fixedCommand}`),
                        shouldExecute: true,
                        source: "builtin"
                    });
                }
            }
            return actions;
        }
    };
}
export function gitFastForwardPull() {
    return {
        id: 'Git Fast Forward Pull',
        type: 'internal',
        commandLineMatcher: GitCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitFastForwardPullOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 8
        },
        commandExitResult: 'success',
        getQuickFixes: (matchResult) => {
            return {
                type: TerminalQuickFixType.TerminalCommand,
                id: 'Git Fast Forward Pull',
                terminalCommand: `git pull`,
                shouldExecute: true,
                source: "builtin"
            };
        }
    };
}
export function gitTwoDashes() {
    return {
        id: 'Git Two Dashes',
        type: 'internal',
        commandLineMatcher: GitCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitTwoDashesRegex,
            anchor: 'bottom',
            offset: 0,
            length: 2
        },
        commandExitResult: 'error',
        getQuickFixes: (matchResult) => {
            const problemArg = matchResult?.outputMatch?.regexMatch?.[1];
            if (!problemArg) {
                return;
            }
            return {
                type: TerminalQuickFixType.TerminalCommand,
                id: 'Git Two Dashes',
                terminalCommand: matchResult.commandLine.replace(` -${problemArg}`, () => ` --${problemArg}`),
                shouldExecute: true,
                source: "builtin"
            };
        }
    };
}
export function freePort(runCallback) {
    return {
        id: 'Free Port',
        type: 'internal',
        commandLineMatcher: /.+/,
        outputMatcher: {
            lineMatcher: FreePortOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 30
        },
        commandExitResult: 'error',
        getQuickFixes: (matchResult) => {
            const port = matchResult?.outputMatch?.regexMatch?.groups?.portNumber;
            if (!port) {
                return;
            }
            const label = localize("terminal.freePort", "Free port {0}", port);
            return {
                type: TerminalQuickFixType.Port,
                class: undefined,
                tooltip: label,
                id: 'Free Port',
                label,
                enabled: true,
                source: "builtin",
                run: () => runCallback(port, matchResult.commandLine)
            };
        }
    };
}
export function gitPushSetUpstream() {
    return {
        id: 'Git Push Set Upstream',
        type: 'internal',
        commandLineMatcher: GitPushCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitPushOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 8
        },
        commandExitResult: 'error',
        getQuickFixes: (matchResult) => {
            const matches = matchResult.outputMatch;
            const commandToRun = 'git push --set-upstream origin ${group:branchName}';
            if (!matches) {
                return;
            }
            const groups = matches.regexMatch.groups;
            if (!groups) {
                return;
            }
            const actions = [];
            let fixedCommand = commandToRun;
            for (const [key, value] of Object.entries(groups)) {
                const varToResolve = '${group:' + `${key}` + '}';
                if (!commandToRun.includes(varToResolve)) {
                    return [];
                }
                fixedCommand = fixedCommand.replaceAll(varToResolve, () => value);
            }
            if (fixedCommand) {
                actions.push({
                    type: TerminalQuickFixType.TerminalCommand,
                    id: 'Git Push Set Upstream',
                    terminalCommand: fixedCommand,
                    shouldExecute: true,
                    source: "builtin"
                });
                return actions;
            }
            return;
        }
    };
}
export function gitCreatePr() {
    return {
        id: 'Git Create Pr',
        type: 'internal',
        commandLineMatcher: GitPushCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitCreatePrOutputRegex,
            anchor: 'bottom',
            offset: 4,
            length: 12
        },
        commandExitResult: 'success',
        getQuickFixes: (matchResult) => {
            const link = matchResult?.outputMatch?.regexMatch?.groups?.link?.trimEnd();
            if (!link) {
                return;
            }
            const label = localize("terminal.createPR", "Create PR {0}", link);
            return {
                id: 'Git Create Pr',
                label,
                enabled: true,
                type: TerminalQuickFixType.Opener,
                uri: URI.parse(link),
                source: "builtin"
            };
        }
    };
}
export function pwshGeneralError() {
    return {
        id: 'Pwsh General Error',
        type: 'internal',
        commandLineMatcher: /.+/,
        outputMatcher: {
            lineMatcher: PwshGeneralErrorOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 10
        },
        commandExitResult: 'error',
        getQuickFixes: (matchResult) => {
            const lines = matchResult.outputMatch?.regexMatch.input?.split('\n');
            if (!lines) {
                return;
            }
            let i = 0;
            let inFeedbackProvider = false;
            for (; i < lines.length; i++) {
                if (lines[i].match(PwshGeneralErrorOutputRegex)) {
                    inFeedbackProvider = true;
                    break;
                }
            }
            if (!inFeedbackProvider) {
                return;
            }
            const suggestions = lines[i + 1].match(/The most similar commands are: (?<values>.+)./)?.groups?.values?.split(', ');
            if (!suggestions) {
                return;
            }
            const result = [];
            for (const suggestion of suggestions) {
                result.push({
                    id: 'Pwsh General Error',
                    type: TerminalQuickFixType.TerminalCommand,
                    terminalCommand: suggestion,
                    source: "builtin"
                });
            }
            return result;
        }
    };
}
export function pwshUnixCommandNotFoundError() {
    return {
        id: 'Unix Command Not Found',
        type: 'internal',
        commandLineMatcher: /.+/,
        outputMatcher: {
            lineMatcher: PwshUnixCommandNotFoundErrorOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 10
        },
        commandExitResult: 'error',
        getQuickFixes: (matchResult) => {
            const lines = matchResult.outputMatch?.regexMatch.input?.split('\n');
            if (!lines) {
                return;
            }
            let i = 0;
            let inFeedbackProvider = false;
            for (; i < lines.length; i++) {
                if (lines[i].match(PwshUnixCommandNotFoundErrorOutputRegex)) {
                    inFeedbackProvider = true;
                    break;
                }
            }
            if (!inFeedbackProvider) {
                return;
            }
            const result = [];
            let inSuggestions = false;
            for (; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.length === 0) {
                    break;
                }
                const installCommand = line.match(/You also have .+ installed, you can run '(?<command>.+)' instead./)?.groups?.command;
                if (installCommand) {
                    result.push({
                        id: 'Pwsh Unix Command Not Found Error',
                        type: TerminalQuickFixType.TerminalCommand,
                        terminalCommand: installCommand,
                        source: "builtin"
                    });
                    inSuggestions = false;
                    continue;
                }
                if (line.match(/Command '.+' not found, but can be installed with:/)) {
                    inSuggestions = true;
                    continue;
                }
                if (inSuggestions) {
                    result.push({
                        id: 'Pwsh Unix Command Not Found Error',
                        type: TerminalQuickFixType.TerminalCommand,
                        terminalCommand: line.trim(),
                        source: "builtin"
                    });
                }
            }
            return result;
        }
    };
}
