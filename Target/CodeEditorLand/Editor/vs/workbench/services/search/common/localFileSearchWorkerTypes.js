export class LocalFileSearchSimpleWorkerHost {
    static { this.CHANNEL_NAME = 'localFileSearchWorkerHost'; }
    static getChannel(workerServer) {
        return workerServer.getChannel(LocalFileSearchSimpleWorkerHost.CHANNEL_NAME);
    }
    static setChannel(workerClient, obj) {
        workerClient.setChannel(LocalFileSearchSimpleWorkerHost.CHANNEL_NAME, obj);
    }
}
