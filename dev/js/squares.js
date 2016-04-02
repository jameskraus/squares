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
            return '<p id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>';
        }
    });
    $.squaresRegisterElement({
        name: "Heading",
        iconClass: "fa fa-header",
        extendOptions: {
            heading: {
                heading: {
                    name: 'Heading',
                    type: 'select',
                    options: ['h1', 'h2', 'h3'],
                    default: 'h3'
                }
            }
        },
        content: function() {
            // this = options
            return '<'+ this.heading.heading +' id="'+ this.general.id +'" style="'+ this.general.css +'" class="'+ this.general.classes +'">Lorem Ipsum</'+ this.heading.heading +'>';
        }
    });
    $.squaresRegisterElement({
        name: "Image",
        iconClass: "fa fa-picture-o",
        content: function() {
            return '<img src="http://www.online-image-editor.com//styles/2014/images/example_image.png" id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'">';
        }
    });
    $.squaresRegisterElement({
        name: "Button",
        iconClass: "fa fa-hand-pointer-o",
        content: function() {
            return '<input type="button" value="Button" id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'">';
        }
    });
    $.squaresRegisterElement({
        name: "Video",
        iconClass: "fa fa-video-camera",
        content: function() {
            return '<video autoplay id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'"><source src="http://html5demos.com/assets/dizzy.mp4" type="video/mp4"><source src="http://html5demos.com/assets/dizzy.webm" type="video/webm"><source src="http://html5demos.com/assets/dizzy.ogg" type="video/ogg"></video>';
        }
    });
    $.squaresRegisterElement({
        name: "YouTube",
        iconClass: "fa fa-youtube",
        content: function() {
            return '<iframe id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'" width="560" height="315" src="https://www.youtube.com/embed/IstWciF_aW0" frameborder="0" allowfullscreen></iframe>';
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

            var squaresInstance = new Squares(this);

            editors.push(squaresInstance);

            $(this).data('squares', squaresInstance);
        });

        // Create the windows
        addWindows();
        addEvents();

        // Events for dragging elements from the element window to a container.
        // These events needs to be editor-independant
        addDragElementsFromWindowEvents();

        // Test initWithSettings
        var s = '{"containers":[{"id":"sq-container-984031","settings":{"elements":[{"settings":{"name":"Paragraph","iconClass":"fa fa-font","extendOptions":[],"options":{"general":{"id":{"name":"ID","type":"text","default":"","val":""},"classes":{"name":"Classes","type":"text","default":"","val":""},"css":{"name":"CSS","type":"text","default":"","val":""}},"layout":{"column_span":{"name":"Column Span","type":"select","options":[1,2,3,4,5,6,7,8,9,10,11,12],"default":12,"val":12},"box_model":{"name":"Box Model","type":"box model","default":{"margin":{"top":10,"bottom":10,"left":0,"right":0},"padding":{"top":0,"bottom":0,"left":10,"right":10}},"val":{"margin":{"top":10,"bottom":10,"left":0,"right":0},"padding":{"top":0,"bottom":0,"left":10,"right":10}}},"width":{"name":"Width","type":"int","default":"100","val":"100"},"auto_width":{"name":"Auto Width","type":"checkbox","default":1,"val":1},"height":{"name":"Height","type":"int","default":"100","val":"100"},"auto_height":{"name":"Auto Height","type":"checkbox","default":1,"val":1}},"text":{"font_family":{"name":"Font Family","type":"text","default":"sans-serif","val":"sans-serif"},"font_size":{"name":"Font Size","type":"text","format":"int","default":"14","val":"14"},"font_weight":{"name":"Font Weight","type":"text","default":"normal","val":"normal"},"font_style":{"name":"Font Style","type":"select","options":["normal","italic","oblique","initial","inherit"],"default":"normal","val":"normal"},"line_height":{"name":"Line Height","type":"text","format":"int","default":"22","val":"22"},"text_color":{"name":"Text Color","type":"color","default":"#000000","val":"#000000"},"text_align":{"name":"Text Align","type":"select","options":["left","right","center","justify","justify-all","start","end","match-parent","inherit","initial","unset"],"default":"left","val":"left"},"text_decoration":{"name":"Text Decoration","type":"select","options":["none","underline"],"default":"none","val":"none"},"text_transform":{"name":"Text Transform","type":"select","options":["none","capitalize","uppercase","lowercase","initial","inherit"],"default":"none","val":"none"},"text_shadow":{"name":"Text Shadow","type":"text","default":"","val":""}},"style":{"background_color":{"name":"Background Color","type":"color","default":"#ffffff","val":"#ffffff"},"background_opacity":{"name":"Background Opacity","type":"float","default":"1","val":"1"},"opacity":{"name":"Opacity","type":"float","default":"1","val":"1"},"box_shadow":{"name":"Box Shadow","type":"text","default":"none","val":"none"},"border_width":{"name":"Border Width","type":"int","default":"0","val":"0"},"border_style":{"name":"Border Style","type":"select","options":["none","hidden","dotted","dashed","solid","double","groove","ridge","inset","outset"],"default":"none","val":"none"},"border_color":{"name":"Border Color","type":"color","default":"#000000","val":"#000000"},"border_opacity":{"name":"Border Opacity","type":"float","default":"1","val":"1"},"border_radius":{"name":"Border Radius","type":"int","default":"0","val":"0"}}},"styles":"","classes":"","id":""},"id":"sq-element-7461"},{"settings":{"name":"Paragraph","iconClass":"fa fa-font","extendOptions":[],"options":{"general":{"id":{"name":"ID","type":"text","default":"","val":""},"classes":{"name":"Classes","type":"text","default":"","val":""},"css":{"name":"CSS","type":"text","default":"","val":""}},"layout":{"column_span":{"name":"Column Span","type":"select","options":[1,2,3,4,5,6,7,8,9,10,11,12],"default":12,"val":"12"},"box_model":{"name":"Box Model","type":"box model","default":{"margin":{"top":10,"bottom":10,"left":0,"right":0},"padding":{"top":0,"bottom":0,"left":10,"right":10}},"val":{"margin":{"top":40,"bottom":40,"left":40,"right":40},"padding":{"top":20,"bottom":20,"left":20,"right":20}}},"width":{"name":"Width","type":"int","default":"100","val":100},"auto_width":{"name":"Auto Width","type":"checkbox","default":1,"val":1},"height":{"name":"Height","type":"int","default":"100","val":100},"auto_height":{"name":"Auto Height","type":"checkbox","default":1,"val":1}},"text":{"font_family":{"name":"Font Family","type":"text","default":"sans-serif","val":"sans-serif"},"font_size":{"name":"Font Size","type":"text","format":"int","default":"14","val":"14"},"font_weight":{"name":"Font Weight","type":"text","default":"normal","val":"normal"},"font_style":{"name":"Font Style","type":"select","options":["normal","italic","oblique","initial","inherit"],"default":"normal","val":"normal"},"line_height":{"name":"Line Height","type":"text","format":"int","default":"22","val":"22"},"text_color":{"name":"Text Color","type":"color","default":"#000000","val":"#000000"},"text_align":{"name":"Text Align","type":"select","options":["left","right","center","justify","justify-all","start","end","match-parent","inherit","initial","unset"],"default":"left","val":"left"},"text_decoration":{"name":"Text Decoration","type":"select","options":["none","underline"],"default":"none","val":"none"},"text_transform":{"name":"Text Transform","type":"select","options":["none","capitalize","uppercase","lowercase","initial","inherit"],"default":"none","val":"none"},"text_shadow":{"name":"Text Shadow","type":"text","default":"","val":""}},"style":{"background_color":{"name":"Background Color","type":"color","default":"#ffffff","val":"#ffffff"},"background_opacity":{"name":"Background Opacity","type":"float","default":"1","val":1},"opacity":{"name":"Opacity","type":"float","default":"1","val":1},"box_shadow":{"name":"Box Shadow","type":"text","default":"none","val":"none"},"border_width":{"name":"Border Width","type":"int","default":"0","val":0},"border_style":{"name":"Border Style","type":"select","options":["none","hidden","dotted","dashed","solid","double","groove","ridge","inset","outset"],"default":"none","val":"none"},"border_color":{"name":"Border Color","type":"color","default":"#000000","val":"#000000"},"border_opacity":{"name":"Border Opacity","type":"float","default":"1","val":1},"border_radius":{"name":"Border Radius","type":"int","default":"0","val":0}}},"styles":"","classes":"","id":""},"id":"sq-element-341731"}]}},{"id":"sq-container-691981","settings":{"elements":[{"settings":{"name":"Paragraph","iconClass":"fa fa-font","extendOptions":[],"options":{"general":{"id":{"name":"ID","type":"text","default":"","val":""},"classes":{"name":"Classes","type":"text","default":"","val":""},"css":{"name":"CSS","type":"text","default":"","val":""}},"layout":{"column_span":{"name":"Column Span","type":"select","options":[1,2,3,4,5,6,7,8,9,10,11,12],"default":12,"val":12},"box_model":{"name":"Box Model","type":"box model","default":{"margin":{"top":10,"bottom":10,"left":0,"right":0},"padding":{"top":0,"bottom":0,"left":10,"right":10}},"val":{"margin":{"top":10,"bottom":10,"left":0,"right":0},"padding":{"top":0,"bottom":0,"left":10,"right":10}}},"width":{"name":"Width","type":"int","default":"100","val":"100"},"auto_width":{"name":"Auto Width","type":"checkbox","default":1,"val":1},"height":{"name":"Height","type":"int","default":"100","val":"100"},"auto_height":{"name":"Auto Height","type":"checkbox","default":1,"val":1}},"text":{"font_family":{"name":"Font Family","type":"text","default":"sans-serif","val":"sans-serif"},"font_size":{"name":"Font Size","type":"text","format":"int","default":"14","val":"14"},"font_weight":{"name":"Font Weight","type":"text","default":"normal","val":"normal"},"font_style":{"name":"Font Style","type":"select","options":["normal","italic","oblique","initial","inherit"],"default":"normal","val":"normal"},"line_height":{"name":"Line Height","type":"text","format":"int","default":"22","val":"22"},"text_color":{"name":"Text Color","type":"color","default":"#000000","val":"#000000"},"text_align":{"name":"Text Align","type":"select","options":["left","right","center","justify","justify-all","start","end","match-parent","inherit","initial","unset"],"default":"left","val":"left"},"text_decoration":{"name":"Text Decoration","type":"select","options":["none","underline"],"default":"none","val":"none"},"text_transform":{"name":"Text Transform","type":"select","options":["none","capitalize","uppercase","lowercase","initial","inherit"],"default":"none","val":"none"},"text_shadow":{"name":"Text Shadow","type":"text","default":"","val":""}},"style":{"background_color":{"name":"Background Color","type":"color","default":"#ffffff","val":"#ffffff"},"background_opacity":{"name":"Background Opacity","type":"float","default":"1","val":"1"},"opacity":{"name":"Opacity","type":"float","default":"1","val":"1"},"box_shadow":{"name":"Box Shadow","type":"text","default":"none","val":"none"},"border_width":{"name":"Border Width","type":"int","default":"0","val":"0"},"border_style":{"name":"Border Style","type":"select","options":["none","hidden","dotted","dashed","solid","double","groove","ridge","inset","outset"],"default":"none","val":"none"},"border_color":{"name":"Border Color","type":"color","default":"#000000","val":"#000000"},"border_opacity":{"name":"Border Opacity","type":"float","default":"1","val":"1"},"border_radius":{"name":"Border Radius","type":"int","default":"0","val":"0"}}},"styles":"","classes":"","id":""},"id":"sq-element-967591"}]}}]}';
        // $.squaresInitWithSettings($('.squares').first(), JSON.parse(s));
        $.squaresInitWithSettings($('.squares').first());
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
    function addEvents() {
        $(document).on('click', '.sq-add-elements', function() {
            var x = $(this).closest('.sq-root-container').offset().left + $(this).closest('.sq-root-container').width() + 40;
            var y = $(this).closest('.sq-root-container').offset().top;
            elementsWindow.show(x, y);

            // $(this).closest('.sq-root-container').data.editor.generateJSON();
            console.log($(this).closest('.sq-root-container').data.editor.generateJSON());
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
            elementSettingsWindow.dataSource = el;
            el.loadOptions();

            $('.sq-window-tab-content').hide();
            $('.sq-window-tab-content[data-tab-index="1"]').show();
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
            c.appendControls();

            for (var j=0; j<c.settings.elements.length; j++) {
                var e = c.settings.elements[j];

                // Append an element to the container
                var html = '<div class="sq-element" data-index="' + j + '" id="'+ e.id +'"></div>';
                containerRoot.append(html);

                // Call the render() function of the element
                e.render();
                e.appendControls();
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
                width: this.draggedElement.outerWidth(),
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
    };
    Squares.prototype.addElement = function(containerIndex, elementIndex, elementCatalogIndex) {
        var self = this;

        // Add element to container at index
        self.settings.containers[containerIndex].insertElement(elementCatalogIndex, elementIndex);

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
    Container.prototype.insertElement = function(elementCatalogIndex, index) {
        var e = $.extend(true, {}, elementsCatalog[elementCatalogIndex]);
        this.settings.elements.splice(index, 0, e);

        // Assign a unique ID
        e.id = 'sq-element-' + Math.floor(Math.random() * 99999) + 1;
    }
    Container.prototype.render = function() {
        // Nothing to render for now
    }
    Container.prototype.appendControls = function() {
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
                column_span: {
                    name: 'Column Span',
                    type: 'select',
                    options: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
                    default: 12
                },
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
                width: {
                    name: 'Width',
                    type: 'int',
                    default: '100'
                },
                auto_width: {
                    name: 'Auto Width',
                    type: 'checkbox',
                    default: 1
                },
                height: {
                    name: 'Height',
                    type: 'int',
                    default: '100'
                },
                auto_height: {
                    name: 'Auto Height',
                    type: 'checkbox',
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

        // Associative array containing the CURRENT values for each setting
        this.options = $.extend(true, {}, options);

        // This array will contain only the default values for each option and
        // it will be used only for compressing the generated JSON
        this.defaults = new Array();

        //
        this.options.content = this.settings.content;

        this.init();
    }
    Element.prototype.init = function() {
        // Add the extra settings to the this.settings.options object
        this.settings.options = $.extend(true, {}, this.settings.options, this.settings.extendOptions);

        // Set styles, classes and id
        // this.settings.styles = this.getUserCSS();
        // this.settings.classes = this.getUserClasses();
        // this.settings.id = this.getUserID();

        // Create associative array for this.options
        for (var g in this.settings.options) {
            if (this.settings.options.hasOwnProperty(g)) {
                var group = this.settings.options[g];

                if (!this.options[g]) {
                    this.options[g] = {};
                }
                if (!this.defaults[g]) {
                    this.defaults[g] = {};
                }

                for (var op in group) {
                    if (group.hasOwnProperty(op)) {
                        var option = group[op];

                        if (this.options[g][op] != option.default) {
                            this.options[g][op] = option.default;
                        }

                        this.defaults[g][op] = option.default;
                    }
                }
            }
        }
    }
    Element.prototype.getSettingsForm = function() {
        // Generates a settings form for this element
        return generateForm(this.settings.options);
    }
    Element.prototype.loadOptions = function() {
        // Loads its options in the settings window
        // Attempts to find the correct input field using the ID
        // generated from the "generateFormElementIDFromName" function.

        for (var g in this.settings.options) {
            if (this.settings.options.hasOwnProperty(g)) {
                var group = this.settings.options[g];

                for (var op in group) {
                    if (group.hasOwnProperty(op)) {
                        var option = group[op];
                        var id = generateFormElementIDFromName(option.name);

                        if (option.type == 'text') {
                            $('#' + id).val(this.options[g][op]);
                        }
                        if (option.type == 'int') {
                            $('#' + id).val(parseInt(this.options[g][op], 10));
                        }
                        if (option.type == 'float') {
                            $('#' + id).val(parseFloat(this.options[g][op], 10));
                        }
                        if (option.type == 'checkbox') {
                            if (parseInt(this.options[g][op], 10) == 1) {
                                $('#' + id).get(0).checked = true;
                            } else {
                                $('#' + id).get(0).checked = false;
                            }
                        }
                        if (option.type == 'color') {
                            $('#' + id).val(this.options[g][op]);
                        }

                        if (option.type == 'select') {
                            $('#' + id).val(this.options[g][op]);
                        }

                        if (option.type == 'box model') {
                            $('#squares-element-option-boxmodel-margin-top').val(parseInt(this.options[g][op].margin.top));
                            $('#squares-element-option-boxmodel-margin-bottom').val(parseInt(this.options[g][op].margin.bottom));
                            $('#squares-element-option-boxmodel-margin-left').val(parseInt(this.options[g][op].margin.left));
                            $('#squares-element-option-boxmodel-margin-right').val(parseInt(this.options[g][op].margin.right));

                            $('#squares-element-option-boxmodel-padding-top').val(parseInt(this.options[g][op].padding.top));
                            $('#squares-element-option-boxmodel-padding-bottom').val(parseInt(this.options[g][op].padding.bottom));
                            $('#squares-element-option-boxmodel-padding-left').val(parseInt(this.options[g][op].padding.left));
                            $('#squares-element-option-boxmodel-padding-right').val(parseInt(this.options[g][op].padding.right));
                        }
                    }
                }
            }
        }
    }
    Element.prototype.updateOptions = function() {
        // Updates its options based on the input fields loaded
        // in the current Settings window.

        for (var g in this.settings.options) {
            if (this.settings.options.hasOwnProperty(g)) {
                var group = this.settings.options[g];

                for (var op in group) {
                    if (group.hasOwnProperty(op)) {
                        var option = group[op];
                        var id = generateFormElementIDFromName(option.name);

                        if (option.type == 'text') {
                            this.options[g][op] = $('#' + id).val();
                        }
                        if (option.type == 'int') {
                            this.options[g][op] = parseInt($('#' + id).val(), 10);
                        }
                        if (option.type == 'float') {
                            this.options[g][op] = parseFloat($('#' + id).val(), 10);
                        }
                        if (option.type == 'checkbox') {
                            if ($('#' + id).get(0).checked) {
                                this.options[g][op] = 1;
                            } else {
                                this.options[g][op] = 0;
                            }
                        }
                        if (option.type == 'color') {
                            this.options[g][op] = $('#' + id).val();
                        }

                        if (option.type == 'select') {
                            this.options[g][op] = $('#' + id).val();
                        }

                        if (option.type == 'box model') {
                            this.options[g][op].margin.top = parseInt($('#squares-element-option-boxmodel-margin-top').val(), 10);
                            this.options[g][op].margin.bottom = parseInt($('#squares-element-option-boxmodel-margin-bottom').val(), 10);
                            this.options[g][op].margin.left = parseInt($('#squares-element-option-boxmodel-margin-left').val(), 10);
                            this.options[g][op].margin.right = parseInt($('#squares-element-option-boxmodel-margin-right').val(), 10);

                            this.options[g][op].padding.top = parseInt($('#squares-element-option-boxmodel-padding-top').val(), 10);
                            this.options[g][op].padding.bottom = parseInt($('#squares-element-option-boxmodel-padding-bottom').val(), 10);
                            this.options[g][op].padding.left = parseInt($('#squares-element-option-boxmodel-padding-left').val(), 10);
                            this.options[g][op].padding.right = parseInt($('#squares-element-option-boxmodel-padding-right').val(), 10);
                        }
                    }
                }
            }
        }

        this.render();
        this.appendControls();
    }
    Element.prototype.getUserCSS = function() {
        return this.settings.options.general.css.val;
    }
    Element.prototype.getUserClasses = function() {
        return this.settings.options.general.classes.val;
    }
    Element.prototype.getUserID = function() {
        return this.settings.options.general.id.val;
    }
    Element.prototype.generateStyles = function() {
        var css = '';

        // =====================================================================
        // Layout
        // =====================================================================
        var o = this.options.layout;

        // to do: grid system

        // Box Model
        if (o.box_model.margin.top !== '' && !isNaN(o.box_model.margin.top)) {
            css += 'margin-top: ' + o.box_model.margin.top + 'px; ';
        }
        if (o.box_model.margin.bottom !== '' && !isNaN(o.box_model.margin.bottom)) {
            css += 'margin-bottom: ' + o.box_model.margin.bottom + 'px; ';
        }
        if (o.box_model.margin.left !== '' && !isNaN(o.box_model.margin.left)) {
            css += 'margin-left: ' + o.box_model.margin.left + 'px; ';
        }
        if (o.box_model.margin.right !== '' && !isNaN(o.box_model.margin.right)) {
            css += 'margin-right: ' + o.box_model.margin.right + 'px; ';
        }

        if (o.box_model.padding.top !== '' && !isNaN(o.box_model.padding.top)) {
            css += 'padding-top: ' + o.box_model.padding.top + 'px; ';
        }
        if (o.box_model.padding.bottom !== '' && !isNaN(o.box_model.padding.bottom)) {
            css += 'padding-bottom: ' + o.box_model.padding.bottom + 'px; ';
        }
        if (o.box_model.padding.left !== '' && !isNaN(o.box_model.padding.left)) {
            css += 'padding-left: ' + o.box_model.padding.left + 'px; ';
        }
        if (o.box_model.padding.right !== '' && !isNaN(o.box_model.padding.right)) {
            css += 'padding-right: ' + o.box_model.padding.right + 'px; ';
        }

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

        // =====================================================================
        // Text
        // =====================================================================
        var o = this.options.text;

        // Font Family
        if (o.font_family !== '' && !isNaN()) {
            css += 'font-family: ' + o.font_family + '; ';
        }

        // Font Size
        if (o.font_size !== '' && !isNaN()) {
            css += 'font-size: ' + o.font_size + 'px; ';
        }

        // Font Weight
        if (o.font_weight !== '' && !isNaN()) {
            css += 'font-weight: ' + o.font_weight + '; ';
        }

        // Font Style
        if (o.font_style !== '' && !isNaN()) {
            css += 'font-style: ' + o.font_style + '; ';
        }

        // Line Height
        if (o.line_height !== '' && !isNaN()) {
            css += 'line-height: ' + o.line_height + 'px; ';
        }

        // Text Color
        if (o.text_color !== '' && !isNaN()) {
            css += 'color: ' + o.text_color + '; ';
        }

        // Text Align
        if (o.text_align !== '' && !isNaN()) {
            css += 'text-align: ' + o.text_align + '; ';
        }

        // Text Decoration
        if (o.text_decoration !== '' && !isNaN()) {
            css += 'text-decoration: ' + o.text_decoration + '; ';
        }

        // Text Transform
        if (o.text_transform !== '' && !isNaN()) {
            css += 'text-transform: ' + o.text_transform + '; ';
        }

        // Text Shadow
        if (o.text_shadow !== '' && !isNaN()) {
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
        if (o.opacity !== '' && !isNaN()) {
            css += 'opacity: ' + o.opacity + '; ';
        }

        // Box Shadow
        if (o.box_shadow !== '' && !isNaN()) {
            css += 'box-shadow: ' + o.box_shadow + '; ';
        }

        // Border Width
        if (o.border_width !== '' && !isNaN()) {
            css += 'border-width: ' + o.border_width + 'px; ';
        }

        // Border Style
        if (o.border_style !== '' && !isNaN()) {
            css += 'border-style: ' + o.border_style + '; ';
        }

        // Border Color
        var c_bg = hexToRgb(o.border_color);
        css += 'border-color: rgba('+ c_bg.r +', '+ c_bg.g +', '+ c_bg.b +', '+ o.border_opacity +'); ';

        // Border Radius
        if (o.border_radius !== '' && !isNaN()) {
            css += 'border-radius: ' + o.border_radius + 'px; ';
        }

        return css;
    }
    Element.prototype.render = function() {
        // Update the element's user set content
        $('#' + this.id).html(this.options.content());

        // Update the element's style
        $('#' + this.id).attr('style', this.generateStyles());
    }
    Element.prototype.appendControls = function() {
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

        // flags for dragging the window
        this.shouldStartDragging = false;
        this.didStartDragging = false;
        this.dragging = false;
        this.iex = 0; // initial event x
        this.iey = 0; // initial event y
        this.ix = 0; // initial window x
        this.iy = 0; // initial window y

        // Data source object for any form elements that a window might contain
        // For example, the data source for the element settings window will be
        // the element itself. element.loadOptions() will look for form elements
        // with specific IDs
        this.dataSource = undefined;

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
        var self = this;
        this.root.find('.sq-window-container').html(html);

        // Set an event for all form elements
        this.root.find('input, select, textarea').on('change', function() {
            self.dataSource.updateOptions();
        });
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
        var groupCount = 0;
        for (var g in o) {
            if (o.hasOwnProperty(g)) {
                html += '<div class="sq-window-tab-button" data-tab-index="'+ groupCount +'">'+ g +'</div>';
                groupCount++;
            }
        }
        html += '</div>';

        // Create content for each tab
        html += '<div class="sq-window-tab-content-wrap">';

        var groupCount = 0;
        for (var g in o) {
            if (o.hasOwnProperty(g)) {
                html += '<div class="sq-window-tab-content" data-tab-index="'+ groupCount +'">';

                var group = o[g];
                groupCount++;

                var optionCount = 0;
                for (var op in group) {
                    if (group.hasOwnProperty(op)) {
                        optionCount++;
                        var option = group[op];
                        var id = generateFormElementIDFromName(option.name);

                        html += '<label for="'+ id +'">'+ option.name +'</label>';
                        if (option.type == 'text' || option.type == 'int' || option.type == 'float') {
                            html += '<input type="text" placeholder="'+ option.name +'" id="'+ id +'">';
                        }
                        if (option.type == 'checkbox') {
                            html += '<input type="checkbox" placeholder="'+ option.name +'" id="'+ id +'">';
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

                        if (option.type == 'box model') {
                            html += '<div class="sq-boxmodel-margin">';
                            html += '   <div id="sq-boxmodel-label-margin">margin</div>';
                            html += '   <input type="text" class="sq-boxmodel-input" id="squares-element-option-boxmodel-margin-top">';
                            html += '   <input type="text" class="sq-boxmodel-input" id="squares-element-option-boxmodel-margin-bottom">';
                            html += '   <input type="text" class="sq-boxmodel-input" id="squares-element-option-boxmodel-margin-left">';
                            html += '   <input type="text" class="sq-boxmodel-input" id="squares-element-option-boxmodel-margin-right">';
                            html += '   <div class="sq-boxmodel-padding">';
                            html += '       <div id="sq-boxmodel-label-padding">padding</div>';
                            html += '       <input type="text" class="sq-boxmodel-input" id="squares-element-option-boxmodel-padding-top">';
                            html += '       <input type="text" class="sq-boxmodel-input" id="squares-element-option-boxmodel-padding-bottom">';
                            html += '       <input type="text" class="sq-boxmodel-input" id="squares-element-option-boxmodel-padding-left">';
                            html += '       <input type="text" class="sq-boxmodel-input" id="squares-element-option-boxmodel-padding-right">';
                            html += '   </div>';
                            html += '</div>';
                        }
                    }
                }

                html += '</div>';
            }
        }
        html += '</div>';
        return html;
    }
    function generateFormElementIDFromName(name) {
        return 'squares-element-option-' + name.toLowerCase().replace(' ', '-');
    }
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

})(jQuery, window, document);
