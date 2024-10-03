import { IAction } from '../../../base/common/actions.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import BaseSeverity from '../../../base/common/severity.js';
export import Severity = BaseSeverity;
export declare const INotificationService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<INotificationService>;
export type NotificationMessage = string | Error;
export declare enum NotificationPriority {
    DEFAULT = 0,
    SILENT = 1,
    URGENT = 2
}
export interface INotificationProperties {
    readonly sticky?: boolean;
    readonly priority?: NotificationPriority;
    readonly neverShowAgain?: INeverShowAgainOptions;
}
export declare enum NeverShowAgainScope {
    WORKSPACE = 0,
    PROFILE = 1,
    APPLICATION = 2
}
export interface INeverShowAgainOptions {
    readonly id: string;
    readonly isSecondary?: boolean;
    readonly scope?: NeverShowAgainScope;
}
export interface INotificationSource {
    readonly id: string;
    readonly label: string;
}
export declare function isNotificationSource(thing: unknown): thing is INotificationSource;
export interface INotification extends INotificationProperties {
    readonly id?: string;
    readonly severity: Severity;
    readonly message: NotificationMessage;
    readonly source?: string | INotificationSource;
    actions?: INotificationActions;
    readonly progress?: INotificationProgressProperties;
}
export interface INotificationActions {
    readonly primary?: readonly IAction[];
    readonly secondary?: readonly IAction[];
}
export interface INotificationProgressProperties {
    readonly infinite?: boolean;
    readonly total?: number;
    readonly worked?: number;
}
export interface INotificationProgress {
    infinite(): void;
    total(value: number): void;
    worked(value: number): void;
    done(): void;
}
export interface INotificationHandle {
    readonly onDidClose: Event<void>;
    readonly onDidChangeVisibility: Event<boolean>;
    readonly progress: INotificationProgress;
    updateSeverity(severity: Severity): void;
    updateMessage(message: NotificationMessage): void;
    updateActions(actions?: INotificationActions): void;
    close(): void;
}
interface IBasePromptChoice {
    readonly label: string;
    readonly keepOpen?: boolean;
    run: () => void;
}
export interface IPromptChoice extends IBasePromptChoice {
    readonly isSecondary?: boolean;
}
export interface IPromptChoiceWithMenu extends IPromptChoice {
    readonly menu: IBasePromptChoice[];
    readonly isSecondary: false | undefined;
}
export interface IPromptOptions extends INotificationProperties {
    onCancel?: () => void;
}
export interface IStatusMessageOptions {
    readonly showAfter?: number;
    readonly hideAfter?: number;
}
export declare enum NotificationsFilter {
    OFF = 0,
    ERROR = 1
}
export interface INotificationSourceFilter extends INotificationSource {
    readonly filter: NotificationsFilter;
}
export interface INotificationService {
    readonly _serviceBrand: undefined;
    readonly onDidAddNotification: Event<INotification>;
    readonly onDidRemoveNotification: Event<INotification>;
    readonly onDidChangeFilter: Event<void>;
    setFilter(filter: NotificationsFilter | INotificationSourceFilter): void;
    getFilter(source?: INotificationSource): NotificationsFilter;
    getFilters(): INotificationSourceFilter[];
    removeFilter(sourceId: string): void;
    notify(notification: INotification): INotificationHandle;
    info(message: NotificationMessage | NotificationMessage[]): void;
    warn(message: NotificationMessage | NotificationMessage[]): void;
    error(message: NotificationMessage | NotificationMessage[]): void;
    prompt(severity: Severity, message: string, choices: (IPromptChoice | IPromptChoiceWithMenu)[], options?: IPromptOptions): INotificationHandle;
    status(message: NotificationMessage, options?: IStatusMessageOptions): IDisposable;
}
export declare class NoOpNotification implements INotificationHandle {
    readonly progress: NoOpProgress;
    readonly onDidClose: Event<any>;
    readonly onDidChangeVisibility: Event<any>;
    updateSeverity(severity: Severity): void;
    updateMessage(message: NotificationMessage): void;
    updateActions(actions?: INotificationActions): void;
    close(): void;
}
export declare class NoOpProgress implements INotificationProgress {
    infinite(): void;
    done(): void;
    total(value: number): void;
    worked(value: number): void;
}
export {};
