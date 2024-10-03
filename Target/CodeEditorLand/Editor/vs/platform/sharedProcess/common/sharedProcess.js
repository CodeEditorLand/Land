export const SharedProcessLifecycle = {
    exit: 'vscode:electron-main->shared-process=exit',
    ipcReady: 'vscode:shared-process->electron-main=ipc-ready',
    initDone: 'vscode:shared-process->electron-main=init-done'
};
export const SharedProcessChannelConnection = {
    request: 'vscode:createSharedProcessChannelConnection',
    response: 'vscode:createSharedProcessChannelConnectionResult'
};
export const SharedProcessRawConnection = {
    request: 'vscode:createSharedProcessRawConnection',
    response: 'vscode:createSharedProcessRawConnectionResult'
};
