export class TableError extends Error {
    constructor(user, message) {
        super(`TableError [${user}] ${message}`);
    }
}
