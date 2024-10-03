import { Event } from '../../../base/common/event.js';
declare class TabFocusImpl {
    private _tabFocus;
    private readonly _onDidChangeTabFocus;
    readonly onDidChangeTabFocus: Event<boolean>;
    getTabFocusMode(): boolean;
    setTabFocusMode(tabFocusMode: boolean): void;
}
export declare const TabFocus: TabFocusImpl;
export {};
