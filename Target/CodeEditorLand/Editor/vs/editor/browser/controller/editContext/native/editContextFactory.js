/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var EditContext;
(function (EditContext) {
    /**
     * Checks if the EditContext is supported in the given window.
     */
    function supported(obj) {
        return typeof obj?.EditContext === 'function';
    }
    EditContext.supported = supported;
    /**
     * Create an edit context. Check that the EditContext is supported using the method {@link EditContext.supported}
     */
    function create(window, options) {
        return new window.EditContext(options);
    }
    EditContext.create = create;
})(EditContext || (EditContext = {}));
