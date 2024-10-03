import type { IViewportRange, IBufferRange, IBufferLine, IBuffer } from '@xterm/xterm';
import { IRange } from '../../../../../editor/common/core/range.js';
import { OperatingSystem } from '../../../../../base/common/platform.js';
import { IPath } from '../../../../../base/common/path.js';
import { ITerminalCapabilityStore } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
export declare function convertLinkRangeToBuffer(lines: IBufferLine[], bufferWidth: number, range: IRange, startLine: number): IBufferRange;
export declare function convertBufferRangeToViewport(bufferRange: IBufferRange, viewportY: number): IViewportRange;
export declare function getXtermLineContent(buffer: IBuffer, lineStart: number, lineEnd: number, cols: number): string;
export declare function getXtermRangesByAttr(buffer: IBuffer, lineStart: number, lineEnd: number, cols: number): IBufferRange[];
export declare function updateLinkWithRelativeCwd(capabilities: ITerminalCapabilityStore, y: number, text: string, osPath: IPath, logService: ITerminalLogService): string[] | undefined;
export declare function osPathModule(os: OperatingSystem): IPath;
