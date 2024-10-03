export class TaskError {
    constructor(severity, message, code) {
        this.severity = severity;
        this.message = message;
        this.code = code;
    }
}
export var Triggers;
(function (Triggers) {
    Triggers.shortcut = 'shortcut';
    Triggers.command = 'command';
    Triggers.reconnect = 'reconnect';
})(Triggers || (Triggers = {}));
