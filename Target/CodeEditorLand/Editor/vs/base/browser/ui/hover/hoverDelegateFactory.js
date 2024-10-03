import { Lazy } from '../../../common/lazy.js';
const nullHoverDelegateFactory = () => ({
    get delay() { return -1; },
    dispose: () => { },
    showHover: () => { return undefined; },
});
let hoverDelegateFactory = nullHoverDelegateFactory;
const defaultHoverDelegateMouse = new Lazy(() => hoverDelegateFactory('mouse', false));
const defaultHoverDelegateElement = new Lazy(() => hoverDelegateFactory('element', false));
export function setHoverDelegateFactory(hoverDelegateProvider) {
    hoverDelegateFactory = hoverDelegateProvider;
}
export function getDefaultHoverDelegate(placement) {
    if (placement === 'element') {
        return defaultHoverDelegateElement.value;
    }
    return defaultHoverDelegateMouse.value;
}
export function createInstantHoverDelegate() {
    return hoverDelegateFactory('element', true);
}
