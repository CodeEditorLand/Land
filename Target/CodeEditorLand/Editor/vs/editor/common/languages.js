import { Codicon } from '../../base/common/codicons.js';
import { URI } from '../../base/common/uri.js';
import { EditOperation } from './core/editOperation.js';
import { Range } from './core/range.js';
import { TokenizationRegistry as TokenizationRegistryImpl } from './tokenizationRegistry.js';
import { localize } from '../../nls.js';
export class Token {
    constructor(offset, type, language) {
        this.offset = offset;
        this.type = type;
        this.language = language;
        this._tokenBrand = undefined;
    }
    toString() {
        return '(' + this.offset + ', ' + this.type + ')';
    }
}
export class TokenizationResult {
    constructor(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
        this._tokenizationResultBrand = undefined;
    }
}
export class EncodedTokenizationResult {
    constructor(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
        this._encodedTokenizationResultBrand = undefined;
    }
}
export var HoverVerbosityAction;
(function (HoverVerbosityAction) {
    HoverVerbosityAction[HoverVerbosityAction["Increase"] = 0] = "Increase";
    HoverVerbosityAction[HoverVerbosityAction["Decrease"] = 1] = "Decrease";
})(HoverVerbosityAction || (HoverVerbosityAction = {}));
export var CompletionItemKinds;
(function (CompletionItemKinds) {
    const byKind = new Map();
    byKind.set(0, Codicon.symbolMethod);
    byKind.set(1, Codicon.symbolFunction);
    byKind.set(2, Codicon.symbolConstructor);
    byKind.set(3, Codicon.symbolField);
    byKind.set(4, Codicon.symbolVariable);
    byKind.set(5, Codicon.symbolClass);
    byKind.set(6, Codicon.symbolStruct);
    byKind.set(7, Codicon.symbolInterface);
    byKind.set(8, Codicon.symbolModule);
    byKind.set(9, Codicon.symbolProperty);
    byKind.set(10, Codicon.symbolEvent);
    byKind.set(11, Codicon.symbolOperator);
    byKind.set(12, Codicon.symbolUnit);
    byKind.set(13, Codicon.symbolValue);
    byKind.set(15, Codicon.symbolEnum);
    byKind.set(14, Codicon.symbolConstant);
    byKind.set(15, Codicon.symbolEnum);
    byKind.set(16, Codicon.symbolEnumMember);
    byKind.set(17, Codicon.symbolKeyword);
    byKind.set(27, Codicon.symbolSnippet);
    byKind.set(18, Codicon.symbolText);
    byKind.set(19, Codicon.symbolColor);
    byKind.set(20, Codicon.symbolFile);
    byKind.set(21, Codicon.symbolReference);
    byKind.set(22, Codicon.symbolCustomColor);
    byKind.set(23, Codicon.symbolFolder);
    byKind.set(24, Codicon.symbolTypeParameter);
    byKind.set(25, Codicon.account);
    byKind.set(26, Codicon.issues);
    function toIcon(kind) {
        let codicon = byKind.get(kind);
        if (!codicon) {
            console.info('No codicon found for CompletionItemKind ' + kind);
            codicon = Codicon.symbolProperty;
        }
        return codicon;
    }
    CompletionItemKinds.toIcon = toIcon;
    const data = new Map();
    data.set('method', 0);
    data.set('function', 1);
    data.set('constructor', 2);
    data.set('field', 3);
    data.set('variable', 4);
    data.set('class', 5);
    data.set('struct', 6);
    data.set('interface', 7);
    data.set('module', 8);
    data.set('property', 9);
    data.set('event', 10);
    data.set('operator', 11);
    data.set('unit', 12);
    data.set('value', 13);
    data.set('constant', 14);
    data.set('enum', 15);
    data.set('enum-member', 16);
    data.set('enumMember', 16);
    data.set('keyword', 17);
    data.set('snippet', 27);
    data.set('text', 18);
    data.set('color', 19);
    data.set('file', 20);
    data.set('reference', 21);
    data.set('customcolor', 22);
    data.set('folder', 23);
    data.set('type-parameter', 24);
    data.set('typeParameter', 24);
    data.set('account', 25);
    data.set('issue', 26);
    function fromString(value, strict) {
        let res = data.get(value);
        if (typeof res === 'undefined' && !strict) {
            res = 9;
        }
        return res;
    }
    CompletionItemKinds.fromString = fromString;
})(CompletionItemKinds || (CompletionItemKinds = {}));
export var InlineCompletionTriggerKind;
(function (InlineCompletionTriggerKind) {
    InlineCompletionTriggerKind[InlineCompletionTriggerKind["Automatic"] = 0] = "Automatic";
    InlineCompletionTriggerKind[InlineCompletionTriggerKind["Explicit"] = 1] = "Explicit";
})(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
export class SelectedSuggestionInfo {
    constructor(range, text, completionKind, isSnippetText) {
        this.range = range;
        this.text = text;
        this.completionKind = completionKind;
        this.isSnippetText = isSnippetText;
    }
    equals(other) {
        return Range.lift(this.range).equalsRange(other.range)
            && this.text === other.text
            && this.completionKind === other.completionKind
            && this.isSnippetText === other.isSnippetText;
    }
}
export var DocumentPasteTriggerKind;
(function (DocumentPasteTriggerKind) {
    DocumentPasteTriggerKind[DocumentPasteTriggerKind["Automatic"] = 0] = "Automatic";
    DocumentPasteTriggerKind[DocumentPasteTriggerKind["PasteAs"] = 1] = "PasteAs";
})(DocumentPasteTriggerKind || (DocumentPasteTriggerKind = {}));
export var SignatureHelpTriggerKind;
(function (SignatureHelpTriggerKind) {
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
})(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
export var DocumentHighlightKind;
(function (DocumentHighlightKind) {
    DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
    DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
    DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
export function isLocationLink(thing) {
    return thing
        && URI.isUri(thing.uri)
        && Range.isIRange(thing.range)
        && (Range.isIRange(thing.originSelectionRange) || Range.isIRange(thing.targetSelectionRange));
}
export function isLocation(thing) {
    return thing
        && URI.isUri(thing.uri)
        && Range.isIRange(thing.range);
}
export const symbolKindNames = {
    [17]: localize('Array', "array"),
    [16]: localize('Boolean', "boolean"),
    [4]: localize('Class', "class"),
    [13]: localize('Constant', "constant"),
    [8]: localize('Constructor', "constructor"),
    [9]: localize('Enum', "enumeration"),
    [21]: localize('EnumMember', "enumeration member"),
    [23]: localize('Event', "event"),
    [7]: localize('Field', "field"),
    [0]: localize('File', "file"),
    [11]: localize('Function', "function"),
    [10]: localize('Interface', "interface"),
    [19]: localize('Key', "key"),
    [5]: localize('Method', "method"),
    [1]: localize('Module', "module"),
    [2]: localize('Namespace', "namespace"),
    [20]: localize('Null', "null"),
    [15]: localize('Number', "number"),
    [18]: localize('Object', "object"),
    [24]: localize('Operator', "operator"),
    [3]: localize('Package', "package"),
    [6]: localize('Property', "property"),
    [14]: localize('String', "string"),
    [22]: localize('Struct', "struct"),
    [25]: localize('TypeParameter', "type parameter"),
    [12]: localize('Variable', "variable"),
};
export function getAriaLabelForSymbol(symbolName, kind) {
    return localize('symbolAriaLabel', '{0} ({1})', symbolName, symbolKindNames[kind]);
}
export var SymbolKinds;
(function (SymbolKinds) {
    const byKind = new Map();
    byKind.set(0, Codicon.symbolFile);
    byKind.set(1, Codicon.symbolModule);
    byKind.set(2, Codicon.symbolNamespace);
    byKind.set(3, Codicon.symbolPackage);
    byKind.set(4, Codicon.symbolClass);
    byKind.set(5, Codicon.symbolMethod);
    byKind.set(6, Codicon.symbolProperty);
    byKind.set(7, Codicon.symbolField);
    byKind.set(8, Codicon.symbolConstructor);
    byKind.set(9, Codicon.symbolEnum);
    byKind.set(10, Codicon.symbolInterface);
    byKind.set(11, Codicon.symbolFunction);
    byKind.set(12, Codicon.symbolVariable);
    byKind.set(13, Codicon.symbolConstant);
    byKind.set(14, Codicon.symbolString);
    byKind.set(15, Codicon.symbolNumber);
    byKind.set(16, Codicon.symbolBoolean);
    byKind.set(17, Codicon.symbolArray);
    byKind.set(18, Codicon.symbolObject);
    byKind.set(19, Codicon.symbolKey);
    byKind.set(20, Codicon.symbolNull);
    byKind.set(21, Codicon.symbolEnumMember);
    byKind.set(22, Codicon.symbolStruct);
    byKind.set(23, Codicon.symbolEvent);
    byKind.set(24, Codicon.symbolOperator);
    byKind.set(25, Codicon.symbolTypeParameter);
    function toIcon(kind) {
        let icon = byKind.get(kind);
        if (!icon) {
            console.info('No codicon found for SymbolKind ' + kind);
            icon = Codicon.symbolProperty;
        }
        return icon;
    }
    SymbolKinds.toIcon = toIcon;
})(SymbolKinds || (SymbolKinds = {}));
export class TextEdit {
    static asEditOperation(edit) {
        return EditOperation.replace(Range.lift(edit.range), edit.text);
    }
}
export class FoldingRangeKind {
    static { this.Comment = new FoldingRangeKind('comment'); }
    static { this.Imports = new FoldingRangeKind('imports'); }
    static { this.Region = new FoldingRangeKind('region'); }
    static fromValue(value) {
        switch (value) {
            case 'comment': return FoldingRangeKind.Comment;
            case 'imports': return FoldingRangeKind.Imports;
            case 'region': return FoldingRangeKind.Region;
        }
        return new FoldingRangeKind(value);
    }
    constructor(value) {
        this.value = value;
    }
}
export var NewSymbolNameTag;
(function (NewSymbolNameTag) {
    NewSymbolNameTag[NewSymbolNameTag["AIGenerated"] = 1] = "AIGenerated";
})(NewSymbolNameTag || (NewSymbolNameTag = {}));
export var NewSymbolNameTriggerKind;
(function (NewSymbolNameTriggerKind) {
    NewSymbolNameTriggerKind[NewSymbolNameTriggerKind["Invoke"] = 0] = "Invoke";
    NewSymbolNameTriggerKind[NewSymbolNameTriggerKind["Automatic"] = 1] = "Automatic";
})(NewSymbolNameTriggerKind || (NewSymbolNameTriggerKind = {}));
export var Command;
(function (Command) {
    function is(obj) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        return typeof obj.id === 'string' &&
            typeof obj.title === 'string';
    }
    Command.is = is;
})(Command || (Command = {}));
export var CommentThreadCollapsibleState;
(function (CommentThreadCollapsibleState) {
    CommentThreadCollapsibleState[CommentThreadCollapsibleState["Collapsed"] = 0] = "Collapsed";
    CommentThreadCollapsibleState[CommentThreadCollapsibleState["Expanded"] = 1] = "Expanded";
})(CommentThreadCollapsibleState || (CommentThreadCollapsibleState = {}));
export var CommentThreadState;
(function (CommentThreadState) {
    CommentThreadState[CommentThreadState["Unresolved"] = 0] = "Unresolved";
    CommentThreadState[CommentThreadState["Resolved"] = 1] = "Resolved";
})(CommentThreadState || (CommentThreadState = {}));
export var CommentThreadApplicability;
(function (CommentThreadApplicability) {
    CommentThreadApplicability[CommentThreadApplicability["Current"] = 0] = "Current";
    CommentThreadApplicability[CommentThreadApplicability["Outdated"] = 1] = "Outdated";
})(CommentThreadApplicability || (CommentThreadApplicability = {}));
export var CommentMode;
(function (CommentMode) {
    CommentMode[CommentMode["Editing"] = 0] = "Editing";
    CommentMode[CommentMode["Preview"] = 1] = "Preview";
})(CommentMode || (CommentMode = {}));
export var CommentState;
(function (CommentState) {
    CommentState[CommentState["Published"] = 0] = "Published";
    CommentState[CommentState["Draft"] = 1] = "Draft";
})(CommentState || (CommentState = {}));
export var InlayHintKind;
(function (InlayHintKind) {
    InlayHintKind[InlayHintKind["Type"] = 1] = "Type";
    InlayHintKind[InlayHintKind["Parameter"] = 2] = "Parameter";
})(InlayHintKind || (InlayHintKind = {}));
export class LazyTokenizationSupport {
    constructor(createSupport) {
        this.createSupport = createSupport;
        this._tokenizationSupport = null;
    }
    dispose() {
        if (this._tokenizationSupport) {
            this._tokenizationSupport.then((support) => {
                if (support) {
                    support.dispose();
                }
            });
        }
    }
    get tokenizationSupport() {
        if (!this._tokenizationSupport) {
            this._tokenizationSupport = this.createSupport();
        }
        return this._tokenizationSupport;
    }
}
export const TokenizationRegistry = new TokenizationRegistryImpl();
export const TreeSitterTokenizationRegistry = new TokenizationRegistryImpl();
export var ExternalUriOpenerPriority;
(function (ExternalUriOpenerPriority) {
    ExternalUriOpenerPriority[ExternalUriOpenerPriority["None"] = 0] = "None";
    ExternalUriOpenerPriority[ExternalUriOpenerPriority["Option"] = 1] = "Option";
    ExternalUriOpenerPriority[ExternalUriOpenerPriority["Default"] = 2] = "Default";
    ExternalUriOpenerPriority[ExternalUriOpenerPriority["Preferred"] = 3] = "Preferred";
})(ExternalUriOpenerPriority || (ExternalUriOpenerPriority = {}));
export var InlineEditTriggerKind;
(function (InlineEditTriggerKind) {
    InlineEditTriggerKind[InlineEditTriggerKind["Invoke"] = 0] = "Invoke";
    InlineEditTriggerKind[InlineEditTriggerKind["Automatic"] = 1] = "Automatic";
})(InlineEditTriggerKind || (InlineEditTriggerKind = {}));
