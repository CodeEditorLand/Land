export class ExtensionRecommendationNotificationServiceChannelClient {
    constructor(channel) {
        this.channel = channel;
    }
    get ignoredRecommendations() { throw new Error('not supported'); }
    promptImportantExtensionsInstallNotification(extensionRecommendations) {
        return this.channel.call('promptImportantExtensionsInstallNotification', [extensionRecommendations]);
    }
    promptWorkspaceRecommendations(recommendations) {
        throw new Error('not supported');
    }
    hasToIgnoreRecommendationNotifications() {
        throw new Error('not supported');
    }
}
export class ExtensionRecommendationNotificationServiceChannel {
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        throw new Error(`Event not found: ${event}`);
    }
    call(_, command, args) {
        switch (command) {
            case 'promptImportantExtensionsInstallNotification': return this.service.promptImportantExtensionsInstallNotification(args[0]);
        }
        throw new Error(`Call not found: ${command}`);
    }
}
