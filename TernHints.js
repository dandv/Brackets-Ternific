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
    'use strict';

    var HintHelper = require("HintHelper");

    function TernHints(ternProvider) {
        var _self = this;
        _self.ternProvider = ternProvider;
    }


    TernHints.prototype.query = function( ) {
        var cm = this._cm;

        return this.ternProvider.query(cm, {
            caseInsensitive: true,
            type: "completions",
            types: true,
            docs: true,
            filter: this.newSession !== true
        })
        .pipe(function(result, query) {
            return {
                text: query.doc.cm.getDoc().getRange(result.start, result.end),
                result: result,
                query: query,
                cm: cm
            };
        },
        function(error) {
            return error;
        });
    };


    /**
    * Utility function that helps determine if the the parameter _char
    * is one that we can start or continue hinting on.  There are some
    * characters that are not hintable.
    */
    TernHints.prototype.canHint = function (_char, cm /*, file*/) {
        var _self = this;
        _self.newSession = cm !== undefined;

        // Whenever cm is not not undefined, we are in a hinting session.
        // Every time cm is not undefined, the HintManager is trying to
        // start a session.
        if (_self.newSession) {
            _self._cm = cm;
        }

        if (!_char || HintHelper.maybeIdentifier(_char)) {
            cm = _self._cm;
            var cursor = cm.getCursor();
            var token = cm.getTokenAt(cursor);

            //
            // Support for inner mode.  Not enabled yet... Need testing.
            //
            //var mode = CodeMirror.innerMode(cm.getMode(), token.state).mode;
            //if ( mode.name !== "javascript" ) {
            //    return false;
            //}

            return HintHelper.hintable(token);
        }

        delete _self._cm;
        return false;
    };


    /**
    * Inserts a hint from the hints object.
    * The idea here is that getHints is called first to build a valid list of hints.
    * Then select one of the hint items from hints returned by getHints.  The selected
    * hint and the hints object are the parameters you supply in insertHint.
    *
    * 1. call getHints.
    * 2. select a hint from the hints returned by getHints
    * 3. feed the selected hint and the list of hints back in insertHint
    */
    TernHints.prototype.insertHint = function( hint, hints ) {
        if ( !hint || !hints ) {
            throw new TypeError("Must provide valid hint and hints object as they are returned by calling getHints");
        }

        hints.cm.getDoc().replaceRange(hint.name, hints.result.start, hints.result.end);
    };


    /**
    * Interface to ask tern for hints.  You can pass in any particular code
    * mirror instance you want to operate on or let ternManager pick the last
    * code mirror instance that was registered via register.
    */
    TernHints.prototype.getHints = function( ) {
        var _self = this;
        var cm = _self._cm;

        if ( !cm ){
            return $.Deferred().reject();
        }

        return this.query();
    };


    return TernHints;

});
