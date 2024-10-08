export declare class DomReadingContext {
    private readonly _domNode;
    readonly endNode: HTMLElement;
    private _didDomLayout;
    private _clientRectDeltaLeft;
    private _clientRectScale;
    private _clientRectRead;
    get didDomLayout(): boolean;
    private readClientRect;
    get clientRectDeltaLeft(): number;
    get clientRectScale(): number;
    constructor(_domNode: HTMLElement, endNode: HTMLElement);
    markDidDomLayout(): void;
}
