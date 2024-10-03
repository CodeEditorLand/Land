export class Protocol {
    constructor(sender, onMessage) {
        this.sender = sender;
        this.onMessage = onMessage;
    }
    send(message) {
        try {
            this.sender.send('vscode:message', message.buffer);
        }
        catch (e) {
        }
    }
    disconnect() {
        this.sender.send('vscode:disconnect', null);
    }
}
