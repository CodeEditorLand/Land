import { IFilter } from '../../../../base/common/filters.js';
import { IExpression } from '../../../../base/common/glob.js';
import { URI } from '../../../../base/common/uri.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
export declare class ResourceGlobMatcher {
    private readonly globalExpression;
    private readonly expressionsByRoot;
    constructor(globalExpression: IExpression, rootExpressions: {
        root: URI;
        expression: IExpression;
    }[], uriIdentityService: IUriIdentityService);
    matches(resource: URI): boolean;
}
export declare class FilterOptions {
    readonly filter: string;
    static readonly _filter: IFilter;
    static readonly _messageFilter: IFilter;
    readonly showWarnings: boolean;
    readonly showErrors: boolean;
    readonly showInfos: boolean;
    readonly textFilter: {
        readonly text: string;
        readonly negate: boolean;
    };
    readonly excludesMatcher: ResourceGlobMatcher;
    readonly includesMatcher: ResourceGlobMatcher;
    static EMPTY(uriIdentityService: IUriIdentityService): FilterOptions;
    constructor(filter: string, filesExclude: {
        root: URI;
        expression: IExpression;
    }[] | IExpression, showWarnings: boolean, showErrors: boolean, showInfos: boolean, uriIdentityService: IUriIdentityService);
    private setPattern;
}
