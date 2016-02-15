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

    var elementsWindow = undefined, elementSettingsWindow = undefined;

    // The bulk of the functionality goes here.
    // Squares is the "root" class.
    var squaresDefaultSettings = {
        containers: ['a', 'b', 'c', 'd']
    };

    function Squares(host) {
        // "host" is the direct parent of the embedded editor
        this.host = $(host);
        this.settings = $.extend({}, true, squaresDefaultSettings);
        this.contentRoot = undefined;
        this.root = undefined;
        this.elementsWindow = undefined;

        // Drag general flags
        this.ix = 0; // initial dragged object x
        this.iy = 0; // initial dragged object x
        this.iex = 0; // initial event x
        this.iey = 0; // initial event y

        // Drag container flags
        this.shouldStartDraggingContainer = false;
        this.didStartDraggingContainer = false;
        this.draggingContainer = false;

        // Drag container vars
        this.draggedContainerIndex = 0;
        this.draggedContainer = undefined;
        this.dummyContainer = undefined;
        this.containerReorderMap = undefined;
        this.newIndexOfDraggedContainer = 0;

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
            self.toggleElementsWindow();
        });

        // Reorder containers functionality

        $(document).off('mousedown', '.sq-container-move');
        $(document).on('mousedown', '.sq-container-move', function(e) {
            // If there is just one container, then don't do anything
            if (self.settings.containers.length <= 1) return;

            self.iex = e.pageX;
            self.iey = e.pageY;
            self.shouldStartDraggingContainer = true;
            self.draggedContainerIndex = $(e.target).closest('.sq-container').data('index');
            self.draggedContainer = self.host.find('.sq-container[data-index='+ self.draggedContainerIndex +']');
        });
        $(document).off('mousemove.container');
        $(document).on('mousemove.container', function(e) {
            if (self.shouldStartDraggingContainer && !self.didStartDraggingContainer) {
                if (Math.abs(e.pageX - self.iex) > 5 || Math.abs(e.pageY - self.iey) > 5) {
                    self.draggingContainer = true;
                    self.didStartDraggingContainer = true;

                    // Create a virtual map of the current containers
                    self.containerReorderMap = new Array();
                    for (var i=0; i<self.settings.containers.length; i++) {
                        var c = self.host.find('.sq-container[data-index='+ i +']');
                        var y = c.position().top + c.outerHeight()/2;
                        self.containerReorderMap.push(y);
                    }

                    // Position the container absolutely
                    self.ix = self.draggedContainer.position().left;
                    self.iy = self.draggedContainer.position().top;

                    self.draggedContainer.css({
                        position: 'absolute',
                        left: self.ix,
                        top: self.iy,
                        width: self.draggedContainer.width()
                    });

                    self.draggedContainer.addClass('sq-dragging');

                    // Insert a dummy container
                    self.draggedContainer.after('<div id="sq-dummy-container"></div>');
                    self.dummyContainer = $('#sq-dummy-container');
                    self.dummyContainer.css({
                        width: self.draggedContainer.outerWidth(),
                        height: self.draggedContainer.outerHeight()
                    });
                }
            }

            if (self.draggingContainer) {
                self.draggedContainer.css({
                    left: self.ix + e.pageX - self.iex,
                    top: self.iy + e.pageY - self.iey
                });

                var y = self.draggedContainer.position().top + self.draggedContainer.outerHeight()/2;
                var closestDeltaY = 999999;
                var closestIndex = undefined;

                for (var i=0; i<self.containerReorderMap.length; i++) {
                    if (Math.abs(y - self.containerReorderMap[i]) < closestDeltaY) {
                        closestDeltaY = Math.abs(y - self.containerReorderMap[i]);
                        closestIndex = i;
                    }
                }

                // If the closest index changed, move the dummy container to the
                // new position.
                if (closestIndex != self.newIndexOfDraggedContainer) {
                    self.newIndexOfDraggedContainer = closestIndex;

                    self.dummyContainer.remove();

                    if (self.newIndexOfDraggedContainer < self.draggedContainerIndex) {
                        self.host.find('.sq-container[data-index='+ self.newIndexOfDraggedContainer +']').before('<div id="sq-dummy-container"></div>');
                    } else {
                        self.host.find('.sq-container[data-index='+ self.newIndexOfDraggedContainer +']').after('<div id="sq-dummy-container"></div>');
                    }

                    self.dummyContainer = $('#sq-dummy-container');
                    self.dummyContainer.css({
                        width: self.draggedContainer.outerWidth(),
                        height: self.draggedContainer.outerHeight()
                    });
                }
            }
        });
        $(document).off('mouseup.container');
        $(document).on('mouseup.container', function(e) {
            if (self.draggingContainer) {
                // Switch places of containers
                if (self.draggedContainerIndex != self.newIndexOfDraggedContainer) {
                    var a = self.settings.containers[self.newIndexOfDraggedContainer];

                    self.settings.containers[self.newIndexOfDraggedContainer] = self.settings.containers[self.draggedContainerIndex];
                    self.settings.containers[self.draggedContainerIndex] = a;
                }

                // Redraw
                self.redraw();
            }

            self.shouldStartDraggingContainer = false;
            self.didStartDraggingContainer = false;
            self.draggingContainer = false;

            self.draggedContainerIndex = 0;
            self.draggedContainer = undefined;
            self.dummyContainer = undefined;
        });

        // [end] Reorder containers functionality
    };
    Squares.prototype.addUI = function() {
        this.appendAddContainerButton();
        this.appendAddElementsButton();

        // Create windows
        new ElementsWindow();
    };
    Squares.prototype.appendAddContainerButton = function() {
        var addContainerButtonHTML = '<div class="sq-add-container"><i class="fa fa-plus"></i></div>';

        this.root.append(addContainerButtonHTML);
    };
    Squares.prototype.appendAddElementsButton = function() {
        var addElementsButtonHTML = '<div class="sq-add-elements"><i class="fa fa-cube"></i></div>';

        this.root.append(addElementsButtonHTML);
    };
    Squares.prototype.appendContainer = function() {
        var c = new Container();
        this.settings.containers.push(c);
    };

    Squares.prototype.redraw = function () {
        // Draw containers
        var containersHTML = '';

        for (var i=0; i<this.settings.containers.length; i++) {
            containersHTML += '<div class="sq-container" data-index="'+ i +'">';

            containersHTML += '     <div class="sq-container-move"></div>';
            containersHTML += this.settings.containers[i];

            containersHTML += '</div>';
        }

        this.contentRoot.html(containersHTML);

        // If there are no containers, hide the "elements button"
        if (this.settings.containers.length == 0) {
            this.root.find('.sq-add-elements').hide();
        } else {
            this.root.find('.sq-add-elements').show();
        }
    };

    Squares.prototype.toggleElementsWindow = function() {
        var self = this;

        elementsWindow.toggle();
        elementsWindow.css({
            left: self.root.offset().left + self.root.width() + 20,
            top: self.root.offset().top
        });
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

    // The Window object is responsible for creating and manipulating modal
    // windows. There will be a single set of windows attached to the DOM
    // at any given time, regardless of the number of editors.

    // When opened, the windows will load with the active editor's settings.

    function ElementsWindow() {
        // flags for dragging the window
        this.shouldStartDragging = false;
        this.didStartDragging = false;
        this.dragging = false;
        this.iex = 0; // initial event x
        this.iey = 0; // initial event y
        this.ix = 0; // initial window x
        this.iy = 0; // initial window y

        this.init();
    }
    ElementsWindow.prototype.init = function() {
        if (elementsWindow === undefined) {
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

            if ($('.sq-windows-root').length == 0) {
                $('body').prepend('<div class="sq-windows-root"></div>');
            }

            $('.sq-windows-root').append(elementsWindowHTML);

            elementsWindow = $('.sq-windows-root').find('.sq-elements-window');

            this.events();
        }
    }
    ElementsWindow.prototype.events = function() {
        var self = this;

        // Button for closing the elements window
        elementsWindow.find('.sq-window-close').off('click');
        elementsWindow.find('.sq-window-close').on('click', function(e) {
            elementsWindow.hide();
        });

        // Move the window by dragging its header
        elementsWindow.find('.sq-window-header').off('mousedown');
        elementsWindow.find('.sq-window-header').on('mousedown', function(e) {
            self.shouldStartDragging = true;

            self.iex = e.pageX;
            self.iey = e.pageY;
        });
        $(document).off('mousemove.window');
        $(document).on('mousemove.window', function(e) {
            // Start moving the window only if the user drags it by 5 pixels or
            // more, to prevent accidental drag
            if (self.shouldStartDragging && !self.didStartDragging) {
                if (Math.abs(e.pageX - self.iex) > 5 || Math.abs(e.pageY - self.iey) > 5) {
                    self.ix = elementsWindow.offset().left;
                    self.iy = elementsWindow.offset().top;
                    self.dragging = true;
                    self.didStartDragging = true;
                }

            }

            if (self.dragging) {
                elementsWindow.css({
                    left: self.ix + e.pageX - self.iex,
                    top: self.iy + e.pageY - self.iey,
                });
            }
        });

        $(document).off('mouseup.window');
        $(document).on('mouseup.window', function(e) {
            self.shouldStartDragging = false;
            self.didStartDragging = false;
            self.dragging = false;
        });
    }

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
