import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
export declare function shouldPasteTerminalText(accessor: ServicesAccessor, text: string, bracketedPasteMode: boolean | undefined): Promise<boolean | {
    modifiedText: string;
}>;
