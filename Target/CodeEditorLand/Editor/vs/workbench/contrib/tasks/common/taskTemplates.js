import * as nls from '../../../../nls.js';
const dotnetBuild = {
    id: 'dotnetCore',
    label: '.NET Core',
    sort: 'NET Core',
    autoDetect: false,
    description: nls.localize('dotnetCore', 'Executes .NET Core build command'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "2.0.0",',
        '\t"tasks": [',
        '\t\t{',
        '\t\t\t"label": "build",',
        '\t\t\t"command": "dotnet",',
        '\t\t\t"type": "shell",',
        '\t\t\t"args": [',
        '\t\t\t\t"build",',
        '\t\t\t\t// Ask dotnet build to generate full paths for file names.',
        '\t\t\t\t"/property:GenerateFullPaths=true",',
        '\t\t\t\t// Do not generate summary otherwise it leads to duplicate errors in Problems panel',
        '\t\t\t\t"/consoleloggerparameters:NoSummary"',
        '\t\t\t],',
        '\t\t\t"group": "build",',
        '\t\t\t"presentation": {',
        '\t\t\t\t"reveal": "silent"',
        '\t\t\t},',
        '\t\t\t"problemMatcher": "$msCompile"',
        '\t\t}',
        '\t]',
        '}'
    ].join('\n')
};
const msbuild = {
    id: 'msbuild',
    label: 'MSBuild',
    autoDetect: false,
    description: nls.localize('msbuild', 'Executes the build target'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "2.0.0",',
        '\t"tasks": [',
        '\t\t{',
        '\t\t\t"label": "build",',
        '\t\t\t"type": "shell",',
        '\t\t\t"command": "msbuild",',
        '\t\t\t"args": [',
        '\t\t\t\t// Ask msbuild to generate full paths for file names.',
        '\t\t\t\t"/property:GenerateFullPaths=true",',
        '\t\t\t\t"/t:build",',
        '\t\t\t\t// Do not generate summary otherwise it leads to duplicate errors in Problems panel',
        '\t\t\t\t"/consoleloggerparameters:NoSummary"',
        '\t\t\t],',
        '\t\t\t"group": "build",',
        '\t\t\t"presentation": {',
        '\t\t\t\t// Reveal the output only if unrecognized errors occur.',
        '\t\t\t\t"reveal": "silent"',
        '\t\t\t},',
        '\t\t\t// Use the standard MS compiler pattern to detect errors, warnings and infos',
        '\t\t\t"problemMatcher": "$msCompile"',
        '\t\t}',
        '\t]',
        '}'
    ].join('\n')
};
const command = {
    id: 'externalCommand',
    label: 'Others',
    autoDetect: false,
    description: nls.localize('externalCommand', 'Example to run an arbitrary external command'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "2.0.0",',
        '\t"tasks": [',
        '\t\t{',
        '\t\t\t"label": "echo",',
        '\t\t\t"type": "shell",',
        '\t\t\t"command": "echo Hello"',
        '\t\t}',
        '\t]',
        '}'
    ].join('\n')
};
const maven = {
    id: 'maven',
    label: 'maven',
    sort: 'MVN',
    autoDetect: false,
    description: nls.localize('Maven', 'Executes common maven commands'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "2.0.0",',
        '\t"tasks": [',
        '\t\t{',
        '\t\t\t"label": "verify",',
        '\t\t\t"type": "shell",',
        '\t\t\t"command": "mvn -B verify",',
        '\t\t\t"group": "build"',
        '\t\t},',
        '\t\t{',
        '\t\t\t"label": "test",',
        '\t\t\t"type": "shell",',
        '\t\t\t"command": "mvn -B test",',
        '\t\t\t"group": "test"',
        '\t\t}',
        '\t]',
        '}'
    ].join('\n')
};
let _templates = null;
export function getTemplates() {
    if (!_templates) {
        _templates = [dotnetBuild, msbuild, maven].sort((a, b) => {
            return (a.sort || a.label).localeCompare(b.sort || b.label);
        });
        _templates.push(command);
    }
    return _templates;
}
