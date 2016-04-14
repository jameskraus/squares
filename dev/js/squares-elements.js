// Squares
// Description: Interactive and embeddable HTML content builder.
// Author: Nikolay Dyankov
// License: MIT

;(function ($, window, document, undefined) {
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
            return '<'+ this.controls['heading']['Heading'].getVal() +' id="'+ this.controls['general']['ID'].getVal() +'" style="'+ this.controls['general']['CSS'].getVal() +'" class="'+ this.controls['general']['Classes'].getVal() +'">Lorem Ipsum</'+ this.controls['heading']['Heading'].getVal() +'>';
            return 'asd';
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
})(jQuery, window, document);
