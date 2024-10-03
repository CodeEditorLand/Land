import { EditorAction } from '../../../../editor/browser/editorExtensions.js';
import { grammarsExtPoint } from '../../../services/textMate/common/TMGrammars.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
class GrammarContributions {
    static { this._grammars = {}; }
    constructor(contributions) {
        if (!Object.keys(GrammarContributions._grammars).length) {
            this.fillModeScopeMap(contributions);
        }
    }
    fillModeScopeMap(contributions) {
        contributions.forEach((contribution) => {
            contribution.value.forEach((grammar) => {
                if (grammar.language && grammar.scopeName) {
                    GrammarContributions._grammars[grammar.language] = grammar.scopeName;
                }
            });
        });
    }
    getGrammar(mode) {
        return GrammarContributions._grammars[mode];
    }
}
export class EmmetEditorAction extends EditorAction {
    constructor(opts) {
        super(opts);
        this._lastGrammarContributions = null;
        this._lastExtensionService = null;
        this.emmetActionName = opts.actionName;
    }
    static { this.emmetSupportedModes = ['html', 'css', 'xml', 'xsl', 'haml', 'jade', 'jsx', 'slim', 'scss', 'sass', 'less', 'stylus', 'styl', 'svg']; }
    _withGrammarContributions(extensionService) {
        if (this._lastExtensionService !== extensionService) {
            this._lastExtensionService = extensionService;
            this._lastGrammarContributions = extensionService.readExtensionPointContributions(grammarsExtPoint).then((contributions) => {
                return new GrammarContributions(contributions);
            });
        }
        return this._lastGrammarContributions || Promise.resolve(null);
    }
    run(accessor, editor) {
        const extensionService = accessor.get(IExtensionService);
        const commandService = accessor.get(ICommandService);
        return this._withGrammarContributions(extensionService).then((grammarContributions) => {
            if (this.id === 'editor.emmet.action.expandAbbreviation' && grammarContributions) {
                return commandService.executeCommand('emmet.expandAbbreviation', EmmetEditorAction.getLanguage(editor, grammarContributions));
            }
            return undefined;
        });
    }
    static getLanguage(editor, grammars) {
        const model = editor.getModel();
        const selection = editor.getSelection();
        if (!model || !selection) {
            return null;
        }
        const position = selection.getStartPosition();
        model.tokenization.tokenizeIfCheap(position.lineNumber);
        const languageId = model.getLanguageIdAtPosition(position.lineNumber, position.column);
        const syntax = languageId.split('.').pop();
        if (!syntax) {
            return null;
        }
        const checkParentMode = () => {
            const languageGrammar = grammars.getGrammar(syntax);
            if (!languageGrammar) {
                return syntax;
            }
            const languages = languageGrammar.split('.');
            if (languages.length < 2) {
                return syntax;
            }
            for (let i = 1; i < languages.length; i++) {
                const language = languages[languages.length - i];
                if (this.emmetSupportedModes.indexOf(language) !== -1) {
                    return language;
                }
            }
            return syntax;
        };
        return {
            language: syntax,
            parentMode: checkParentMode()
        };
    }
}
