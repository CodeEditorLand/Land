var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CodeActionKeybindingResolver_1;
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { codeActionCommandId, fixAllCommandId, organizeImportsCommandId, refactorCommandId, sourceActionCommandId } from './codeAction.js';
import { CodeActionCommandArgs, CodeActionKind } from '../common/types.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
let CodeActionKeybindingResolver = class CodeActionKeybindingResolver {
    static { CodeActionKeybindingResolver_1 = this; }
    static { this.codeActionCommands = [
        refactorCommandId,
        codeActionCommandId,
        sourceActionCommandId,
        organizeImportsCommandId,
        fixAllCommandId
    ]; }
    constructor(keybindingService) {
        this.keybindingService = keybindingService;
    }
    getResolver() {
        const allCodeActionBindings = new Lazy(() => this.keybindingService.getKeybindings()
            .filter(item => CodeActionKeybindingResolver_1.codeActionCommands.indexOf(item.command) >= 0)
            .filter(item => item.resolvedKeybinding)
            .map((item) => {
            let commandArgs = item.commandArgs;
            if (item.command === organizeImportsCommandId) {
                commandArgs = { kind: CodeActionKind.SourceOrganizeImports.value };
            }
            else if (item.command === fixAllCommandId) {
                commandArgs = { kind: CodeActionKind.SourceFixAll.value };
            }
            return {
                resolvedKeybinding: item.resolvedKeybinding,
                ...CodeActionCommandArgs.fromUser(commandArgs, {
                    kind: HierarchicalKind.None,
                    apply: "never"
                })
            };
        }));
        return (action) => {
            if (action.kind) {
                const binding = this.bestKeybindingForCodeAction(action, allCodeActionBindings.value);
                return binding?.resolvedKeybinding;
            }
            return undefined;
        };
    }
    bestKeybindingForCodeAction(action, candidates) {
        if (!action.kind) {
            return undefined;
        }
        const kind = new HierarchicalKind(action.kind);
        return candidates
            .filter(candidate => candidate.kind.contains(kind))
            .filter(candidate => {
            if (candidate.preferred) {
                return action.isPreferred;
            }
            return true;
        })
            .reduceRight((currentBest, candidate) => {
            if (!currentBest) {
                return candidate;
            }
            return currentBest.kind.contains(candidate.kind) ? candidate : currentBest;
        }, undefined);
    }
};
CodeActionKeybindingResolver = CodeActionKeybindingResolver_1 = __decorate([
    __param(0, IKeybindingService),
    __metadata("design:paramtypes", [Object])
], CodeActionKeybindingResolver);
export { CodeActionKeybindingResolver };
