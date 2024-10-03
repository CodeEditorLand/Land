export interface NewWorkerMessage {
    type: '_newWorker';
    id: string;
    port: any;
    url: string;
    options: any | undefined;
}
export interface TerminateWorkerMessage {
    type: '_terminateWorker';
    id: string;
}
