/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Invoked by the loader at run-time
 *
 * @skipMangle
 */
export function load(name, req, load, config) {
    config = config || {};
    const cssConfig = (config["vs/css"] || {});
    if (cssConfig.disabled) {
        // the plugin is asked to not create any style sheets
        load({});
        return;
    }
    const cssUrl = req.toUrl(name + ".css");
    loadCSS(name, cssUrl, () => {
        load({});
    }, (err) => {
        if (typeof load.error === "function") {
            load.error("Could not find " + cssUrl + ".");
        }
    });
}
function loadCSS(name, cssUrl, callback, errorback) {
    if (linkTagExists(name, cssUrl)) {
        callback();
        return;
    }
    createLinkTag(name, cssUrl, callback, errorback);
}
function linkTagExists(name, cssUrl) {
    // eslint-disable-next-line no-restricted-globals
    const links = window.document.getElementsByTagName("link");
    for (let i = 0, len = links.length; i < len; i++) {
        const nameAttr = links[i].getAttribute("data-name");
        const hrefAttr = links[i].getAttribute("href");
        if (nameAttr === name || hrefAttr === cssUrl) {
            return true;
        }
    }
    return false;
}
function createLinkTag(name, cssUrl, callback, errorback) {
    const linkNode = document.createElement("link");
    linkNode.setAttribute("rel", "stylesheet");
    linkNode.setAttribute("type", "text/css");
    linkNode.setAttribute("data-name", name);
    attachListeners(name, linkNode, callback, errorback);
    linkNode.setAttribute("href", cssUrl);
    // eslint-disable-next-line no-restricted-globals
    const head = window.document.head || window.document.getElementsByTagName("head")[0];
    head.appendChild(linkNode);
}
function attachListeners(name, linkNode, callback, errorback) {
    const unbind = () => {
        linkNode.removeEventListener("load", loadEventListener);
        linkNode.removeEventListener("error", errorEventListener);
    };
    const loadEventListener = (e) => {
        unbind();
        callback();
    };
    const errorEventListener = (e) => {
        unbind();
        errorback(e);
    };
    linkNode.addEventListener("load", loadEventListener);
    linkNode.addEventListener("error", errorEventListener);
}
