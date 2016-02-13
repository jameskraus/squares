// Squares
// Description: Interactive and embeddable HTML content builder.
// Author: Nikolay Dyankov
// License: MIT

/*

Usage

This script is meant to be embedded in a back-end site builder or similar project.
The usage scenario is the following (for now):

1. Add a class "squares" to the containers that should have editable content
2. Call an API to get the current state of the editor to store it.
3. Call an API to get the generated HTML content for the front-end
4. Include the "squares.css" file in the front-end
5. Insert the previously generated HTML code

*/

;(function ($, window, document, undefined) {
    $(document).ready(function() {

        // On document load, loop over all elements with the "squares" class
        // and initialize a Squares editor on them.
        $('.squares').each(function() {
            new Squares(this);
        });
    });

    // The bulk of the functionality goes here.
    // Squares is the "root" class.
    var squaresDefaultSettings = {
        containers: ['a']
    };

    function Squares(host) {
        // "host" is the direct parent of the embedded editor
        this.host = $(host);
        this.settings = $.extend({}, true, squaresDefaultSettings);
        this.contentRoot = undefined;
        this.root = undefined;
        this.elementsWindow = undefined;

        this.init();
    };
    Squares.prototype.init = function () {
        // Save a reference in the host to the Editor
        this.host.data.editor = this;

        // Insert a container to hold everything
        this.host.append('<div class="sq-root-container"></div>');
        this.root = this.host.find('.sq-root-container');

        // Insert a container to hold all the user generated content
        this.host.find('.sq-root-container').append('<div class="sq-content"></div>');
        this.contentRoot = this.host.find('.sq-content');

        this.addUI();
        this.addEvents();
        this.redraw();
    };
    Squares.prototype.addEvents = function() {
        var self = this;

        // Button for appending a new container
        this.host.find('.sq-add-container').off('click');
        this.host.find('.sq-add-container').on('click', function() {
            self.appendContainer();
            self.redraw();
        });

        // Button for toggling the elements window
        this.host.find('.sq-add-elements').off('click');
        this.host.find('.sq-add-elements').on('click', function() {
            self.elementsWindow.toggle();
        });

        // Button for closing the elements window
        this.elementsWindow.find('.sq-window-close').off('click');
        this.elementsWindow.find('.sq-window-close').on('click', function() {
            self.elementsWindow.hide();
        });
    };
    Squares.prototype.addUI = function() {
        this.appendAddContainerButton();
        this.appendAddElementsButton();
        this.appendElementsWindow();
    };
    Squares.prototype.redraw = function () {
        // Draw containers
        var containersHTML = '';

        for (var i=0; i<this.settings.containers.length; i++) {
            containersHTML += '<div class="sq-container"></div>';
        }

        this.contentRoot.html(containersHTML);

        // If there are no containers, hide the "elements button"
        if (this.settings.containers.length == 0) {
            this.root.find('.sq-add-elements').hide();
        } else {
            this.root.find('.sq-add-elements').show();
        }

        console.log(this.settings);
    };
    Squares.prototype.appendAddContainerButton = function() {
        var addContainerButtonHTML = '<div class="sq-add-container"><i class="fa fa-plus"></i></div>';

        this.root.append(addContainerButtonHTML);
    };
    Squares.prototype.appendAddElementsButton = function() {
        var addElementsButtonHTML = '<div class="sq-add-elements"><i class="fa fa-cube"></i></div>';

        this.root.append(addElementsButtonHTML);
    };
    Squares.prototype.appendElementsWindow = function() {
        var elementsWindowHTML = '';

        elementsWindowHTML += ' <div class="sq-window sq-elements-window">';
        elementsWindowHTML += '     <div class="sq-window-header">';
        elementsWindowHTML += '         <div class="sq-window-title">Elements</div>';
        elementsWindowHTML += '         <div class="sq-window-close"><i class="fa fa-times"></i></div>';
        elementsWindowHTML += '     </div>';

        // Elements
        elementsWindowHTML += '     <div class="sq-window-container">';
        elementsWindowHTML += '         <div class="sq-element-thumb sq-element-thumb-text"><i class="fa fa-font"></i></div>';
        elementsWindowHTML += '         <div class="sq-element-thumb sq-element-thumb-image"><i class="fa fa-picture-o"></i></div>';
        elementsWindowHTML += '         <div class="sq-element-thumb sq-element-thumb-button"><i class="fa fa-hand-pointer-o"></i></div>';
        elementsWindowHTML += '         <div class="sq-element-thumb sq-element-thumb-video"><i class="fa fa-video-camera"></i></div>';
        elementsWindowHTML += '         <div class="sq-element-thumb sq-element-thumb-youtube"><i class="fa fa-youtube"></i></div>';
        elementsWindowHTML += '         <div class="clear"></div>';
        elementsWindowHTML += '     </div>';

        elementsWindowHTML += ' </div>';

        this.root.append(elementsWindowHTML);
        this.elementsWindow = this.root.find('.sq-window');
    };
    Squares.prototype.appendContainer = function() {
        var c = new Container();
        this.settings.containers.push(c);
    };

    // The "Container" class servs literally as a container
    // for Element objects, similar to Bootstrap's "row" class.
    // It will have settings only for layout.

    var containerDefaultSettings = {

    };

    function Container() {
        this.settings = $.extend({}, true, containerDefaultSettings);
    }

    // The element object will represent a single piece of content.
    // Image, text, video, etc.
    // It will have settings for layout and styling

    // Elements to be supported in 0.0.1:
    //
    // - text
    // - image
    // - button
    // - YouTube video
    // - HTML5 video

    var elementDefaultSettings = {

    };

    function Element() {
        this.settings = $.extend({}, true, elementDefaultSettings);
    };

    // =========================================================================
    // API
    // The following functions allow to initialize the editor with a previously
    // saved settings/content, get the current settings/content and generate
    // HTML content for the end user.

    // The "host" parameter is the root element of the editor. It contains
    // (or will contain a reference to the JS class instance).
    // =========================================================================

    $.squaresInitWithSettings = function(settings, host) {

    };

    $.squaresGetCurrentSettings = function(host) {

    };

    $.squaresGenerateHTML = function(host) {

    };

})(jQuery, window, document);
