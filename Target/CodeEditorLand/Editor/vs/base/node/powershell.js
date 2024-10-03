import * as os from 'os';
import * as path from '../common/path.js';
import * as pfs from './pfs.js';
const IntRegex = /^\d+$/;
const PwshMsixRegex = /^Microsoft.PowerShell_.*/;
const PwshPreviewMsixRegex = /^Microsoft.PowerShellPreview_.*/;
let processArch;
switch (process.arch) {
    case 'ia32':
        processArch = 1;
        break;
    case 'arm':
    case 'arm64':
        processArch = 2;
        break;
    default:
        processArch = 0;
        break;
}
let osArch;
if (process.env['PROCESSOR_ARCHITEW6432']) {
    osArch = process.env['PROCESSOR_ARCHITEW6432'] === 'ARM64'
        ? 2
        : 0;
}
else if (process.env['PROCESSOR_ARCHITECTURE'] === 'ARM64') {
    osArch = 2;
}
else if (process.env['PROCESSOR_ARCHITECTURE'] === 'X86') {
    osArch = 1;
}
else {
    osArch = 0;
}
class PossiblePowerShellExe {
    constructor(exePath, displayName, knownToExist) {
        this.exePath = exePath;
        this.displayName = displayName;
        this.knownToExist = knownToExist;
    }
    async exists() {
        if (this.knownToExist === undefined) {
            this.knownToExist = await pfs.SymlinkSupport.existsFile(this.exePath);
        }
        return this.knownToExist;
    }
}
function getProgramFilesPath({ useAlternateBitness = false } = {}) {
    if (!useAlternateBitness) {
        return process.env.ProgramFiles || null;
    }
    if (processArch === 0) {
        return process.env['ProgramFiles(x86)'] || null;
    }
    if (osArch === 0) {
        return process.env.ProgramW6432 || null;
    }
    return null;
}
async function findPSCoreWindowsInstallation({ useAlternateBitness = false, findPreview = false } = {}) {
    const programFilesPath = getProgramFilesPath({ useAlternateBitness });
    if (!programFilesPath) {
        return null;
    }
    const powerShellInstallBaseDir = path.join(programFilesPath, 'PowerShell');
    if (!await pfs.SymlinkSupport.existsDirectory(powerShellInstallBaseDir)) {
        return null;
    }
    let highestSeenVersion = -1;
    let pwshExePath = null;
    for (const item of await pfs.Promises.readdir(powerShellInstallBaseDir)) {
        let currentVersion = -1;
        if (findPreview) {
            const dashIndex = item.indexOf('-');
            if (dashIndex < 0) {
                continue;
            }
            const intPart = item.substring(0, dashIndex);
            if (!IntRegex.test(intPart) || item.substring(dashIndex + 1) !== 'preview') {
                continue;
            }
            currentVersion = parseInt(intPart, 10);
        }
        else {
            if (!IntRegex.test(item)) {
                continue;
            }
            currentVersion = parseInt(item, 10);
        }
        if (currentVersion <= highestSeenVersion) {
            continue;
        }
        const exePath = path.join(powerShellInstallBaseDir, item, 'pwsh.exe');
        if (!await pfs.SymlinkSupport.existsFile(exePath)) {
            continue;
        }
        pwshExePath = exePath;
        highestSeenVersion = currentVersion;
    }
    if (!pwshExePath) {
        return null;
    }
    const bitness = programFilesPath.includes('x86') ? ' (x86)' : '';
    const preview = findPreview ? ' Preview' : '';
    return new PossiblePowerShellExe(pwshExePath, `PowerShell${preview}${bitness}`, true);
}
async function findPSCoreMsix({ findPreview } = {}) {
    if (!process.env.LOCALAPPDATA) {
        return null;
    }
    const msixAppDir = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WindowsApps');
    if (!await pfs.SymlinkSupport.existsDirectory(msixAppDir)) {
        return null;
    }
    const { pwshMsixDirRegex, pwshMsixName } = findPreview
        ? { pwshMsixDirRegex: PwshPreviewMsixRegex, pwshMsixName: 'PowerShell Preview (Store)' }
        : { pwshMsixDirRegex: PwshMsixRegex, pwshMsixName: 'PowerShell (Store)' };
    for (const subdir of await pfs.Promises.readdir(msixAppDir)) {
        if (pwshMsixDirRegex.test(subdir)) {
            const pwshMsixPath = path.join(msixAppDir, subdir, 'pwsh.exe');
            return new PossiblePowerShellExe(pwshMsixPath, pwshMsixName);
        }
    }
    return null;
}
function findPSCoreDotnetGlobalTool() {
    const dotnetGlobalToolExePath = path.join(os.homedir(), '.dotnet', 'tools', 'pwsh.exe');
    return new PossiblePowerShellExe(dotnetGlobalToolExePath, '.NET Core PowerShell Global Tool');
}
function findWinPS() {
    const winPSPath = path.join(process.env.windir, processArch === 1 && osArch !== 1 ? 'SysNative' : 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    return new PossiblePowerShellExe(winPSPath, 'Windows PowerShell', true);
}
async function* enumerateDefaultPowerShellInstallations() {
    let pwshExe = await findPSCoreWindowsInstallation();
    if (pwshExe) {
        yield pwshExe;
    }
    pwshExe = await findPSCoreWindowsInstallation({ useAlternateBitness: true });
    if (pwshExe) {
        yield pwshExe;
    }
    pwshExe = await findPSCoreMsix();
    if (pwshExe) {
        yield pwshExe;
    }
    pwshExe = findPSCoreDotnetGlobalTool();
    if (pwshExe) {
        yield pwshExe;
    }
    pwshExe = await findPSCoreWindowsInstallation({ findPreview: true });
    if (pwshExe) {
        yield pwshExe;
    }
    pwshExe = await findPSCoreMsix({ findPreview: true });
    if (pwshExe) {
        yield pwshExe;
    }
    pwshExe = await findPSCoreWindowsInstallation({ useAlternateBitness: true, findPreview: true });
    if (pwshExe) {
        yield pwshExe;
    }
    pwshExe = findWinPS();
    if (pwshExe) {
        yield pwshExe;
    }
}
export async function* enumeratePowerShellInstallations() {
    for await (const defaultPwsh of enumerateDefaultPowerShellInstallations()) {
        if (await defaultPwsh.exists()) {
            yield defaultPwsh;
        }
    }
}
export async function getFirstAvailablePowerShellInstallation() {
    for await (const pwsh of enumeratePowerShellInstallations()) {
        return pwsh;
    }
    return null;
}
