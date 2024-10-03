import electron from 'electron';
export const defaultWindowState = function (mode = 1) {
    return {
        width: 1024,
        height: 768,
        mode
    };
};
export const defaultAuxWindowState = function () {
    const width = 800;
    const height = 600;
    const workArea = electron.screen.getPrimaryDisplay().workArea;
    const x = Math.max(workArea.x + (workArea.width / 2) - (width / 2), 0);
    const y = Math.max(workArea.y + (workArea.height / 2) - (height / 2), 0);
    return {
        x,
        y,
        width,
        height,
        mode: 1
    };
};
