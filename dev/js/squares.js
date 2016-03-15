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

    var elementsWindow = undefined, elementSettingsWindow = undefined, elementsCatalog = new Array(), editors = new Array();

    // =========================================================================
    // API
    // The following functions allow to initialize the editor with a previously
    // saved settings/content, get the current settings/content and generate
    // HTML content for the end user.

    // The "host" parameter is the root element of the editor. It contains
    // (or will contain a reference to the JS class instance).
    // =========================================================================

    $.squaresInitWithSettings = function(host, settings) {
        new Squares(host, settings);
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
            // new Squares(this);
            var s = '{"containers":[{"settings":{"elements":[{"settings":{"name":"Button","iconClass":"fa fa-hand-pointer-o"}}]}},{"settings":{"elements":[{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Image","iconClass":"fa fa-picture-o"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Button","iconClass":"fa fa-hand-pointer-o"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}}]}},{"settings":{"elements":[{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}}]}}]}';
            var squaresInstance = new Squares(this, JSON.parse(s));

            editors.push(squaresInstance);

            $(this).data('squares', squaresInstance);
        });

        // Create the windows
        addWindows();
        addWindowEvents();

        // Events for dragging elements from the element window to a container.
        // These events needs to be editor-independant
        addDragElementsFromWindowEvents();
    });

    function addWindows() {
        // Elements Window
        var elementsWindowContent = '';
        for (var i=0; i<elementsCatalog.length; i++) {
            elementsWindowContent += '<div class="sq-element-thumb" data-index="' + i + '"><i class="' + elementsCatalog[i].settings.iconClass + '"></i></div>';
        }
        elementsWindowContent += '<div class="clear"></div>';

        elementsWindow = new EditorWindow();
        elementsWindow.setTitle('Elements');
        elementsWindow.setContent(elementsWindowContent);
        elementsWindow.root.css({ width: 268 });

        // Element Settings Window
        var elementSettingsWindowContent = 'settings';

        elementSettingsWindow = new EditorWindow();
        elementSettingsWindow.setTitle('Element Settings');
        elementSettingsWindow.setContent(elementSettingsWindowContent);
    }
    function addWindowEvents() {
        $(document).on('click', '.sq-add-elements', function() {
            var x = $(this).closest('.sq-root-container').offset().left + $(this).closest('.sq-root-container').width() + 40;
            var y = $(this).closest('.sq-root-container').offset().top;
            elementsWindow.show(x, y);
        });
        $(document).on('click', '.sq-element', function() {
            var x = $(this).offset().left + $(this).closest('.sq-root-container').width() + 40;
            var y = $(this).offset().top;
            elementSettingsWindow.show(x, y);
        });
    }
    function addDragElementsFromWindowEvents() {
        // Drag elements from window to container functionality

        var shouldStartDraggingElementToContainer = false,
            didStartDraggingElementToContainer = false,
            draggingElementToContainer = false,
            virtualIndexOfDraggedElement = -1,
            draggedElementFromWindowCatalogIndex = -1,
            thumbElWhenDraggingFromWindow = undefined,
            targetEditor = undefined,
            dummyElementAtMouse = undefined,
            elementDragMap = undefined;
        var iex = 0, iey = 0, ix = 0, iy = 0;

        $(document).off('mousedown', '.sq-element-thumb');
        $(document).on('mousedown', '.sq-element-thumb', function(e) {
            shouldStartDraggingElementToContainer = true;

            iex = e.pageX;
            iey = e.pageY;

            thumbElWhenDraggingFromWindow = $(this);
        });
        $(document).off('mousemove.elementFromWindow');
        $(document).on('mousemove.elementFromWindow', function(e) {
            if (shouldStartDraggingElementToContainer && !didStartDraggingElementToContainer) {
                if (Math.abs(e.pageX - iex) > 5 || Math.abs(e.pageY - iey) > 5) {
                    didStartDraggingElementToContainer = true;

                    // Get contents and position of the element thumb
                    draggedElementFromWindowCatalogIndex = thumbElWhenDraggingFromWindow.data('index');

                    var contents = thumbElWhenDraggingFromWindow.html();

                    ix = thumbElWhenDraggingFromWindow.offset().left;
                    iy = thumbElWhenDraggingFromWindow.offset().top;

                    // Create a copy of the thumb and place it at mouse location
                    $('body').prepend('<div id="sq-dummy-element-at-mouse" class="sq-element-thumb">' + contents + '</div>');
                    dummyElementAtMouse = $('#sq-dummy-element-at-mouse');
                    dummyElementAtMouse.css({
                        left: ix,
                        top: iy,
                        margin: 0
                    });

                    // Create a virtual map of all possible positions of the
                    // dragged element in all editors
                    elementDragMap = new Array();

                    for (var k=0; k<editors.length; k++) {
                        var editor = editors[k];

                        for (var i=0; i<editor.settings.containers.length; i++) {
                            var coords = { x: 0, y: 0 };
                            var c = editor.host.find('.sq-container[data-index='+ i +']');

                            for (var j=0; j<editor.settings.containers[i].settings.elements.length; j++) {
                                var el = c.find('.sq-element[data-index='+ j +']');

                                el.before('<div id="sq-dummy-element"></div>');
                                var x = $('#sq-dummy-element').offset().left + $('#sq-dummy-element').outerWidth()/2;
                                var y = $('#sq-dummy-element').offset().top + $('#sq-dummy-element').outerHeight()/2;
                                elementDragMap.push({ x: x, y: y, elementIndex: j, containerIndex: i, editorIndex: k });
                                $('#sq-dummy-element').remove();

                                // When we reach the end of the elements array, add a dummy element after the last element
                                if (j == editor.settings.containers[i].settings.elements.length - 1) {
                                    el.after('<div id="sq-dummy-element"></div>');
                                    var x = $('#sq-dummy-element').offset().left + $('#sq-dummy-element').outerWidth()/2;
                                    var y = $('#sq-dummy-element').offset().top + $('#sq-dummy-element').outerHeight()/2;
                                    elementDragMap.push({ x: x, y: y, elementIndex: j+1, containerIndex: i, editorIndex: k });
                                    $('#sq-dummy-element').remove();
                                }
                            }
                        }
                    }
                }
            }

            if (didStartDraggingElementToContainer) {
                // Update dummy element at mouse position
                dummyElementAtMouse.css({
                    left: ix + e.pageX - iex,
                    top: iy + e.pageY - iey
                });

                // Find the closest virtual position to the mouse position
                var closestIndex = 0;
                var closestDistance = 999999;

                for (var i=0; i<elementDragMap.length; i++) {
                    var d = Math.abs(e.pageX - elementDragMap[i].x) + Math.abs(e.pageY - elementDragMap[i].y);
                    if (d < closestDistance) {
                        closestDistance = d;
                        closestIndex = i;
                    }
                }

                // If the closest index is different than the current index,
                // remove the dummy element and insert a new one and the new index
                if (closestIndex != virtualIndexOfDraggedElement) {
                    virtualIndexOfDraggedElement = closestIndex;

                    // Remove the current dummy element
                    $('#sq-dummy-element').remove();

                    // Insert a new dummy element at the container/element index
                    var containerIndex = elementDragMap[virtualIndexOfDraggedElement].containerIndex;
                    var elementIndex = elementDragMap[virtualIndexOfDraggedElement].elementIndex;
                    var editorIndex = elementDragMap[virtualIndexOfDraggedElement].editorIndex;
                    var c = editors[editorIndex].host.find('.sq-container[data-index='+ containerIndex +']');

                    // If the index of the dummy element is bigger than the number
                    // of elements in that container, insert the dummy at the end
                    if (elementIndex == editors[editorIndex].settings.containers[containerIndex].settings.elements.length) {
                        c.append('<div id="sq-dummy-element"></div>');
                    } else {
                        var e = c.find('.sq-element[data-index='+ elementIndex +']');
                        e.before('<div id="sq-dummy-element"></div>');
                    }
                }
            }
        });
        $(document).off('mouseup.elementFromWindow');
        $(document).on('mouseup.elementFromWindow', function() {
            if (didStartDraggingElementToContainer) {
                // Remove element clone (at mouse position)
                dummyElementAtMouse.remove();

                var containerIndex = elementDragMap[virtualIndexOfDraggedElement].containerIndex;
                var elementIndex = elementDragMap[virtualIndexOfDraggedElement].elementIndex;
                var editorIndex = elementDragMap[virtualIndexOfDraggedElement].editorIndex;

                editors[editorIndex].addElement(containerIndex, elementIndex, draggedElementFromWindowCatalogIndex);
            }

            shouldStartDraggingElementToContainer = false;
            didStartDraggingElementToContainer = false;
            draggingElementToContainer = false;
            virtualIndexOfDraggedElement = -1;
        });

        // [end] Drag elements from window to container functionality
    }


    // Register built-in elements using the public API
    $.squaresRegisterElement({
        name: "Paragraph",
        iconClass: "fa fa-font",
        content: function() {
            return "<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>";
        }
    });
    $.squaresRegisterElement({
        name: "Heading 1",
        iconClass: "fa fa-header",
        content: function() {
            return "<h1>Lorem Ipsum</h1>";
        }
    });
    $.squaresRegisterElement({
        name: "Heading 2",
        iconClass: "fa fa-header",
        content: function() {
            return "<h2>Lorem Ipsum</h2>";
        }
    });
    $.squaresRegisterElement({
        name: "Heading 3",
        iconClass: "fa fa-header",
        content: function() {
            return "<h3>Lorem Ipsum</h3>";
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

    function Squares(host, settings) {
        // "host" is the direct parent of the embedded editor
        this.host = $(host);
        this.id = Math.floor(Math.random() * 9999) + 1;
        this.settings = $.extend(true, {}, squaresDefaultSettings);

        this.contentRoot = undefined;
        this.root = undefined;
        this.Window = undefined;

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
        this.virtualIndexOfDraggedElement = -1;
        // this.indexOfTargetContainerWhenDraggingElementFromWindow = -1;
        // this.indexOfTargetElementWhenDraggingElementFromWindow = -1;
        this.draggedElementFromWindowCatalogIndex = -1;
        this.dummyElementAtMouse = undefined;
        this.dummyElement = undefined;
        this.thumbElWhenDraggingFromWindow = undefined;

        // Commonly used
        this.elementDragMap = undefined;

        this.loadSettings(settings);
        this.init();
    };
    Squares.prototype.loadSettings = function(settings) {
        // When settings are loaded, we make sure containers and elements
        // have the correct prototype.

        if (settings) {
            this.settings = $.extend(true, settings, squaresDefaultSettings);

            for (var i=0; i<this.settings.containers.length; i++) {
                var c = this.settings.containers[i];
                c.__proto__ = Container.prototype;

                for (var j=0; j<c.settings.elements.length; j++) {
                    var e = c.settings.elements[j];

                    for (var k=0; k<elementsCatalog.length; k++) {
                        if (e.settings.name == elementsCatalog[k].settings.name) {
                            e.__proto__ = Element.prototype;
                            e.settings.content = elementsCatalog[k].settings.content;
                        }
                    }
                }
            }
        }
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

        this.contentRoot.attr('id', 'sq-editor-' + this.id);

        this.addUI();
        this.addEvents();
        this.redraw();
    };
    Squares.prototype.redraw = function () {
        // Draw containers
        var containersHTML = '';

        for (var i=0; i<this.settings.containers.length; i++) {
            containersHTML += '<div class="sq-container" data-index="'+ i +'">';

            containersHTML += '     <div class="sq-container-move"></div>';

            for (var j=0; j<this.settings.containers[i].settings.elements.length; j++) {
                var e = this.settings.containers[i].settings.elements[j];
                containersHTML += ' <div class="sq-element" data-index="' + j + '">';
                containersHTML += '     <div class="sq-element-controls">';
                containersHTML += '         <div class="sq-element-control-drag"></div>';
                containersHTML += '         <div class="sq-element-control-edit"><i class="fa fa-cog"></i></div>';
                containersHTML += '         <div class="sq-element-control-delete"><i class="fa fa-trash-o"></i></div>';
                containersHTML += '     </div>';
                containersHTML +=       e.settings.content();
                containersHTML += ' </div>';
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

        // console.log(JSON.stringify(this.settings));
        // console.log(this.settings);
    };
    Squares.prototype.addEvents = function() {
        var self = this;

        // Button for appending a new container
        this.host.find('.sq-add-container').off('click');
        this.host.find('.sq-add-container').on('click', function() {
            self.appendContainer();
            self.redraw();
        });

        // Reorder containers functionality

        $(document).off('mousedown', '#sq-editor-'+ self.id +' .sq-container-move');
        $(document).on('mousedown', '#sq-editor-'+ self.id +' .sq-container-move', function(e) {
            // If there is just one container, then don't do anything
            if (self.settings.containers.length <= 1) return;

            self.iex = e.pageX;
            self.iey = e.pageY;
            self.shouldStartDraggingContainer = true;
            self.draggedContainerIndex = $(e.target).closest('.sq-container').data('index');
            self.draggedContainer = self.host.find('.sq-container[data-index='+ self.draggedContainerIndex +']');
        });
        $(document).off('mousemove.'+ self.id);
        $(document).on('mousemove.'+ self.id, function(e) {
            if (self.shouldStartDraggingContainer && !self.didStartDraggingContainer) {
                if (Math.abs(e.pageX - self.iex) > 5 || Math.abs(e.pageY - self.iey) > 5) {
                    self.draggingContainer = true;
                    self.didStartDraggingContainer = true;

                    // Create a virtual map of the current containers, where
                    // every possible position of the dragged container is
                    // precalculated
                    self.containerReorderMap = new Array();
                    var draggedContainerY = self.draggedContainer.outerHeight()/2;

                    for (var i=0; i<self.settings.containers.length; i++) {
                        var y = draggedContainerY;

                        // Add the height of all previous containers to calculate
                        // the new virtual Y position of the dragged container
                        // for the current index
                        for (var j=i-1; j>=0; j--) {
                            var index = j;

                            // The height of the dragged container must not be
                            // included in the calculation.
                            // If the current index is the index of the dragged
                            // container, then increase the index
                            if (j >= self.draggedContainerIndex) {
                                index++;
                            }

                            var c = self.host.find('.sq-container[data-index='+ index +']');
                            y += c.outerHeight();
                        }

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
        $(document).off('mouseup.'+ self.id);
        $(document).on('mouseup.'+ self.id, function(e) {
            if (self.draggingContainer) {
                // Switch places of containers
                self.changeContainerIndex(self.draggedContainerIndex, self.newIndexOfDraggedContainer);
            }

            // Clean up
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
    Squares.prototype.changeContainerIndex = function(oldIndex, newIndex) {
        if (oldIndex != newIndex) {
            var a = this.settings.containers[oldIndex];
            this.settings.containers.splice(oldIndex, 1);
            this.settings.containers.splice(newIndex, 0, a);

            this.redraw();
        }
    };
    Squares.prototype.addElement = function(containerIndex, elementIndex, elementCatalogIndex) {
        var self = this;

        // Add element to container at index
        self.settings.containers[containerIndex].insertElement(elementCatalogIndex, elementIndex);

        // Redraw
        self.redraw();
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
    // - paragraph
    // - heading 1
    // - heading 2
    // - heading 3
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

    function EditorWindow() {
        this.root = undefined;
        this.id = Math.floor(Math.random() * 10000) + 1;

        // flags for dragging the window
        this.shouldStartDragging = false;
        this.didStartDragging = false;
        this.dragging = false;
        this.iex = 0; // initial event x
        this.iey = 0; // initial event y
        this.ix = 0; // initial window x
        this.iy = 0; // initial window y

        this.init();
        this.events();
    }
    EditorWindow.prototype.init = function() {
        var WindowHTML = '';

        WindowHTML += ' <div class="sq-window" id="sq-window-'+ this.id +'">';
        WindowHTML += '     <div class="sq-window-header">';
        WindowHTML += '         <div class="sq-window-title"></div>';
        WindowHTML += '         <div class="sq-window-close"><i class="fa fa-times"></i></div>';
        WindowHTML += '     </div>';
        WindowHTML += '     <div class="sq-window-container">';
        WindowHTML += '     </div>';
        WindowHTML += ' </div>';

        if ($('.sq-windows-root').length == 0) {
            $('body').prepend('<div class="sq-windows-root"></div>');
        }

        $('.sq-windows-root').append(WindowHTML);

        this.root = $('#sq-window-' + this.id);
    }
    EditorWindow.prototype.events = function() {
        var self = this;

        // Button for closing the elements window
        self.root.find('.sq-window-close').off('click');
        self.root.find('.sq-window-close').on('click', function(e) {
            self.root.hide();
        });

        // Move the window by dragging its header
        self.root.find('.sq-window-header').off('mousedown');
        self.root.find('.sq-window-header').on('mousedown', function(e) {
            if ($(e.target).hasClass('sq-window-close') || $(e.target).closest('.sq-window-close').length > 0) return;

            self.shouldStartDragging = true;

            self.iex = e.pageX;
            self.iey = e.pageY;

            $('.sq-window-active').removeClass('sq-window-active');
            self.root.addClass('sq-window-active');
        });
        $(document).on('mousemove.' + self.id, function(e) {
            // Start moving the window only if the user drags it by 5 pixels or
            // more, to prevent accidental drag
            if (self.shouldStartDragging && !self.didStartDragging) {
                if (Math.abs(e.pageX - self.iex) > 5 || Math.abs(e.pageY - self.iey) > 5) {
                    self.ix = self.root.offset().left;
                    self.iy = self.root.offset().top;
                    self.dragging = true;
                    self.didStartDragging = true;
                }

            }

            if (self.dragging) {
                self.root.css({
                    left: self.ix + e.pageX - self.iex,
                    top: self.iy + e.pageY - self.iey,
                });
            }
        });

        $(document).on('mouseup.' + self.id, function(e) {
            self.shouldStartDragging = false;
            self.didStartDragging = false;
            self.dragging = false;
        });
    }
    EditorWindow.prototype.setContent = function(html) {
        this.root.find('.sq-window-container').append(html);
    }
    EditorWindow.prototype.setTitle = function(title) {
        this.root.find('.sq-window-title').html(title);
    }
    EditorWindow.prototype.show = function(x, y) {
        this.root.show();

        this.root.css({
            left: x,
            top: y
        });

        $('.sq-window-active').removeClass('sq-window-active');
        this.root.addClass('sq-window-active');
    }


})(jQuery, window, document);
