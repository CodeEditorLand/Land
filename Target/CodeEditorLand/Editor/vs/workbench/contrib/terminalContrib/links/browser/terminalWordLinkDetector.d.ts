import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { ITerminalSimpleLink, ITerminalLinkDetector } from './links.js';
import type { IBufferLine, Terminal } from '@xterm/xterm';
export declare class TerminalWordLinkDetector extends Disposable implements ITerminalLinkDetector {
    readonly xterm: Terminal;
    private readonly _configurationService;
    private readonly _productService;
    static id: string;
    readonly maxLinkLength = 100;
    private _separatorRegex;
    constructor(xterm: Terminal, _configurationService: IConfigurationService, _productService: IProductService);
    detect(lines: IBufferLine[], startLine: number, endLine: number): ITerminalSimpleLink[];
    private _parseWords;
    private _refreshSeparatorCodes;
}
