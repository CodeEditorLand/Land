import '../colorPicker.css';
import * as dom from '../../../../../base/browser/dom.js';
import { Color, HSVA } from '../../../../../base/common/color.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { SaturationBox } from './colorPickerSaturationBox.js';
import { InsertButton } from './colorPickerInsertButton.js';
import { HueStrip, OpacityStrip } from './colorPickerStrip.js';
const $ = dom.$;
export class ColorPickerBody extends Disposable {
    constructor(container, model, pixelRatio, isStandaloneColorPicker = false) {
        super();
        this.model = model;
        this.pixelRatio = pixelRatio;
        this._insertButton = null;
        this._domNode = $('.colorpicker-body');
        dom.append(container, this._domNode);
        this._saturationBox = new SaturationBox(this._domNode, this.model, this.pixelRatio);
        this._register(this._saturationBox);
        this._register(this._saturationBox.onDidChange(this.onDidSaturationValueChange, this));
        this._register(this._saturationBox.onColorFlushed(this.flushColor, this));
        this._opacityStrip = new OpacityStrip(this._domNode, this.model, isStandaloneColorPicker);
        this._register(this._opacityStrip);
        this._register(this._opacityStrip.onDidChange(this.onDidOpacityChange, this));
        this._register(this._opacityStrip.onColorFlushed(this.flushColor, this));
        this._hueStrip = new HueStrip(this._domNode, this.model, isStandaloneColorPicker);
        this._register(this._hueStrip);
        this._register(this._hueStrip.onDidChange(this.onDidHueChange, this));
        this._register(this._hueStrip.onColorFlushed(this.flushColor, this));
        if (isStandaloneColorPicker) {
            this._insertButton = this._register(new InsertButton(this._domNode));
            this._domNode.classList.add('standalone-colorpicker');
        }
    }
    flushColor() {
        this.model.flushColor();
    }
    onDidSaturationValueChange({ s, v }) {
        const hsva = this.model.color.hsva;
        this.model.color = new Color(new HSVA(hsva.h, s, v, hsva.a));
    }
    onDidOpacityChange(a) {
        const hsva = this.model.color.hsva;
        this.model.color = new Color(new HSVA(hsva.h, hsva.s, hsva.v, a));
    }
    onDidHueChange(value) {
        const hsva = this.model.color.hsva;
        const h = (1 - value) * 360;
        this.model.color = new Color(new HSVA(h === 360 ? 0 : h, hsva.s, hsva.v, hsva.a));
    }
    get domNode() {
        return this._domNode;
    }
    get saturationBox() {
        return this._saturationBox;
    }
    get opacityStrip() {
        return this._opacityStrip;
    }
    get hueStrip() {
        return this._hueStrip;
    }
    get enterButton() {
        return this._insertButton;
    }
    layout() {
        this._saturationBox.layout();
        this._opacityStrip.layout();
        this._hueStrip.layout();
    }
}
