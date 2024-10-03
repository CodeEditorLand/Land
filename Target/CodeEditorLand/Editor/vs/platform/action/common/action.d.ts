import { URI, UriDto } from '../../../base/common/uri.js';
import { ContextKeyExpression } from '../../contextkey/common/contextkey.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { Categories } from './actionCommonCategories.js';
import { ICommandMetadata } from '../../commands/common/commands.js';
export interface ILocalizedString {
    value: string;
    original: string;
}
export declare function isLocalizedString(thing: any): thing is ILocalizedString;
export interface ICommandActionTitle extends ILocalizedString {
    mnemonicTitle?: string;
}
export type Icon = {
    dark?: URI;
    light?: URI;
} | ThemeIcon;
export interface ICommandActionToggleInfo {
    condition: ContextKeyExpression;
    icon?: Icon;
    tooltip?: string;
    title?: string;
    mnemonicTitle?: string;
}
export declare function isICommandActionToggleInfo(thing: ContextKeyExpression | ICommandActionToggleInfo | undefined): thing is ICommandActionToggleInfo;
export interface ICommandActionSource {
    readonly id: string;
    readonly title: string;
}
export interface ICommandAction {
    id: string;
    title: string | ICommandActionTitle;
    shortTitle?: string | ICommandActionTitle;
    metadata?: ICommandMetadata;
    category?: keyof typeof Categories | ILocalizedString | string;
    tooltip?: string | ILocalizedString;
    icon?: Icon;
    source?: ICommandActionSource;
    precondition?: ContextKeyExpression;
    toggled?: ContextKeyExpression | ICommandActionToggleInfo;
}
export type ISerializableCommandAction = UriDto<ICommandAction>;
