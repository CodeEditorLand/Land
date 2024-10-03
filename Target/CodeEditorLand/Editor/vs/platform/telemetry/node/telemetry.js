import * as fs from 'fs';
import { join } from '../../../base/common/path.js';
import { Promises } from '../../../base/node/pfs.js';
export async function buildTelemetryMessage(appRoot, extensionsPath) {
    const mergedTelemetry = Object.create(null);
    const mergeTelemetry = (contents, dirName) => {
        const telemetryData = JSON.parse(contents);
        mergedTelemetry[dirName] = telemetryData;
    };
    if (extensionsPath) {
        const dirs = [];
        const files = await Promises.readdir(extensionsPath);
        for (const file of files) {
            try {
                const fileStat = await fs.promises.stat(join(extensionsPath, file));
                if (fileStat.isDirectory()) {
                    dirs.push(file);
                }
            }
            catch {
            }
        }
        const telemetryJsonFolders = [];
        for (const dir of dirs) {
            const files = (await Promises.readdir(join(extensionsPath, dir))).filter(file => file === 'telemetry.json');
            if (files.length === 1) {
                telemetryJsonFolders.push(dir);
            }
        }
        for (const folder of telemetryJsonFolders) {
            const contents = (await fs.promises.readFile(join(extensionsPath, folder, 'telemetry.json'))).toString();
            mergeTelemetry(contents, folder);
        }
    }
    let contents = (await fs.promises.readFile(join(appRoot, 'telemetry-core.json'))).toString();
    mergeTelemetry(contents, 'vscode-core');
    contents = (await fs.promises.readFile(join(appRoot, 'telemetry-extensions.json'))).toString();
    mergeTelemetry(contents, 'vscode-extensions');
    return JSON.stringify(mergedTelemetry, null, 4);
}
