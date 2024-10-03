import * as fs from 'fs';
import { tmpdir } from 'os';
import { Queue } from '../../../base/common/async.js';
import { randomPath } from '../../../base/common/extpath.js';
import { resolveTerminalEncoding } from '../../../base/node/terminalEncoding.js';
export function hasStdinWithoutTty() {
    try {
        return !process.stdin.isTTY;
    }
    catch (error) {
    }
    return false;
}
export function stdinDataListener(durationinMs) {
    return new Promise(resolve => {
        const dataListener = () => resolve(true);
        setTimeout(() => {
            process.stdin.removeListener('data', dataListener);
            resolve(false);
        }, durationinMs);
        process.stdin.once('data', dataListener);
    });
}
export function getStdinFilePath() {
    return randomPath(tmpdir(), 'code-stdin', 3);
}
export async function readFromStdin(targetPath, verbose, onEnd) {
    let [encoding, iconv] = await Promise.all([
        resolveTerminalEncoding(verbose),
        import('@vscode/iconv-lite-umd'),
        fs.promises.appendFile(targetPath, '')
    ]);
    if (!iconv.default.encodingExists(encoding)) {
        console.log(`Unsupported terminal encoding: ${encoding}, falling back to UTF-8.`);
        encoding = 'utf8';
    }
    const appendFileQueue = new Queue();
    const decoder = iconv.default.getDecoder(encoding);
    process.stdin.on('data', chunk => {
        const chunkStr = decoder.write(chunk);
        appendFileQueue.queue(() => fs.promises.appendFile(targetPath, chunkStr));
    });
    process.stdin.on('end', () => {
        const end = decoder.end();
        appendFileQueue.queue(async () => {
            try {
                if (typeof end === 'string') {
                    await fs.promises.appendFile(targetPath, end);
                }
            }
            finally {
                onEnd?.();
            }
        });
    });
}
