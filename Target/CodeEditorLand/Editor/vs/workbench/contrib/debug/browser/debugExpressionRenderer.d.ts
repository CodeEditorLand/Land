import { IHighlight } from '../../../../base/browser/ui/highlightedlabel/highlightedLabel.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IDebugSession, IExpressionValue } from '../common/debug.js';
import { Variable } from '../common/debugModel.js';
import { IVariableTemplateData } from './baseDebugView.js';
export interface IValueHoverOptions {
    commands?: {
        id: string;
        args: unknown[];
    }[];
}
export interface IRenderValueOptions {
    showChanged?: boolean;
    maxValueLength?: number;
    hover?: false | IValueHoverOptions;
    colorize?: boolean;
    wasANSI?: boolean;
    session?: IDebugSession;
    locationReference?: number;
}
export interface IRenderVariableOptions {
    showChanged?: boolean;
    highlights?: IHighlight[];
}
export declare class DebugExpressionRenderer {
    private readonly commandService;
    private readonly hoverService;
    private displayType;
    private readonly linkDetector;
    constructor(commandService: ICommandService, configurationService: IConfigurationService, instantiationService: IInstantiationService, hoverService: IHoverService);
    renderVariable(data: IVariableTemplateData, variable: Variable, options?: IRenderVariableOptions): IDisposable;
    renderValue(container: HTMLElement, expressionOrValue: IExpressionValue | string, options?: IRenderValueOptions): IDisposable;
}
