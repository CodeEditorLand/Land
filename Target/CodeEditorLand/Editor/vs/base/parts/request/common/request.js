const offlineName = 'Offline';
export function isOfflineError(error) {
    if (error instanceof OfflineError) {
        return true;
    }
    return error instanceof Error && error.name === offlineName && error.message === offlineName;
}
export class OfflineError extends Error {
    constructor() {
        super(offlineName);
        this.name = this.message;
    }
}
