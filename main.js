/*
 * Copyright (c) 2013 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


define(function (require, exports, module) {
    "use strict";

    var EditorManager   = brackets.getModule("editor/EditorManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        CodeHintManager = brackets.getModule("editor/CodeHintManager");

    var HintProvider = require('HintProvider'),
        TernManager  = require('TernManager');

    // Load up string utils...
    require("string");

    ExtensionUtils.loadStyleSheet(module, "style/main.css");
    ExtensionUtils.loadStyleSheet(module, "style/hintsMenu.css");
    ExtensionUtils.loadStyleSheet(module, "style/ternSettings.css");

    var _ternManager = new TernManager();
    _ternManager.onReady(function () {
        /*
         * Handle the activeEditorChange event fired by EditorManager.
         * Uninstalls the change listener on the previous editor
         * and installs a change listener on the new editor.
         *
         * @param {Event} event - editor change event (ignored)
         * @param {Editor} current - the new current editor context
         * @param {Editor} previous - the previous editor context
         */
        function handleActiveEditorChange(event, current, previous) {
            if (current) {
                _ternManager.register(current._codeMirror, current.document.file);
            }
        }

        // uninstall/install change listener as the active editor changes
        $(EditorManager).on("activeEditorChange", handleActiveEditorChange);

        // immediately install the current editor
        handleActiveEditorChange(null, EditorManager.getActiveEditor(), null);

        var jsHints = new HintProvider(_ternManager);
        CodeHintManager.registerHintProvider(jsHints, ["javascript"], 1);
    });

});
