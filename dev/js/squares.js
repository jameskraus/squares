/*

TO DO:

- new UI
- slider form control
- add additional controls for the current existing elements
- generate HTML

*/

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

[tmp]

Element Controls
=========================================

Common controls for all elements:
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


Custom defined controls per element:
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

    var editorWindow = undefined, registeredElements = new Array(), registeredControls = new Array(), editors = new Array();

    // =========================================================================
    // [API]

    // The following functions allow to initialize the editor with a previously
    // saved settings/content, get the current settings/content and generate
    // HTML content for the end user.


    // Create an editor with previously stored settings in JSON format.
    // The "host" parameter is the root element of the editor. It contains
    // (or will contain a reference to the JS class instance).
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

    // Gets the current state as JS object of an editor, selected by its host
    $.squaresGetCurrentSettings = function(host) {

    };

    // Called at the end to generate the final HTML code to be inserted in the
    // front-end.
    $.squaresGenerateHTML = function(host) {

    };

    /*
    Adds a new element to the catalog.
    Required options for Element registration:
    - name: sematic name for the Element
    - iconClass: complete class name from Font Awesome
    - content(): callback function which returns HTML code to be rendered
    - (optional) extendOptions - array containing additional controls for
    the element. For example:

    */
    $.squaresRegisterElement = function(options) {
        registeredElements.push(options);
    };

    /*
    Registers a control that can be added to the element settings window
    Required options for Control registration:
    - type: int, float, text, color, etc
    - getValue: getter for the value of the control
    - setValue: setter for the value of the control
    - HTML: returns the HTML of the control
    - events: create events associated with this specific control element
    */

    $.squaresRegisterControl = function(options) {
        registeredControls.push(options);
    }

    // [END API]
    // =========================================================================


    $(document).ready(function() {
        // On document load, loop over all elements with the "squares" class
        // and initialize a Squares editor on them.
        $('.squares').each(function() {
            var squaresInstance = new Squares(this);
            editors.push(squaresInstance);
            $(this).data('squares', squaresInstance);
        });

        // Create the editor window
        var editorWindow = new EditorWindow();

        // Test initWithSettings
        var s = '{"containers":[{"id":"sq-container-420971","settings":{"elements":[{"id":"sq-element-8451","settings":{"name":"Heading","iconClass":"fa fa-header"},"options":{"heading":{"heading":"h1"}},"defaults":[],"controls":[]},{"id":"sq-element-983381","settings":{"name":"Paragraph","iconClass":"fa fa-font"},"defaults":[],"controls":[]},{"id":"sq-element-518081","settings":{"name":"Button","iconClass":"fa fa-hand-pointer-o"},"defaults":[],"controls":[]},{"id":"sq-element-754951","settings":{"name":"Heading","iconClass":"fa fa-header"},"defaults":[],"controls":[]}]}},{"id":"sq-container-793821","settings":{"elements":[{"id":"sq-element-557641","settings":{"name":"Image","iconClass":"fa fa-picture-o"},"defaults":[],"controls":[]},{"id":"sq-element-446891","settings":{"name":"Paragraph","iconClass":"fa fa-font"},"defaults":[],"controls":[]},{"id":"sq-element-34541","settings":{"name":"Button","iconClass":"fa fa-hand-pointer-o"},"defaults":[],"controls":[]}]}}]}';
        $.squaresInitWithSettings($('.squares').first(), JSON.parse(s));
        // $.squaresInitWithSettings($('.squares').first());
    });

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
        this.draggedElementWidth = -1;

        this.loadSettings(settings);
        this.init();
    };
    Squares.prototype.loadSettings = function(settings) {
        // When settings are loaded, we make sure containers and elements
        // have the correct prototype.

        if (settings) {
            // Iterate over all containers
            for (var i=0; i<settings.containers.length; i++) {
                var c = settings.containers[i];

                // Add a container and store a reference
                var newContainer = this.appendContainer();

                // Iterate over all elements of the container
                for (var j=0; j<c.settings.elements.length; j++) {
                    var e = c.settings.elements[j];

                    // Get the catalog index of the element with the same name
                    // and insert it in the container
                    for (var k=0; k<registeredElements.length; k++) {
                        if (e.settings.name == registeredElements[k].name) {
                            newContainer.insertElement(k, j, e.options);
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
        // This is the global redraw function.
        // It is called only when a change in hierarchy is made.
        // It is responsible for creating the root element for each
        //      container and element, telling those objects that they have a new
        //      root element, and calling the "render" function on them.

        this.contentRoot.html('');

        for (var i=0; i<this.settings.containers.length; i++) {
            var c = this.settings.containers[i];

            // Append a container
            var html = '<div class="sq-container" data-index="'+ i +'" id="'+ c.id +'"></div>';

            this.contentRoot.append(html);

            // Set the container's "root" object
            var containerRoot = $('#' + c.id);

            // Call the render() function of the container
            c.render();
            c.appendEditorControls();

            for (var j=0; j<c.settings.elements.length; j++) {
                var e = c.settings.elements[j];

                // Append an element to the container
                var html = '<div class="sq-element" data-index="' + j + '" id="'+ e.id +'"></div>';
                containerRoot.append(html);

                // Call the render() function of the element
                e.render();
                e.appendEditorControls();
            }
        }

        // If there are no containers, hide the "elements button"
        if (this.settings.containers.length == 0) {
            this.root.find('.sq-add-elements').hide();
        } else {
            this.root.find('.sq-add-elements').show();
        }
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

            var draggedElementObject = this.settings.containers[this.draggedElementContainerIndex].settings.elements[this.draggedElementIndex];
            this.draggedElementWidth = getWidthOfElementInGrid(draggedElementObject.options.layout.column_span);

            var dummyElementHTML = '<div id="sq-dummy-element-tmp" style="width: '+ this.draggedElementWidth +'; height: '+ this.draggedElement.outerHeight() +'px;"></div>';

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
                width: this.draggedElementWidth,
                height: this.draggedElement.outerHeight(),
                margin: this.draggedElement.css('margin'),
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
                width: this.draggedElementWidth,
                height: this.draggedElement.outerHeight(),
                margin: this.draggedElement.css('margin'),
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

        return c;
    };
    Squares.prototype.addElement = function(containerIndex, elementIndex, elementCatalogIndex, elementControlOptions) {
        var self = this;

        // Add element to container at index
        self.settings.containers[containerIndex].insertElement(elementCatalogIndex, elementIndex, elementControlOptions);

        // Redraw
        self.redraw();
    };

    Squares.prototype.generateJSON = function() {
        var settings = $.extend(true, {}, this.settings);

        // Compress element settings
        for (var i=0; i<settings.containers.length; i++) {
            var c = $.extend(true, {}, settings.containers[i]);

            for (var j=0; j<c.settings.elements.length; j++) {
                var e = $.extend(true, {}, c.settings.elements[j]);

                e.settings = subtract(e.settings, elementDefaultSettings);
                e.options = subtract(e.options, e.defaults);

                // clean
                e.settings = clean(e.settings);
                e.options = clean(e.options);

                c.settings.elements[j] = e;
            }

            settings.containers[i] = c;
        }

        return JSON.stringify(settings);
    }

    // The "Container" class servs literally as a container
    // for Element objects, similar to Bootstrap's "row" class.
    // It will have settings only for layout.

    var containerDefaultSettings = {
        elements: []
    };

    function Container() {
        // this.root is the highest element in the container's hierarchy.
        // it will contain data-index attribute, used to reference this element
        this.id = 'sq-container-' + Math.floor(Math.random() * 99999) + 1;

        this.settings = $.extend(true, {}, containerDefaultSettings);
    }
    Container.prototype.insertElement = function(elementCatalogIndex, index, options) {
        var e = new Element(registeredElements[elementCatalogIndex], options);
        this.settings.elements.splice(index, 0, e);

        // Assign a unique ID
        e.id = 'sq-element-' + Math.floor(Math.random() * 99999) + 1;
    }
    Container.prototype.render = function() {
        // Nothing to render for now
    }
    Container.prototype.appendEditorControls = function() {
        var html = '';
        html += '     <div class="sq-container-move"></div>';

        $('#' + this.id).append(html);
    }

    // The element object will represent a single piece of content.
    // Image, text, video, etc.
    // It will have settings for layout and styling

    var elementDefaultSettings = {
        name: 'Untitled Element',
        iconClass: 'fa fa-cube',
        extendOptions: [],
        options: {
            general: {
                id: {
                    name: 'ID',
                    type: 'text',
                    default: ''
                },
                classes: {
                    name: 'Classes',
                    type: 'text',
                    default: ''
                },
                css: {
                    name: 'CSS',
                    type: 'text',
                    default: ''
                }
            },
            layout: {
                box_model: {
                    name: 'Box Model',
                    type: 'box model',
                    default: {
                        margin: {
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0
                        },
                        padding: {
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10
                        }
                    }
                },
                use_grid: {
                    name: 'Use Grid System',
                    type: 'checkbox',
                    default: 1
                },
                column_span: {
                    name: 'Column Span',
                    type: 'select',
                    group: 'Layout Grid',
                    options: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
                    default: 12
                },
                width: {
                    name: 'Width',
                    type: 'int',
                    group: 'Layout Manual',
                    default: '100'
                },
                auto_width: {
                    name: 'Auto Width',
                    type: 'checkbox',
                    group: 'Layout Manual',
                    default: 1
                },
                height: {
                    name: 'Height',
                    type: 'int',
                    group: 'Layout Manual',
                    default: '100'
                },
                auto_height: {
                    name: 'Auto Height',
                    type: 'checkbox',
                    group: 'Layout Manual',
                    default: 1
                }
            },
            text: {
                font_family: {
                    name: 'Font Family',
                    type: 'text',
                    default: 'sans-serif'
                },
                font_size: {
                    name: 'Font Size',
                    type: 'text',
                    format: 'int',
                    default: '14'
                },
                font_weight: {
                    name: 'Font Weight',
                    type: 'text',
                    default: 'normal'
                },
                font_style: {
                    name: 'Font Style',
                    type: 'select',
                    options: [ 'normal', 'italic', 'oblique', 'initial', 'inherit' ],
                    default: 'normal'
                },
                line_height: {
                    name: 'Line Height',
                    type: 'text',
                    format: 'int',
                    default: '22'
                },
                text_color: {
                    name: 'Text Color',
                    type: 'color',
                    default: '#000000'
                },
                text_align: {
                    name: 'Text Align',
                    type: 'select',
                    options: ['left', 'right', 'center', 'justify', 'justify-all', 'start', 'end', 'match-parent', 'inherit', 'initial', 'unset'],
                    default: 'left'
                },
                text_decoration: {
                    name: 'Text Decoration',
                    type: 'select',
                    options: ['none', 'underline'],
                    default: 'none'
                },
                text_transform: {
                    name: 'Text Transform',
                    type: 'select',
                    options: [ 'none', 'capitalize', 'uppercase', 'lowercase', 'initial', 'inherit' ],
                    default: 'none'
                },
                text_shadow: {
                    name: 'Text Shadow',
                    type: 'text',
                    default: ''
                }
            },
            style: {
                background_color: {
                    name: 'Background Color',
                    type: 'color',
                    default: '#ffffff'
                },
                background_opacity: {
                    name: 'Background Opacity',
                    type: 'float',
                    default: '1'
                },
                opacity: {
                    name: 'Opacity',
                    type: 'float',
                    default: '1'
                },
                box_shadow: {
                    name: 'Box Shadow',
                    type: 'text',
                    default: 'none'
                },
                border_width: {
                    name: 'Border Width',
                    type: 'int',
                    default: '0'
                },
                border_style: {
                    name: 'Border Style',
                    type: 'select',
                    options: [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ],
                    default: 'none'
                },
                border_color: {
                    name: 'Border Color',
                    type: 'color',
                    default: '#000000'
                },
                border_opacity: {
                    name: 'Border Opacity',
                    type: 'float',
                    default: '1'
                },
                border_radius: {
                    name: 'Border Radius',
                    type: 'int',
                    default: '0'
                },
            }
        },
        content: function() {
            return '';
        }
    };

    function Element(settings, options) {
        // this.root is the highest element in the container's hierarchy.
        // it will contain data-index attribute, used to reference this element
        this.id = undefined;

        // Settings are used only for initialization
        this.settings = $.extend(true, {}, elementDefaultSettings, settings);

        // This array will contain only the default values for each option and
        // it will be used only for compressing the generated JSON
        this.defaults = new Array();

        // Array containing all control objects
        // all options of this element should be accessed from here
        this.controls = new Array();

        // Create a reference to the content() function, so 'this' within that function
        // refers to the Element object and it has access to its controls
        this.content = this.settings.content;

        this.init(options);
    }
    Element.prototype.init = function(options) {
        // Merge the extendOptions into the options
        this.settings.options = $.extend(true, {}, this.settings.options, this.settings.extendOptions);

        // Create associative array from this.settings.options containing default values
        // Used only for compression
        for (var g in this.settings.options) {
            if (this.settings.options.hasOwnProperty(g)) {
                var group = this.settings.options[g];

                if (!this.defaults[g]) {
                    this.defaults[g] = {};
                }

                for (var op in group) {
                    if (group.hasOwnProperty(op)) {
                        var option = group[op];

                        this.defaults[g][op] = option.default;
                    }
                }
            }
        }

        // Create controls
        for (var g in this.settings.options) {
            if (this.settings.options.hasOwnProperty(g)) {
                var group = this.settings.options[g];

                for (var op in group) {
                    if (group.hasOwnProperty(op)) {
                        var option = group[op];

                        // Get a control from the registered controls
                        // of the corresponding type
                        var controlOptions = undefined;

                        for (var i=0; i<registeredControls.length; i++) {
                            if (registeredControls[i].type == option.type) {
                                controlOptions = registeredControls[i];
                            }
                        }

                        // Check if there is a value in the init options
                        var v = option.default;

                        if (options !== undefined && options[g] !== undefined && options[g][op] !== undefined) {
                            v = options[g][op];
                        }

                        if (this.controls[g] === undefined) {
                            this.controls[g] = {};
                        }

                        var self = this;
                        this.controls[g][option.name] = new SquaresControl(controlOptions, option.name, option.group, g, option.options, function() {
                            self.updateForm();
                            self.render();
                            self.appendEditorControls();
                        });
                        this.controls[g][option.name].setVal(v);
                    }
                }
            }
        }
    }
    Element.prototype.getSettingsForm = function() {
        // Loop over all controls and get the HTML from each control
        // Also add a label with the name of the control
        var html = '';

        // Create tabs
        html += '<div class="sq-window-tab-buttons-group">';
        var groupCount = 0;
        for (var g in this.controls) {
            html += '<div class="sq-window-tab-button" data-tab-index="'+ groupCount +'" data-tab-group="sq-element-settings-tab-group">'+ g +'</div>';
            groupCount++;
        }
        html += '</div>';

        // Create content for each tab
        html += '<div class="sq-window-tab-content-wrap">';

        var groupCount = 0;
        for (var g in this.controls) {
            html += '<div class="sq-window-tab-content" data-tab-index="'+ groupCount +'" data-tab-group="sq-element-settings-tab-group">';

            var tabGroup = this.controls[g];
            groupCount++;

            for (var c in tabGroup) {
                var control = tabGroup[c];

                html += '<div class="squares-form-control '+ control.elementClass +'">';
                html += '<label for="'+ control.elementID +'">'+ control.name +'</label>';
                html += control.HTML();
                html += '</div>';
            }

            html += '</div>';
        }
        html += '</div>';
        return html;
    }
    Element.prototype.loadOptions = function() {
        // Load the current options of the element in the settings window

        for (var g in this.controls) {
            var tabGroup = this.controls[g];

            for (var c in tabGroup) {
                var control = tabGroup[c];
                control.loadVal();
            }
        }

        this.updateForm();
    }
    Element.prototype.updateForm = function() {
        if (this.controls['layout']['Use Grid System'].getVal() == 1) {
            $('.' + this.controls['layout']['Width'].elementClass).hide();
            $('.' + this.controls['layout']['Column Span'].elementClass).show();
        } else {
            $('.' + this.controls['layout']['Width'].elementClass).show();
            $('.' + this.controls['layout']['Column Span'].elementClass).hide();
        }
    }
    Element.prototype.generateStyles = function() {
        var css = '';
        // =====================================================================
        // Layout
        // =====================================================================
        // var o = this.options.layout;

        var o = this.controls['layout'];

        // Box Model
        if (o['Box Model'].getVal().margin.top !== '' && !isNaN(o['Box Model'].getVal().margin.top)) {
            css += 'margin-top: ' + o['Box Model'].getVal().margin.top + 'px; ';
        }
        if (o['Box Model'].getVal().margin.bottom !== '' && !isNaN(o['Box Model'].getVal().margin.bottom)) {
            css += 'margin-bottom: ' + o['Box Model'].getVal().margin.bottom + 'px; ';
        }
        if (o['Box Model'].getVal().margin.left !== '' && !isNaN(o['Box Model'].getVal().margin.left)) {
            css += 'margin-left: ' + o['Box Model'].getVal().margin.left + 'px; ';
        }
        if (o['Box Model'].getVal().margin.right !== '' && !isNaN(o['Box Model'].getVal().margin.right)) {
            css += 'margin-right: ' + o['Box Model'].getVal().margin.right + 'px; ';
        }

        if (o['Box Model'].getVal().padding.top !== '' && !isNaN(o['Box Model'].getVal().padding.top)) {
            css += 'padding-top: ' + o['Box Model'].getVal().padding.top + 'px; ';
        }
        if (o['Box Model'].getVal().padding.bottom !== '' && !isNaN(o['Box Model'].getVal().padding.bottom)) {
            css += 'padding-bottom: ' + o['Box Model'].getVal().padding.bottom + 'px; ';
        }
        if (o['Box Model'].getVal().padding.left !== '' && !isNaN(o['Box Model'].getVal().padding.left)) {
            css += 'padding-left: ' + o['Box Model'].getVal().padding.left + 'px; ';
        }
        if (o['Box Model'].getVal().padding.right !== '' && !isNaN(o['Box Model'].getVal().padding.right)) {
            css += 'padding-right: ' + o['Box Model'].getVal().padding.right + 'px; ';
        }
        console.log(o['Box Model']);
        return;
        if (parseInt(o.use_grid, 10) == 1) {
            // Grid system
            css += 'width: '+ getWidthOfElementInGrid(o.column_span) +'; ';
        } else {
            // Width
            if (parseInt(o.auto_width, 10) == 1) {
                css += 'width: auto; ';
            } else {
                if (o.width !== '' && !isNaN(o.width)) {
                    css += 'width: '+ o.width +'px; ';
                }
            }

            // Height
            if (parseInt(o.auto_height, 10) == 1) {
                css += 'height: auto; ';
            } else {
                if (o.height !== '' && !isNaN(o.height)) {
                    css += 'height: '+ o.height +'px; ';
                }
            }
        }

        css += 'float: left; ';

        // =====================================================================
        // Text
        // =====================================================================
        var o = this.options.text;

        // Font Family
        if (o.font_family !== '' && !isNaN(o.font_family)) {
            css += 'font-family: ' + o.font_family + '; ';
        }

        // Font Size
        if (o.font_size !== '' && !isNaN(o.font_size)) {
            css += 'font-size: ' + o.font_size + 'px; ';
        }

        // Font Weight
        if (o.font_weight !== '' && !isNaN(o.font_weight)) {
            css += 'font-weight: ' + o.font_weight + '; ';
        }

        // Font Style
        if (o.font_style !== '' && !isNaN(o.font_style)) {
            css += 'font-style: ' + o.font_style + '; ';
        }

        // Line Height
        if (o.line_height !== '' && !isNaN(o.line_height)) {
            css += 'line-height: ' + o.line_height + 'px; ';
        }

        // Text Color
        if (o.text_color !== '') {
            css += 'color: ' + o.text_color + '; ';
        }

        // Text Align
        if (o.text_align !== '' && !isNaN(o.text_align)) {
            css += 'text-align: ' + o.text_align + '; ';
        }

        // Text Decoration
        if (o.text_decoration !== '' && !isNaN(o.text_decoration)) {
            css += 'text-decoration: ' + o.text_decoration + '; ';
        }

        // Text Transform
        if (o.text_transform !== '' && !isNaN(o.text_transform)) {
            css += 'text-transform: ' + o.text_transform + '; ';
        }

        // Text Shadow
        if (o.text_shadow !== '' && !isNaN(o.text_shadow)) {
            css += 'text-shadow: ' + o.text_shadow + '; ';
        }


        // =====================================================================
        // Style
        // =====================================================================
        var o = this.options.style;

        // Background Color
        var c_bg = hexToRgb(o.background_color);
        css += 'background-color: rgba('+ c_bg.r +', '+ c_bg.g +', '+ c_bg.b +', '+ o.background_opacity +'); ';

        // Opacity
        if (o.opacity !== '' && !isNaN(o.opacity)) {
            css += 'opacity: ' + o.opacity + '; ';
        }

        // Box Shadow
        if (o.box_shadow !== '' && !isNaN(o.box_shadow)) {
            css += 'box-shadow: ' + o.box_shadow + '; ';
        }

        // Border Width
        if (o.border_width !== '' && !isNaN(o.border_width)) {
            css += 'border-width: ' + o.border_width + 'px; ';
        }

        // Border Style
        if (o.border_style !== '') {
            css += 'border-style: ' + o.border_style + '; ';
        }

        // Border Color
        var c_bg = hexToRgb(o.border_color);
        css += 'border-color: rgba('+ c_bg.r +', '+ c_bg.g +', '+ c_bg.b +', '+ o.border_opacity +'); ';

        // Border Radius
        if (o.border_radius !== '' && !isNaN(o.border_radius)) {
            css += 'border-radius: ' + o.border_radius + 'px; ';
        }

        return css;
    }
    Element.prototype.render = function() {
        // Update the element's user set content
        $('#' + this.id).html(this.content());

        // console.log(this.controls['Heading']);

        // Update the element's style
        $('#' + this.id).attr('style', this.generateStyles());
    }
    Element.prototype.appendEditorControls = function() {
        var html = '';

        html += '     <div class="sq-element-controls">';
        html += '         <div class="sq-element-control-drag"></div>';
        html += '         <div class="sq-element-control-edit"><i class="fa fa-cog"></i></div>';
        html += '         <div class="sq-element-control-delete"><i class="fa fa-trash-o"></i></div>';
        html += '     </div>';

        $('#' + this.id).append(html);
    }

    function EditorWindow() {
        this.root = undefined;
        this.id = Math.floor(Math.random() * 10000) + 1;

        this.visible = false;

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
        WindowHTML += '         <div class="sq-window-title">Squares</div>';
        WindowHTML += '         <div class="sq-window-close"><i class="fa fa-times"></i></div>';
        WindowHTML += '     </div>';
        WindowHTML += '     <div class="sq-window-container">';

        // Tab buttons
        WindowHTML += '         <div class="sq-window-tab-button sq-window-main-tab-button" data-tab-group="squares-window-main-tab-group" data-tab-index="0">Elements</div>';
        WindowHTML += '         <div class="sq-window-tab-button sq-window-main-tab-button" data-tab-group="squares-window-main-tab-group" data-tab-index="1">Settings</div>';
        WindowHTML += '         <div class="clear"></div>';

        // Elements tab
        WindowHTML += '         <div class="sq-window-tab-content" data-tab-group="squares-window-main-tab-group" data-tab-index="0" id="sq-window-elements-tab-content">';
        WindowHTML += '             <div class="sq-element-thumb-container">';
        for (var i=0; i<registeredElements.length; i++) {
            WindowHTML += '             <div class="sq-element-thumb" data-index="' + i + '"><i class="' + registeredElements[i].iconClass + '"></i></div>';
        }
        WindowHTML += '                 <div class="clear"></div>';
        WindowHTML += '             </div>';
        WindowHTML += '         </div>';

        // Settings tab
        WindowHTML += '         <div class="sq-window-tab-content" data-tab-group="squares-window-main-tab-group" data-tab-index="1" id="sq-window-settings-tab-content">';
        WindowHTML += '         </div>';

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

        // Open the editor window when click on element
        $(document).on('click', '.sq-element', function() {
            if (!self.visible) {
                var x = $(this).offset().left + $(this).closest('.sq-root-container').width() + 40;
                var y = $(this).offset().top;
                self.show(x, y);
            }

            var editor = $(this).closest('.sq-root-container').data.editor;
            var containerIndex = $(this).closest('.sq-container').data('index');
            var elementIndex = $(this).data('index');
            var el = editor.settings.containers[containerIndex].settings.elements[elementIndex];

            // open the settings tab
            $('#sq-window-elements-tab-content').hide();
            $('#sq-window-settings-tab-content').show();

            // load the element settings
            $('#sq-window-settings-tab-content').html(el.getSettingsForm());
            el.loadOptions();

            // go to the first tab of the settings
            $('.sq-window-tab-content[data-tab-group="sq-element-settings-tab-group"]').hide();
            $('.sq-window-tab-content[data-tab-group="sq-element-settings-tab-group"][data-tab-index="0"]').show();
        });

        // Open the window when clicked on the add elements button
        $(document).on('click', '.sq-add-elements', function() {
            if (!self.visible) {
                var x = $(this).closest('.sq-root-container').offset().left + $(this).closest('.sq-root-container').width() + 40;
                var y = $(this).closest('.sq-root-container').offset().top;
                self.show(x + 20, y + 20);
            }

            // Show the elements tab
            $('#sq-window-elements-tab-content').show();
            $('#sq-window-settings-tab-content').hide();

            // console.log($(this).closest('.sq-root-container').data.editor.generateJSON());
        });

        // Tab functionality
        $(document).on('click', '.sq-window-tab-button', function() {
            var index = $(this).data('tab-index');
            var tabGroup = $(this).data('tab-group');

            $('.sq-window-tab-content[data-tab-group="'+ tabGroup +'"]').hide();
            $('.sq-window-tab-content[data-tab-group="'+ tabGroup +'"][data-tab-index="'+ index +'"]').show();
        });

        // Button for closing the elements window
        self.root.find('.sq-window-close').on('click', function(e) {
            self.hide();
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

        // =====================================================================
        // Needs tidying up
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
                    $('body').prepend('<div id="sq-dragged-element-clone" class="sq-element-thumb">' + contents + '</div>');
                    dummyElementAtMouse = $('#sq-dragged-element-clone');
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
                                c.append('<div id="sq-dummy-element-dragging-from-window-tmp"></div>');
                                var x = $('#sq-dummy-element-dragging-from-window-tmp').offset().left + $('#sq-dummy-element-dragging-from-window-tmp').outerWidth()/2;
                                var y = $('#sq-dummy-element-dragging-from-window-tmp').offset().top + $('#sq-dummy-element-dragging-from-window-tmp').outerHeight()/2;
                                elementDragMap.push({ x: x, y: y, elementIndex: 0, containerIndex: i, editorIndex: k });
                                $('#sq-dummy-element-dragging-from-window-tmp').remove();
                            }

                            for (var j=0; j<editor.settings.containers[i].settings.elements.length; j++) {
                                var el = c.find('.sq-element[data-index='+ j +']');

                                el.before('<div id="sq-dummy-element-dragging-from-window-tmp"></div>');
                                var x = $('#sq-dummy-element-dragging-from-window-tmp').offset().left + $('#sq-dummy-element-dragging-from-window-tmp').outerWidth()/2;
                                var y = $('#sq-dummy-element-dragging-from-window-tmp').offset().top + $('#sq-dummy-element-dragging-from-window-tmp').outerHeight()/2;
                                elementDragMap.push({ x: x, y: y, elementIndex: j, containerIndex: i, editorIndex: k });
                                $('#sq-dummy-element-dragging-from-window-tmp').remove();

                                // When we reach the end of the elements array, add a dummy element after the last element
                                if (j == editor.settings.containers[i].settings.elements.length - 1) {
                                    el.after('<div id="sq-dummy-element-dragging-from-window-tmp"></div>');
                                    var x = $('#sq-dummy-element-dragging-from-window-tmp').offset().left + $('#sq-dummy-element-dragging-from-window-tmp').outerWidth()/2;
                                    var y = $('#sq-dummy-element-dragging-from-window-tmp').offset().top + $('#sq-dummy-element-dragging-from-window-tmp').outerHeight()/2;
                                    elementDragMap.push({ x: x, y: y, elementIndex: j+1, containerIndex: i, editorIndex: k });
                                    $('#sq-dummy-element-dragging-from-window-tmp').remove();
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
                    $('#sq-dummy-element-dragging-from-window').remove();

                    // Insert a new dummy element at the container/element index
                    var containerIndex = elementDragMap[virtualIndexOfDraggedElement].containerIndex;
                    var elementIndex = elementDragMap[virtualIndexOfDraggedElement].elementIndex;
                    var editorIndex = elementDragMap[virtualIndexOfDraggedElement].editorIndex;
                    var c = editors[editorIndex].host.find('.sq-container[data-index='+ containerIndex +']');

                    // If the index of the dummy element is bigger than the number
                    // of elements in that container, insert the dummy at the end
                    if (elementIndex == editors[editorIndex].settings.containers[containerIndex].settings.elements.length) {
                        c.append('<div id="sq-dummy-element-dragging-from-window"></div>');
                    } else {
                        var e = c.find('.sq-element[data-index='+ elementIndex +']');
                        e.before('<div id="sq-dummy-element-dragging-from-window"></div>');
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
    EditorWindow.prototype.show = function(x, y) {
        this.visible = true;
        this.root.show();

        if (x !== undefined && y !== undefined) {
            this.root.css({
                left: x,
                top: y
            });
        }

        $('.sq-window-active').removeClass('sq-window-active');
        this.root.addClass('sq-window-active');
    }
    EditorWindow.prototype.hide = function() {
        this.visible = false;
        this.root.hide();
    }

    function SquaresControl(s, name, group, tabGroup, options, valueUpdated) {
        // The 's' argument is the array coming from the registeredControls array

        // Automatically generated at the time of object creation
        this.id = Math.floor(Math.random() * 9999) + 1;
        this.elementID = 'squares-control-' + this.id;
        this.elementClass = 'squares-element-option-group';

        // Settings coming from the registered controls catalog
        // referenced in the 'this' variable, so 'this' can be accessed within
        // those functions (in case of validate(), HTML(), events(), etc)
        // These settings are also common in all controls
        this.type = s.type;
        this.getValue = s.getValue;
        this.setValue = s.setValue;
        this.HTML = s.HTML;

        // These variables are specific for each individual control
        this.name = name;
        this.options = options;
        this.group = group;
        this.tabGroup = tabGroup;

        // Private property, must be accessed only via setter and getter
        this._value = undefined;

        // Update this.elementClass
        if (this.group !== undefined) {
            this.elementClass = 'squares-element-option-group-' + this.group.toLowerCase().replace(/\s/g, '-');
        }

        // Launch the events provided from the settings
        this.events = s.events;
        this.events();

        // Create a callback function for when the control updates its value
        this.valueUpdated = valueUpdated;
    }
    SquaresControl.prototype.getVal = function() {
        var v = this._value;

        try {
            v = this.getValue();
        } catch (err) {

        }

        if (v !== undefined) {
            return v;
        } else {
            return this._value;
        }
    }
    SquaresControl.prototype.setVal = function(v) {
        this._value = v;

        try {
            this.setValue(v);
        } catch (err) {
            this._value = v;
        }
    }
    SquaresControl.prototype.loadVal = function() {
        // Re-sets the control to its stored value
        this.setValue(this._value);
    }
    SquaresControl.prototype.updateVal = function() {
        // Re-sets the control to its stored value
        this._value = this.getValue();
        this.valueUpdated();
    }

    // Utility
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    function subtract(a, b) {
        var r = {};

        // For each property of 'b'
        // if it's different than the corresponding property of 'a'
        // place it in 'r'
        for (var key in b) {
            if (typeof(b[key]) == 'object') {
                if (!a[key]) a[key] = {};
                r[key] = subtract(a[key], b[key]);
            } else {
                if (b[key] != a[key]) {
                    r[key] = a[key];
                }
            }
        }

        return r;
    }
    function clean(a) {
        var r = undefined;

        // Check if 'a' is an object
        if (typeof(a) == 'object') {
            // If 'a' is an object, check if it's empty and set to undefined if true
            if (isEmpty(a)) {
                r = undefined;
            } else {
                // If 'a' is NOT empty, iterate over each of its properties
                // and recursively clean
                for (var key in a) {
                    var cleaned = clean(a[key]);

                    if (cleaned !== undefined) {
                        if (r === undefined) r = {};

                        r[key] = cleaned;
                    }
                }
            }
        } else {
            r = a;
        }

        return r;
    }
    function isEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
            return false;
        }

        return true && JSON.stringify(obj) === JSON.stringify({});
    }
    function getWidthOfElementInGrid(span) {
        var columnWidth = 8.33333333;
        var elementWidth = columnWidth * span;

        return elementWidth + '%';
    }

})(jQuery, window, document);
