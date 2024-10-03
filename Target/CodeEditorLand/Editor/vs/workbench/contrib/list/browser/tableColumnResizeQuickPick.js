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
import { Table } from '../../../../base/browser/ui/table/tableWidget.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
let TableColumnResizeQuickPick = class TableColumnResizeQuickPick extends Disposable {
    constructor(_table, _quickInputService) {
        super();
        this._table = _table;
        this._quickInputService = _quickInputService;
    }
    async show() {
        const items = [];
        this._table.getColumnLabels().forEach((label, index) => {
            if (label) {
                items.push({ label, index });
            }
        });
        const column = await this._quickInputService.pick(items, { placeHolder: localize('table.column.selection', "Select the column to resize, type to filter.") });
        if (!column) {
            return;
        }
        const value = await this._quickInputService.input({
            placeHolder: localize('table.column.resizeValue.placeHolder', "i.e. 20, 60, 100..."),
            prompt: localize('table.column.resizeValue.prompt', "Please enter a width in percentage for the '{0}' column.", column.label),
            validateInput: (input) => this._validateColumnResizeValue(input)
        });
        const percentageValue = value ? Number.parseInt(value) : undefined;
        if (!percentageValue) {
            return;
        }
        this._table.resizeColumn(column.index, percentageValue);
    }
    async _validateColumnResizeValue(input) {
        const percentage = Number.parseInt(input);
        if (input && !Number.isInteger(percentage)) {
            return localize('table.column.resizeValue.invalidType', "Please enter an integer.");
        }
        else if (percentage < 0 || percentage > 100) {
            return localize('table.column.resizeValue.invalidRange', "Please enter a number greater than 0 and less than or equal to 100.");
        }
        return null;
    }
};
TableColumnResizeQuickPick = __decorate([
    __param(1, IQuickInputService),
    __metadata("design:paramtypes", [Table, Object])
], TableColumnResizeQuickPick);
export { TableColumnResizeQuickPick };
