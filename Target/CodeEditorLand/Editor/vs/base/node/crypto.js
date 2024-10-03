import * as crypto from 'crypto';
import * as fs from 'fs';
import { createSingleCallFunction } from '../common/functional.js';
export async function checksum(path, sha256hash) {
    const checksumPromise = new Promise((resolve, reject) => {
        const input = fs.createReadStream(path);
        const hash = crypto.createHash('sha256');
        input.pipe(hash);
        const done = createSingleCallFunction((err, result) => {
            input.removeAllListeners();
            hash.removeAllListeners();
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
        input.once('error', done);
        input.once('end', done);
        hash.once('error', done);
        hash.once('data', (data) => done(undefined, data.toString('hex')));
    });
    const hash = await checksumPromise;
    if (hash !== sha256hash) {
        throw new Error('Hash mismatch');
    }
}
