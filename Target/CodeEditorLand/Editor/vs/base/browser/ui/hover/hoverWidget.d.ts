import { DomScrollableElement } from '../scrollbar/scrollableElement.js';
import { KeyCode } from '../../../common/keyCodes.js';
import { Disposable } from '../../../common/lifecycle.js';
import './hoverWidget.css';
export declare const enum HoverPosition {
    LEFT = 0,
    RIGHT = 1,
    BELOW = 2,
    ABOVE = 3
}
export declare class HoverWidget extends Disposable {
    readonly containerDomNode: HTMLElement;
    readonly contentsDomNode: HTMLElement;
    readonly scrollbar: DomScrollableElement;
    constructor();
    onContentsChanged(): void;
}
export declare class HoverAction extends Disposable {
    static render(parent: HTMLElement, actionOptions: {
        label: string;
        iconClass?: string;
        run: (target: HTMLElement) => void;
        commandId: string;
    }, keybindingLabel: string | null): HoverAction;
    readonly actionLabel: string;
    readonly actionKeybindingLabel: string | null;
    private readonly actionContainer;
    private readonly action;
    private constructor();
    setEnabled(enabled: boolean): void;
}
export declare function getHoverAccessibleViewHint(shouldHaveHint?: boolean, keybinding?: string | null): string | undefined;
export declare class ClickAction extends Disposable {
    constructor(container: HTMLElement, run: (container: HTMLElement) => void);
}
export declare class KeyDownAction extends Disposable {
    constructor(container: HTMLElement, run: (container: HTMLElement) => void, keyCodes: KeyCode[]);
}
