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

    var elementsWindow = undefined, elementSettingsWindow = undefined, elementsCatalog = new Array();

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

    $.squaresRegisterElement = function(options) {
        var e = new Element(options);
        elementsCatalog.push(e);
    };

    $(document).ready(function() {

        // On document load, loop over all elements with the "squares" class
        // and initialize a Squares editor on them.
        $('.squares').each(function() {
            new Squares(this);
        });
    });


    // Register built-in elements using the public API
    $.squaresRegisterElement({
        name: "Text",
        iconClass: "fa fa-font",
        content: function() {
            return "<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>";
        }
    });
    $.squaresRegisterElement({
        name: "Image",
        iconClass: "fa fa-picture-o",
        content: function() {
            return '<img src="http://www.online-image-editor.com//styles/2014/images/example_image.png">';
        }
    });
    $.squaresRegisterElement({
        name: "Button",
        iconClass: "fa fa-hand-pointer-o",
        content: function() {
            return '<input type="button" value="Button">';
        }
    });
    $.squaresRegisterElement({
        name: "Video",
        iconClass: "fa fa-video-camera",
        content: function() {
            return '<video autoplay><source src="http://html5demos.com/assets/dizzy.mp4" type="video/mp4"><source src="http://html5demos.com/assets/dizzy.webm" type="video/webm"><source src="http://html5demos.com/assets/dizzy.ogg" type="video/ogg"></video>';
        }
    });
    $.squaresRegisterElement({
        name: "YouTube",
        iconClass: "fa fa-youtube",
        content: function() {
            return '<iframe width="560" height="315" src="https://www.youtube.com/embed/IstWciF_aW0" frameborder="0" allowfullscreen></iframe>';
        }
    });

    // The bulk of the functionality goes here.
    // Squares is the "root" class.
    var squaresDefaultSettings = {
        containers: []
    };

    function Squares(host) {
        // "host" is the direct parent of the embedded editor
        this.host = $(host);
        this.settings = $.extend(true, {}, squaresDefaultSettings);
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

        // Drag element from window to container flags
        this.shouldStartDraggingElementToContainer = false;
        this.didStartDraggingElementToContainer = false;
        this.draggingElementToContainer = false;

        // Drag element from window to container vars
        this.indexOfTargetContainerWhenDraggingElementFromWindow = -1;
        this.indexOfTargetElementWhenDraggingElementFromWindow = -1;
        this.draggedElementFromWindowCatalogIndex = -1;
        this.dummyElementAtMouse = undefined;
        this.dummyElement = undefined;
        this.thumbElWhenDraggingFromWindow = undefined;

        // Commonly used
        this.containersMap = undefined;
        this.elementsMap = undefined;

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
                    var a = self.settings.containers[self.draggedContainerIndex];
                    self.settings.containers.splice(self.draggedContainerIndex, 1);
                    self.settings.containers.splice(self.newIndexOfDraggedContainer, 0, a);
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

        // Drag elements from window to container functionality

        $(document).off('mousedown', '.sq-element-thumb');
        $(document).on('mousedown', '.sq-element-thumb', function(e) {
            self.shouldStartDraggingElementToContainer = true;

            self.iex = e.pageX;
            self.iey = e.pageY;

            self.thumbElWhenDraggingFromWindow = $(this);
        });
        $(document).off('mousemove.elementFromWindow');
        $(document).on('mousemove.elementFromWindow', function(e) {
            if (self.shouldStartDraggingElementToContainer && !self.didStartDraggingElementToContainer) {
                if (Math.abs(e.pageX - self.iex) > 5 || Math.abs(e.pageY - self.iey) > 5) {
                    self.didStartDraggingElementToContainer = true;

                    // Get contents and position of the element thumb
                    self.draggedElementFromWindowCatalogIndex = self.thumbElWhenDraggingFromWindow.data('index');

                    var contents = self.thumbElWhenDraggingFromWindow.html();

                    self.ix = self.thumbElWhenDraggingFromWindow.offset().left;
                    self.iy = self.thumbElWhenDraggingFromWindow.offset().top;

                    // Create a copy of the thumb and place it at mouse location
                    $('body').prepend('<div id="sq-dummy-element-at-mouse" class="sq-element-thumb">' + contents + '</div>');
                    self.dummyElementAtMouse = $('#sq-dummy-element-at-mouse');
                    self.dummyElementAtMouse.css({
                        left: self.ix,
                        top: self.iy,
                        margin: 0
                    });

                    // Create a map of containers
                    self.containersMap = new Array();
                    for (var i=0; i<self.settings.containers.length; i++) {
                        var containerEl = self.host.find('.sq-container[data-index='+ i +']')
                        var o = {
                            x: containerEl.offset().left,
                            y: containerEl.offset().top,
                            elements: []
                        }

                        // Create a map of elements for each container
                        for (var j=0; j<self.settings.containers[i].settings.elements.length; j++) {
                            var elementEl = containerEl.find('.sq-element[data-index='+ j +']');
                            o.elements.push({ x: elementEl.offset().left, y: elementEl.offset().top })
                        }

                        // Add a virtual element at the end of the container
                        if (o.elements.length > 0) {
                            var lastElHeight = containerEl.find('.sq-element[data-index='+ (o.elements.length-1) +']').height();
                            o.elements.push({ x: o.elements[o.elements.length-1].x, y: o.elements[o.elements.length-1].y + lastElHeight });
                        }

                        self.containersMap.push(o);
                    }
                }
            }

            if (self.didStartDraggingElementToContainer) {
                // Update dummy element at mouse position
                self.dummyElementAtMouse.css({
                    left: self.ix + e.pageX - self.iex,
                    top: self.iy + e.pageY - self.iey
                });

                // Is the mouse inside the editor's host
                if (e.pageX < self.host.offset().left || e.pageX > self.host.offset().left + self.host.outerWidth() ||
                e.pageY < self.host.offset().top || e.pageY > self.host.offset().top + self.host.outerHeight()) {
                    $('#sq-dummy-element').remove();
                    self.indexOfTargetContainerWhenDraggingElementFromWindow = -1;
                    self.indexOfTargetElementWhenDraggingElementFromWindow = -1;
                    return;
                }

                // In which container to insert the element
                var containerIndex = -1;
                var elementIndex = 0;
                var closestElementDistance = 999999;

                // Find the container that the mouse is in
                for (var i=0; i<self.settings.containers.length; i++) {
                    var c = self.host.find('.sq-container[data-index='+ i +']');
                    if (e.pageX > c.offset().left && e.pageX < c.offset().left + c.outerWidth() &&
                    e.pageY > c.offset().top && e.pageY < c.offset().top + c.outerHeight()) {

                        containerIndex = i;
                    }
                }

                // Find the closest element in that container
                if (containerIndex != -1 && self.containersMap[containerIndex].elements) {
                    for (var j=0; j<self.containersMap[containerIndex].elements.length; j++) {
                        var d = Math.abs(e.pageX - self.containersMap[containerIndex].elements[j].x) + Math.abs(e.pageY - self.containersMap[containerIndex].elements[j].y);
                        if (d < closestElementDistance) {
                            closestElementDistance = d;
                            elementIndex = j;
                        }
                    }
                }

                if (containerIndex == -1) return;

                // Create a dummy
                if (containerIndex != self.indexOfTargetContainerWhenDraggingElementFromWindow || elementIndex != self.indexOfTargetElementWhenDraggingElementFromWindow) {
                    self.indexOfTargetContainerWhenDraggingElementFromWindow = containerIndex;
                    self.indexOfTargetElementWhenDraggingElementFromWindow = elementIndex;
                    $('#sq-dummy-element').remove();

                    if (self.settings.containers[self.indexOfTargetContainerWhenDraggingElementFromWindow].settings.elements.length > 0) {
                        if (elementIndex >= self.settings.containers[self.indexOfTargetContainerWhenDraggingElementFromWindow].settings.elements.length) {
                            self.host.find('.sq-container[data-index='+ containerIndex +']').append('<div id="sq-dummy-element"></div>');
                        } else {
                            self.host.find('.sq-container[data-index='+ containerIndex +']').find('.sq-element[data-index='+ elementIndex +']').before('<div id="sq-dummy-element"></div>');
                        }
                    } else {
                        self.host.find('.sq-container[data-index='+ containerIndex +']').append('<div id="sq-dummy-element"></div>');
                    }
                }
            }
        });
        $(document).off('mouseup.elementFromWindow');
        $(document).on('mouseup.elementFromWindow', function() {
            if (self.didStartDraggingElementToContainer) {
                // Remove element clone (at mouse position)
                self.dummyElementAtMouse.remove();

                // Add element to container at index
                self.settings.containers[self.indexOfTargetContainerWhenDraggingElementFromWindow].insertElement(self.draggedElementFromWindowCatalogIndex, self.indexOfTargetElementWhenDraggingElementFromWindow);

                // Redraw
                self.redraw();
            }

            self.shouldStartDraggingElementToContainer = false;
            self.didStartDraggingElementToContainer = false;
            self.draggingElementToContainer = false;
            self.indexOfTargetContainerWhenDraggingElementFromWindow = -1;
            self.indexOfTargetElementWhenDraggingElementFromWindow = -1;
        });

        // [end] Drag elements from window to container functionality
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
        var addElementsButtonHTML = '<div class="sq-add-elements"><i class="fa fa-cubes"></i></div>';

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

            for (var j=0; j<this.settings.containers[i].settings.elements.length; j++) {
                var e = this.settings.containers[i].settings.elements[j];
                containersHTML += '<div class="sq-element" data-index="' + j + '">';
                containersHTML += e.settings.content();
                containersHTML += '</div>';
            }

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
        elements: []
    };

    function Container() {
        this.settings = $.extend(true, {}, containerDefaultSettings);
    }
    Container.prototype.insertElement = function(elementCatalogIndex, index) {
        var e = $.extend(true, {}, elementsCatalog[elementCatalogIndex]);
        this.settings.elements.splice(index, 0, e);
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
        name: 'Untitled Element',
        iconClass: 'fa fa-cube',
        content: function() {
            return 'No content to display.'
        }
    };

    function Element(settings) {
        this.settings = $.extend(settings, true, elementDefaultSettings);
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

            for (var i=0; i<elementsCatalog.length; i++) {
                elementsWindowHTML += '         <div class="sq-element-thumb" data-index="' + i + '"><i class="' + elementsCatalog[i].settings.iconClass + '"></i></div>';
            }

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



})(jQuery, window, document);
