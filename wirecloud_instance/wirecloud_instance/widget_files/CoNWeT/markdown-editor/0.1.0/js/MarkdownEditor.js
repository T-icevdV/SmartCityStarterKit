/*
 * markdown-editor
 * https://github.com/mognom/markdown-editor-widget
 *
 * Copyright (c) 2017 CoNWeT
 * Licensed under the Apache-2.0 license.
 */

/* globals SimpleMDE marked*/
/* exported MarkdownEditor */

var MarkdownEditor = (function () {

    "use strict";

    // =========================================================================
    // CLASS DEFINITION
    // =========================================================================
    var toolbarButton;

    var MarkdownEditor = function MarkdownEditor() {
        // Allow links to be clicked
        var markdown_renderer = new marked.Renderer();
        markdown_renderer.link = function (href, title, text) {
            if (this.options.sanitize) {
                var prot = href.trim();
                if (prot.indexOf("javascript:") === 0) {
                    return "";
                }
            }

            var out = '<a href="' + href + '"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += 'target="_blank"> ' + text + '</a>';
            return out;
        };
        marked.setOptions({
            xhtml: true,
            renderer: markdown_renderer
        });

        SimpleMDE.toggleFullScreen = toggleFullScreen;
        SimpleMDE.prototype.toggleFullScreen = function () {
            toggleFullScreen(this);
        };

        var simplemde = new SimpleMDE({
            element: document.getElementById("textareaId"),
            spellChecker: false,
            previewRender: function (plainText) {
                return marked(plainText);
            },
            toolbar: [
                "bold",
                "italic",
                "heading",
                "|",
                "quote",
                "unordered-list",
                "ordered-list",
                "|",
                "link",
                "image",
                "|",
                "preview",
                {
                    name: "side-by-side",
                    action: toggleSideBySide,
                    className: "fa fa-columns no-disable no-mobile",
                    title: "Toggle Side by Side",
                },
                {
                    name: "fullscreen",
                    action: toggleFullScreen,
                    className: "fa fa-arrows-alt no-disable no-mobile",
                    title: "Fullscreen"
                },
                "|",
                "guide"
            ]
        });

        simplemde.value("**Markdown**");

        simplemde.codemirror.on("change", function () {
            MashupPlatform.wiring.pushEvent("output", simplemde.value().trim());
        });

        MashupPlatform.wiring.registerCallback("input", function (input) {
            simplemde.value(input);
        });

        document.addEventListener('webkitfullscreenchange', onFullScreenExit, false);
        document.addEventListener('mozfullscreenchange', onFullScreenExit, false);
        document.addEventListener('fullscreenchange', onFullScreenExit, false);
        document.addEventListener('MSFullscreenChange', onFullScreenExit, false);
    };

    var toggleSideBySide = function toggleSideBySide(editor) {
        var cm = editor.codemirror;
        var wrapper = cm.getWrapperElement();
        var preview = wrapper.nextSibling;
        var toolbarButton = editor.toolbarElements["side-by-side"];
        var useSideBySideListener = false;
        if (/editor-preview-active-side/.test(preview.className)) {
            preview.className = preview.className.replace(
                /\s*editor-preview-active-side\s*/g, ""
            );
            toolbarButton.className = toolbarButton.className.replace(/\s*active\s*/g, "");
            wrapper.className = wrapper.className.replace(/\s*CodeMirror-sided\s*/g, " ");
        } else {
            // When the preview button is clicked for the first time,
            // give some time for the transition from editor.css to fire and the view to slide from right to left,
            // instead of just appearing.
            setTimeout(function () {
                preview.className += " editor-preview-active-side";
            }, 1);
            toolbarButton.className += " active";
            wrapper.className += " CodeMirror-sided";
            useSideBySideListener = true;
        }

        // Hide normal preview if active
        var previewNormal = wrapper.lastChild;
        if (/editor-preview-active/.test(previewNormal.className)) {
            previewNormal.className = previewNormal.className.replace(
                /\s*editor-preview-active\s*/g, ""
            );
            var toolbar = editor.toolbarElements.preview;
            var toolbar_div = wrapper.previousSibling;
            toolbar.className = toolbar.className.replace(/\s*active\s*/g, "");
            toolbar_div.className = toolbar_div.className.replace(/\s*disabled-for-preview*/g, "");
        }

        var sideBySideRenderingFunction = function () {
            preview.innerHTML = editor.options.previewRender(editor.value(), preview);
        };

        if (!cm.sideBySideRenderingFunction) {
            cm.sideBySideRenderingFunction = sideBySideRenderingFunction;
        }

        if (useSideBySideListener) {
            preview.innerHTML = editor.options.previewRender(editor.value(), preview);
            cm.on("update", cm.sideBySideRenderingFunction);
        } else {
            cm.off("update", cm.sideBySideRenderingFunction);
        }

        // Refresh to fix selection being off (#309)
        cm.refresh();
    };

    var toggleFullScreen = function toggleFullScreen(editor) {

        // Set fullscreen
        // var cm = editor.codemirror;
        // cm.setOption("fullScreen", !cm.getOption("fullScreen"));

        // Update toolbar button
        toolbarButton = editor.toolbarElements.fullscreen;

        if (!/active/.test(toolbarButton.className)) {
            toolbarButton.className += " active";

            // enter full-screen
            var e = document.body;
            if (e.requestFullscreen) {
                e.requestFullscreen();
            } else if (e.webkitRequestFullscreen) {
                e.webkitRequestFullscreen();
            } else if (e.mozRequestFullScreen) {
                e.mozRequestFullScreen();
            } else if (e.msRequestFullscreen) {
                e.msRequestFullscreen();
            }
        } else {
            toolbarButton.className = toolbarButton.className.replace(/\s*active\s*/g, "");

            // exit full-screen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    var onFullScreenExit = function onFullScreenExit() {
        toolbarButton.className = toolbarButton.className.replace(/\s*active\s*/g, "");
    }

    // =========================================================================
    // PRIVATE MEMBERS
    // =========================================================================


    return MarkdownEditor;

})();
