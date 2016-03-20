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

/*

[tmp]

Element Settings
=========================================

Common settings for all elements:
---------------------------------

- General:
    - ID
    - Class
    - CSS
- Layout
    - Box model widget - margin, padding
    - col span
- Text
    - font-family
    - font-size
    - font-weight
    - font-style
    - line-height
    - color
    - text-align
    - text-decoration
    - text-transform
    - text-shadow
- Style
    - background-color
    - background-color opacity
    - opacity
    - box-shadow
    - border width
    - border style
    - border color
    - border opacity
    - border radius


Custom defined settings per element:
---------------------------------

- Image
    - URL
    - Image is a link (checkbox)
    - Link to
- Video
    - WEBM url
    - OGG url
    - MP4 url
    - Video is a link (checkbox)
    - Link to
- YouTube Video
    - Embed code
- Button
    - Link to
    - Text
- Heading
    - Heading tag index
    - Text
- Paragraph
    - Text (large)
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
        // If the host already has an editor attached, remove the editor from the editors array
        if (host.data('squares')) {
            for (var i=0; i<editors.length; i++) {
                if (editors[i].id == host.data('squares').id) {
                    // editors.splice(i, 1);
                }
            }
        }

        // Init the new editor
        var squaresInstance = new Squares(host, settings);
        editors.push(squaresInstance);
    };

    $.squaresGetCurrentSettings = function(host) {

    };

    $.squaresGenerateHTML = function(host) {

    };

    $.squaresRegisterElement = function(options) {
        elementsCatalog.push(options);
    };

    // Register built-in elements using the public API
    $.squaresRegisterElement({
        name: "Paragraph",
        iconClass: "fa fa-font",
        content: function() {
            return "<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>";
        }
    });
    $.squaresRegisterElement({
        name: "Heading",
        iconClass: "fa fa-header",
        extraSettings: [
            {
                groupName: 'Heading',
                options: [
                    {
                        name: 'heading',
                        type: 'select',
                        options: ['h1', 'h2', 'h3'],
                        default: 'h3'
                    }
                ]
            }
        ],
        content: function() {
            console.log(this.extraSettings);
            return '<h1>Lorem Ipsum</h1>';
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

    $(document).ready(function() {
        // On document load, loop over all elements with the "squares" class
        // and initialize a Squares editor on them.
        $('.squares').each(function() {
            // Register elements
            for (var i=0; i<elementsCatalog.length; i++) {
                if (!elementsCatalog[i].settings) {
                    elementsCatalog[i] = new Element(elementsCatalog[i]);
                }
            }

            var s = '{"containers":[{"settings":{"elements":[{"settings":{"name":"Button","iconClass":"fa fa-hand-pointer-o"}}]}},{"settings":{"elements":[{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Image","iconClass":"fa fa-picture-o"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Button","iconClass":"fa fa-hand-pointer-o"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}}]}},{"settings":{"elements":[{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}}]}}]}';
            // var squaresInstance = new Squares(this, JSON.parse(s));
            var squaresInstance = new Squares(this);

            editors.push(squaresInstance);

            $(this).data('squares', squaresInstance);
        });

        // Create the windows
        addWindows();
        addWindowEvents();

        // Events for dragging elements from the element window to a container.
        // These events needs to be editor-independant
        addDragElementsFromWindowEvents();

        // Test initWithSettings
        var s = '{"containers":[{"settings":{"elements":[{"settings":{"name":"Button","iconClass":"fa fa-hand-pointer-o"}}]}},{"settings":{"elements":[{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Image","iconClass":"fa fa-picture-o"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Button","iconClass":"fa fa-hand-pointer-o"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}}]}},{"settings":{"elements":[{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}},{"settings":{"name":"Paragraph","iconClass":"fa fa-font"}}]}}]}';
        $.squaresInitWithSettings($('.squares').first(), JSON.parse(s))
    });

    function addWindows() {
        // Elements Window
        var elementsWindowContent = '';
        elementsWindowContent += '<div class="sq-element-thumb-container">';
        for (var i=0; i<elementsCatalog.length; i++) {
            elementsWindowContent += '<div class="sq-element-thumb" data-index="' + i + '"><i class="' + elementsCatalog[i].settings.iconClass + '"></i></div>';
        }
        elementsWindowContent += '<div class="clear"></div>';
        elementsWindowContent += '</div>';

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

            var editor = $(this).closest('.sq-root-container').data.editor;
            var containerIndex = $(this).closest('.sq-container').data('index');
            var elementIndex = $(this).data('index');
            var el = editor.settings.containers[containerIndex].settings.elements[elementIndex];

            elementSettingsWindow.show(x, y);
            elementSettingsWindow.setContent(el.getSettingsForm());

            $('.sq-window-tab-content').hide();
            $('.sq-window-tab-content[data-tab-index="0"]').show();
        });
        $(document).on('click', '.sq-window-tab-button', function() {
            var index = $(this).data('tab-index');
            $('.sq-window-tab-content').hide();
            $('.sq-window-tab-content[data-tab-index="'+ index +'"]').show();
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

                            // if the container has no elements, add one dummy element
                            // and move on to next container
                            if (editor.settings.containers[i].settings.elements.length == 0) {
                                c.append('<div id="sq-dummy-element"></div>');
                                var x = $('#sq-dummy-element').offset().left + $('#sq-dummy-element').outerWidth()/2;
                                var y = $('#sq-dummy-element').offset().top + $('#sq-dummy-element').outerHeight()/2;
                                elementDragMap.push({ x: x, y: y, elementIndex: 0, containerIndex: i, editorIndex: k });
                                $('#sq-dummy-element').remove();
                            }

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

    // The bulk of the functionality goes here.
    // Squares is the "root" class.
    var squaresDefaultSettings = {
        containers: []
    };

    function Squares(host, settings) {
        var that = this;

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

        // Reorder elements
        this.shouldStartDraggingElement = false;
        this.didStartDraggingElement = false;
        this.draggingElement = false;
        this.draggedElementIndex = -1;
        this.draggedElementContainerIndex = -1;
        this.elementDragMap = undefined;
        this.dummyElement = undefined;
        this.newIndexOfDraggedElement = -1;

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
        this.host.html('');
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

        // Reorder containers and elements functionality

        // Containers
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

        // Elements
        $(document).off('mousedown', '#sq-editor-'+ self.id +' .sq-element');
        $(document).on('mousedown', '#sq-editor-'+ self.id +' .sq-element', function(e) {
            // If there is just one container with one element, then don't do anything
            if (self.settings.containers.length == 1 && self.settings.containers[0].settings.elements.length == 1) return;

            self.iex = e.pageX;
            self.iey = e.pageY;
            self.shouldStartDraggingElement = true;
            self.draggedElement = $(this);
            self.draggedElementIndex = $(this).data('index');
            self.draggedElementContainerIndex = $(this).closest('.sq-container').data('index');
        });

        $(document).off('mousemove.'+ self.id);
        $(document).on('mousemove.'+ self.id, function(e) {
            // Drag container
            if (self.shouldStartDraggingContainer && !self.didStartDraggingContainer) {
                self.startDraggingContainer(e);
            }

            if (self.draggingContainer) {
                self.dragContainer(e);
            }

            // Drag element
            if (self.shouldStartDraggingElement && !self.didStartDraggingElement) {
                self.startDraggingElement(e);
            }

            if (self.draggingElement) {
                self.dragElement(e);
            }
        });
        $(document).off('mouseup.'+ self.id);
        $(document).on('mouseup.'+ self.id, function(e) {
            if (self.draggingContainer) {
                self.endDraggingContainer(e);
            }
            if (self.draggingElement) {
                self.endDraggingElement(e);
            }

            // Clean up
            self.shouldStartDraggingContainer = false;
            self.didStartDraggingContainer = false;
            self.draggingContainer = false;

            self.draggedContainerIndex = 0;
            self.draggedContainer = undefined;
            self.dummyContainer = undefined;

            self.shouldStartDraggingElement = false;
            self.didStartDraggingElement = false;
            self.draggingElement = false;
            self.draggedElementIndex = -1;
            self.draggedElementContainerIndex = -1;
        });

        // [end] Reorder containers functionality
    };
    Squares.prototype.startDraggingContainer = function(e) {
        if (Math.abs(e.pageX - this.iex) > 5 || Math.abs(e.pageY - this.iey) > 5) {
            this.draggingContainer = true;
            this.didStartDraggingContainer = true;

            // Create a virtual map of the current containers, where
            // every possible position of the dragged container is
            // precalculated
            this.containerReorderMap = new Array();
            var draggedContainerY = this.draggedContainer.outerHeight()/2;

            for (var i=0; i<this.settings.containers.length; i++) {
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
                    if (j >= this.draggedContainerIndex) {
                        index++;
                    }

                    var c = this.host.find('.sq-container[data-index='+ index +']');
                    y += c.outerHeight();
                }

                this.containerReorderMap.push(y);
            }

            // Position the container absolutely
            this.ix = this.draggedContainer.position().left;
            this.iy = this.draggedContainer.position().top;

            this.draggedContainer.css({
                position: 'absolute',
                left: this.ix,
                top: this.iy,
                width: this.draggedContainer.width()
            });

            this.draggedContainer.addClass('sq-dragging');

            // Insert a dummy container
            this.draggedContainer.after('<div id="sq-dummy-container"></div>');
            this.dummyContainer = $('#sq-dummy-container');
            this.dummyContainer.css({
                width: this.draggedContainer.outerWidth(),
                height: this.draggedContainer.outerHeight()
            });
        }
    }
    Squares.prototype.dragContainer = function(e) {
        this.draggedContainer.css({
            left: this.ix + e.pageX - this.iex,
            top: this.iy + e.pageY - this.iey
        });

        var y = this.draggedContainer.position().top + this.draggedContainer.outerHeight()/2;
        var closestDeltaY = 999999;
        var closestIndex = undefined;

        for (var i=0; i<this.containerReorderMap.length; i++) {
            if (Math.abs(y - this.containerReorderMap[i]) < closestDeltaY) {
                closestDeltaY = Math.abs(y - this.containerReorderMap[i]);
                closestIndex = i;
            }
        }

        // If the closest index changed, move the dummy container to the
        // new position.
        if (closestIndex != this.newIndexOfDraggedContainer) {
            this.newIndexOfDraggedContainer = closestIndex;

            this.dummyContainer.remove();

            if (this.newIndexOfDraggedContainer < this.draggedContainerIndex) {
                this.host.find('.sq-container[data-index='+ this.newIndexOfDraggedContainer +']').before('<div id="sq-dummy-container"></div>');
            } else {
                this.host.find('.sq-container[data-index='+ this.newIndexOfDraggedContainer +']').after('<div id="sq-dummy-container"></div>');
            }

            this.dummyContainer = $('#sq-dummy-container');
            this.dummyContainer.css({
                width: this.draggedContainer.outerWidth(),
                height: this.draggedContainer.outerHeight()
            });
        }
    }
    Squares.prototype.endDraggingContainer = function(e) {
        // Switch places of containers
        if (this.draggedContainerIndex != this.newIndexOfDraggedContainer) {
            var a = this.settings.containers[this.draggedContainerIndex];
            this.settings.containers.splice(this.draggedContainerIndex, 1);
            this.settings.containers.splice(this.newIndexOfDraggedContainer, 0, a);
        }
        this.redraw();
    }
    Squares.prototype.startDraggingElement = function(e) {
        if (Math.abs(e.pageX - this.iex) > 5 || Math.abs(e.pageY - this.iey) > 5) {
            this.draggingElement = true;
            this.didStartDraggingElement = true;

            // Create a virtual map of all possible positions of the element
            // in each container
            this.elementDragMap = new Array();
            var dummyElementHTML = '<div id="sq-dummy-element-tmp" style="width: '+ this.draggedElement.outerWidth() +'px; height: '+ this.draggedElement.outerHeight() +'px; display: inline-block;"></div>';

            this.draggedElement.hide();
            for (var i=0; i<this.settings.containers.length; i++) {
                var c = this.settings.containers[i];

                // If the container doesn't have any elements, insert just one
                // dummy element and move on to next container
                if (c.settings.elements.length == 0) {
                    this.host.find('.sq-container[data-index='+i+']').append(dummyElementHTML);
                    var el = $('#sq-dummy-element-tmp');
                    this.elementDragMap.push({ x: el.offset().left + el.width()/2, y: el.offset().top + el.height()/2, containerIndex: i, elementIndex: 0 });
                    $('#sq-dummy-element-tmp').remove();
                }

                for (var j=0; j<c.settings.elements.length; j++) {
                    this.host.find('.sq-container[data-index='+i+']').find('.sq-element[data-index='+j+']').before(dummyElementHTML);
                    var el = $('#sq-dummy-element-tmp');
                    this.elementDragMap.push({ x: el.offset().left + el.width()/2, y: el.offset().top + el.height()/2, containerIndex: i, elementIndex: j });
                    $('#sq-dummy-element-tmp').remove();

                    if (j == c.settings.elements.length - 1) {
                        this.host.find('.sq-container[data-index='+i+']').find('.sq-element[data-index='+j+']').after(dummyElementHTML);
                        var el = $('#sq-dummy-element-tmp');
                        this.elementDragMap.push({ x: el.offset().left + el.width()/2, y: el.offset().top + el.height()/2, containerIndex: i, elementIndex: j + 1 });
                        $('#sq-dummy-element-tmp').remove();
                    }
                }
            }
            this.draggedElement.show();

            // Insert a dummy element
            this.draggedElement.after('<div id="sq-dummy-element"></div>');
            this.dummyElement = $('#sq-dummy-element');
            this.dummyElement.css({
                width: this.draggedElement.outerWidth(),
                height: this.draggedElement.outerHeight(),
                margin: 0,
                padding: 0
            });

            // Position the element absolutely
            this.ix = this.draggedElement.offset().left;
            this.iy = this.draggedElement.offset().top;

            var draggedElementWidth = this.draggedElement.width();
            var draggedElementHeight = this.draggedElement.height();
            var draggedElementHTML = this.draggedElement.clone().attr('id', 'sq-dragged-element').wrap('<div>').parent().html();
            this.draggedElement.hide();
            $('body').prepend(draggedElementHTML);
            this.draggedElement = $('#sq-dragged-element');

            this.draggedElement.css({
                position: 'absolute',
                left: this.ix,
                top: this.iy,
                width: draggedElementWidth,
                height: draggedElementHeight
            });
            this.draggedElement.addClass('sq-dragging');
        }
    }
    Squares.prototype.dragElement = function(e) {
        this.draggedElement.css({
            left: this.ix + e.pageX - this.iex,
            top: this.iy + e.pageY - this.iey
        });

        // Find the closest virtual position to the mouse position
        var closestIndex = 0;
        var closestDistance = 999999;

        for (var i=0; i<this.elementDragMap.length; i++) {
            var d = Math.abs(e.pageX - this.elementDragMap[i].x) + Math.abs(e.pageY - this.elementDragMap[i].y);
            if (d < closestDistance) {
                closestDistance = d;
                closestIndex = i;
            }
        }

        if (closestIndex != this.newIndexOfDraggedElement) {
            this.newIndexOfDraggedElement = closestIndex;

            // Remove the current dummy element
            $('#sq-dummy-element').remove();

            // Insert a new dummy element at the container/element index
            var containerIndex = this.elementDragMap[this.newIndexOfDraggedElement].containerIndex;
            var elementIndex = this.elementDragMap[this.newIndexOfDraggedElement].elementIndex;
            var c = this.host.find('.sq-container[data-index='+ containerIndex +']');
            // If the index of the dummy element is bigger than the number
            // of elements in that container, insert the dummy at the end
            if (elementIndex == this.settings.containers[containerIndex].settings.elements.length) {
                c.append('<div id="sq-dummy-element"></div>');
            } else {
                var el = c.find('.sq-element[data-index='+ elementIndex +']');
                el.before('<div id="sq-dummy-element"></div>');
            }

            this.dummyElement = $('#sq-dummy-element');
            this.dummyElement.css({
                width: this.draggedElement.outerWidth(),
                height: this.draggedElement.outerHeight(),
                margin: 0,
                padding: 0
            });
        }
    }
    Squares.prototype.endDraggingElement = function(e) {
        this.draggedElement.remove();

        // Move the element to the new index
        var newContainerIndex = this.elementDragMap[this.newIndexOfDraggedElement].containerIndex;
        var newElementIndex = this.elementDragMap[this.newIndexOfDraggedElement].elementIndex;

        var oldElementIndex = this.draggedElementIndex;
        var oldContainerIndex = this.draggedElementContainerIndex;

        var el = this.settings.containers[oldContainerIndex].settings.elements[oldElementIndex];
        this.settings.containers[oldContainerIndex].settings.elements.splice(oldElementIndex, 1);
        this.settings.containers[newContainerIndex].settings.elements.splice(newElementIndex, 0, el);

        this.redraw();
    }
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

    var elementDefaultSettings = {
        name: 'Untitled Element',
        iconClass: 'fa fa-cube',
        settings: 'default settings',
        content: function() {
            return 'No content to display.'
        }
    };

    function Element(settings) {
        this.settings = $.extend(true, {}, elementDefaultSettings, settings);
        this.settingsForm = undefined;

        // Associative array generated from the "settings"
        // for easier access to the element's settings
        this.options = undefined;

        this.init();
    }
    Element.prototype.init = function() {

    }
    Element.prototype.getSettingsForm = function() {
        // Generates a settings form for this element
        if (!this.settingsForm) {
            var settingsFormOptions = [
                {
                    groupName: 'General',
                    options: [
                        {
                            name: 'ID',
                            type: 'text',
                            default: ''
                        },
                        {
                            name: 'Classes',
                            type: 'text',
                            default: ''
                        },
                        {
                            name: 'CSS',
                            type: 'text',
                            default: ''
                        },
                    ]
                },
                {
                    groupName: 'Layout',
                    options: [
                        {
                            name: 'Column Span',
                            type: 'select',
                            options: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
                            default: 12
                        },
                        {
                            name: 'Box Model',
                            type: 'box model'
                        }
                    ]
                },
                {
                    groupName: 'Text',
                    options: [
                        {
                            name: 'Font Family',
                            type: 'text',
                            default: 'sans-serif'
                        },
                        {
                            name: 'Font Size',
                            type: 'text',
                            format: 'int',
                            default: '16'
                        },
                        {
                            name: 'Font Weight',
                            type: 'text',
                            default: 'normal'
                        },
                        {
                            name: 'Font Style',
                            type: 'select',
                            options: [ 'normal', 'italic', 'oblique', 'initial', 'inherit' ],
                            default: 'normal'
                        },
                        {
                            name: 'Line Height',
                            type: 'text',
                            format: 'int',
                            default: 'sans-serif'
                        },
                        {
                            name: 'Text Color',
                            type: 'color',
                            default: '#000000'
                        },
                        {
                            name: 'Text Align',
                            type: 'text',
                            default: 'sans-serif'
                        },
                        {
                            name: 'Text Decoration',
                            type: 'text',
                            default: 'sans-serif'
                        },
                        {
                            name: 'Text Transform',
                            type: 'select',
                            options: [ 'none', 'capitalize', 'uppercase', 'lowercase', 'initial', 'inherit' ],
                            default: 'none'
                        },
                        {
                            name: 'Text Shadow',
                            type: 'text',
                            default: ''
                        },
                    ]
                },
                {
                    groupName: 'Style',
                    options: [
                        {
                            name: 'Background Color',
                            type: 'color',
                            default: '#ffffff'
                        },
                        {
                            name: 'Background Opacity',
                            type: 'float',
                            default: '0'
                        },
                        {
                            name: 'Opacity',
                            type: 'float',
                            default: '1'
                        },
                        {
                            name: 'Box Shadow',
                            type: 'text',
                            default: 'none'
                        },
                        {
                            name: 'Border Width',
                            type: 'int',
                            default: '0'
                        },
                        {
                            name: 'Border Style',
                            type: 'select',
                            options: [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ],
                            default: 'none'
                        },
                        {
                            name: 'Border Color',
                            type: 'color',
                            default: '#000000'
                        },
                        {
                            name: 'Border Opacity',
                            type: 'float',
                            default: '1'
                        },
                        {
                            name: 'Border Radius',
                            type: 'int',
                            default: '0'
                        },
                    ]
                }
            ];

            if (this.settings.extraSettings) {
                for (var i=0; i<this.settings.extraSettings.length; i++) {
                    settingsFormOptions.push(this.settings.extraSettings[i]);
                }
            }

            this.settingsForm = generateForm(settingsFormOptions);
        }

        return this.settingsForm;
    }
    Element.prototype.loadOptions = function() {
        // Loads its options in the settings window
        // Attempts to find the correct input field using the ID
        // generated from the "generateFormElementIDFromName" function.
    }
    Element.prototype.updateOptions = function() {
        // Updates its options based on the input fields loaded
        // in the current Settings window.
    }


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
        this.root.find('.sq-window-container').html(html);
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

    // Generates a form with tabs

    function generateForm(o) {
        var html = '';

        // Create tabs
        html += '<div class="sq-window-tab-buttons-group">';
        for (var i=0; i<o.length; i++) {
            html += '<div class="sq-window-tab-button" data-tab-index="'+ i +'">'+ o[i].groupName +'</div>';
        }
        html += '</div>';

        // Create content for each tab
        html += '<div class="sq-window-tab-content-wrap">';

        for (var i=0; i<o.length; i++) {
            var group = o[i];
            html += '<div class="sq-window-tab-content" data-tab-index="'+ i +'">';

            for (var j=0; j<group.options.length; j++) {
                var option = group.options[j];
                var id = generateFormElementIDFromName(option.name);

                html += '<label for="'+ id +'">'+ option.name +'</label>';
                if (option.type == 'text' || option.type == 'int' || option.type == 'float') {
                    html += '<input type="text" placeholder="'+ option.name +'" id="'+ id +'">';
                }
                if (option.type == 'color') {
                    html += '<input type="color" placeholder="'+ option.name +'" id="'+ id +'">';
                }

                if (option.type == 'select') {
                    html += '<select id="'+ id +'">';

                    for (var k=0; k<option.options.length; k++) {
                        html += '<option value="'+ option.options[k] +'">'+ option.options[k] +'</option>';
                    }

                    html += '</select>';
                }
            }

            html += '</div>';
        }
        html += '</div>';

        return html;
    }
    function generateFormElementIDFromName(name) {
        return name.toLowerCase().replace(' ', '-');
    }

})(jQuery, window, document);
