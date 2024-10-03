import * as dom from '../../dom.js';
import './aria.css';
const MAX_MESSAGE_LENGTH = 20000;
let ariaContainer;
let alertContainer;
let alertContainer2;
let statusContainer;
let statusContainer2;
export function setARIAContainer(parent) {
    ariaContainer = document.createElement('div');
    ariaContainer.className = 'monaco-aria-container';
    const createAlertContainer = () => {
        const element = document.createElement('div');
        element.className = 'monaco-alert';
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-atomic', 'true');
        ariaContainer.appendChild(element);
        return element;
    };
    alertContainer = createAlertContainer();
    alertContainer2 = createAlertContainer();
    const createStatusContainer = () => {
        const element = document.createElement('div');
        element.className = 'monaco-status';
        element.setAttribute('aria-live', 'polite');
        element.setAttribute('aria-atomic', 'true');
        ariaContainer.appendChild(element);
        return element;
    };
    statusContainer = createStatusContainer();
    statusContainer2 = createStatusContainer();
    parent.appendChild(ariaContainer);
}
export function alert(msg) {
    if (!ariaContainer) {
        return;
    }
    if (alertContainer.textContent !== msg) {
        dom.clearNode(alertContainer2);
        insertMessage(alertContainer, msg);
    }
    else {
        dom.clearNode(alertContainer);
        insertMessage(alertContainer2, msg);
    }
}
export function status(msg) {
    if (!ariaContainer) {
        return;
    }
    if (statusContainer.textContent !== msg) {
        dom.clearNode(statusContainer2);
        insertMessage(statusContainer, msg);
    }
    else {
        dom.clearNode(statusContainer);
        insertMessage(statusContainer2, msg);
    }
}
function insertMessage(target, msg) {
    dom.clearNode(target);
    if (msg.length > MAX_MESSAGE_LENGTH) {
        msg = msg.substr(0, MAX_MESSAGE_LENGTH);
    }
    target.textContent = msg;
    target.style.visibility = 'hidden';
    target.style.visibility = 'visible';
}
