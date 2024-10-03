import * as net from 'net';
export function findFreePort(startPort, giveUpAfter, timeout, stride = 1) {
    let done = false;
    return new Promise(resolve => {
        const timeoutHandle = setTimeout(() => {
            if (!done) {
                done = true;
                return resolve(0);
            }
        }, timeout);
        doFindFreePort(startPort, giveUpAfter, stride, (port) => {
            if (!done) {
                done = true;
                clearTimeout(timeoutHandle);
                return resolve(port);
            }
        });
    });
}
function doFindFreePort(startPort, giveUpAfter, stride, clb) {
    if (giveUpAfter === 0) {
        return clb(0);
    }
    const client = new net.Socket();
    client.once('connect', () => {
        dispose(client);
        return doFindFreePort(startPort + stride, giveUpAfter - 1, stride, clb);
    });
    client.once('data', () => {
    });
    client.once('error', (err) => {
        dispose(client);
        if (err.code !== 'ECONNREFUSED') {
            return doFindFreePort(startPort + stride, giveUpAfter - 1, stride, clb);
        }
        return clb(startPort);
    });
    client.connect(startPort, '127.0.0.1');
}
export const BROWSER_RESTRICTED_PORTS = {
    1: true,
    7: true,
    9: true,
    11: true,
    13: true,
    15: true,
    17: true,
    19: true,
    20: true,
    21: true,
    22: true,
    23: true,
    25: true,
    37: true,
    42: true,
    43: true,
    53: true,
    69: true,
    77: true,
    79: true,
    87: true,
    95: true,
    101: true,
    102: true,
    103: true,
    104: true,
    109: true,
    110: true,
    111: true,
    113: true,
    115: true,
    117: true,
    119: true,
    123: true,
    135: true,
    137: true,
    139: true,
    143: true,
    161: true,
    179: true,
    389: true,
    427: true,
    465: true,
    512: true,
    513: true,
    514: true,
    515: true,
    526: true,
    530: true,
    531: true,
    532: true,
    540: true,
    548: true,
    554: true,
    556: true,
    563: true,
    587: true,
    601: true,
    636: true,
    989: true,
    990: true,
    993: true,
    995: true,
    1719: true,
    1720: true,
    1723: true,
    2049: true,
    3659: true,
    4045: true,
    5060: true,
    5061: true,
    6000: true,
    6566: true,
    6665: true,
    6666: true,
    6667: true,
    6668: true,
    6669: true,
    6697: true,
    10080: true
};
export function findFreePortFaster(startPort, giveUpAfter, timeout, hostname = '127.0.0.1') {
    let resolved = false;
    let timeoutHandle = undefined;
    let countTried = 1;
    const server = net.createServer({ pauseOnConnect: true });
    function doResolve(port, resolve) {
        if (!resolved) {
            resolved = true;
            server.removeAllListeners();
            server.close();
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
            resolve(port);
        }
    }
    return new Promise(resolve => {
        timeoutHandle = setTimeout(() => {
            doResolve(0, resolve);
        }, timeout);
        server.on('listening', () => {
            doResolve(startPort, resolve);
        });
        server.on('error', err => {
            if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES') && (countTried < giveUpAfter)) {
                startPort++;
                countTried++;
                server.listen(startPort, hostname);
            }
            else {
                doResolve(0, resolve);
            }
        });
        server.on('close', () => {
            doResolve(0, resolve);
        });
        server.listen(startPort, hostname);
    });
}
function dispose(socket) {
    try {
        socket.removeAllListeners('connect');
        socket.removeAllListeners('error');
        socket.end();
        socket.destroy();
        socket.unref();
    }
    catch (error) {
        console.error(error);
    }
}
