export interface IMonarchLanguage {
    tokenizer: {
        [name: string]: IMonarchLanguageRule[];
    };
    ignoreCase?: boolean;
    unicode?: boolean;
    defaultToken?: string;
    brackets?: IMonarchLanguageBracket[];
    start?: string;
    tokenPostfix?: string;
    includeLF?: boolean;
    [key: string]: any;
}
export type IShortMonarchLanguageRule1 = [string | RegExp, IMonarchLanguageAction];
export type IShortMonarchLanguageRule2 = [string | RegExp, IMonarchLanguageAction, string];
export interface IExpandedMonarchLanguageRule {
    regex?: string | RegExp;
    action?: IMonarchLanguageAction;
    include?: string;
}
export type IMonarchLanguageRule = IShortMonarchLanguageRule1 | IShortMonarchLanguageRule2 | IExpandedMonarchLanguageRule;
export type IShortMonarchLanguageAction = string;
export interface IExpandedMonarchLanguageAction {
    group?: IMonarchLanguageAction[];
    cases?: Object;
    token?: string;
    next?: string;
    switchTo?: string;
    goBack?: number;
    bracket?: string;
    nextEmbedded?: string;
    log?: string;
}
export type IMonarchLanguageAction = IShortMonarchLanguageAction | IExpandedMonarchLanguageAction | (IShortMonarchLanguageAction | IExpandedMonarchLanguageAction)[];
export interface IMonarchLanguageBracket {
    open: string;
    close: string;
    token: string;
}
