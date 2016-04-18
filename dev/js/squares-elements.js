// Squares
// Description: Interactive and embeddable HTML content builder.
// Author: Nikolay Dyankov
// License: MIT

;(function ($, window, document, undefined) {
    // Register built-in elements using the public API
    $.squaresRegisterElement({
        name: "Paragraph",
        iconClass: "fa fa-font",
        controls: {
            text: {
                text: {
                    name: 'Text',
                    type: 'textarea',
                    default: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.'
                }
            }
        },
        content: function() {
            return '<p id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'">'+ this.controls.text.text.getVal() +'</p>';
        }
    });
    $.squaresRegisterElement({
        name: "Heading",
        iconClass: "fa fa-header",
        controls: {
            heading: {
                text: {
                    name: 'Text',
                    type: 'text',
                    default: 'Lorem Ipsum'
                },
                heading: {
                    name: 'Heading',
                    type: 'select',
                    options: ['h1', 'h2', 'h3'],
                    default: 'h3'
                }
            }
        },
        content: function() {
            return '<'+ this.controls['heading']['heading'].getVal() +' id="'+ this.controls['general']['id'].getVal() +'" style="'+ this.controls['general']['css'].getVal() +'" class="'+ this.controls['general']['classes'].getVal() +'">'+ this.controls.heading.text.getVal() +'</'+ this.controls['heading']['heading'].getVal() +'>';
            return 'asd';
        }
    });
    $.squaresRegisterElement({
        name: "Image",
        iconClass: "fa fa-picture-o",
        controls: {
            image: {
                url: {
                    name: 'Image URL',
                    type: 'text',
                    default: 'http://www.online-image-editor.com//styles/2014/images/example_image.png'
                },
                image_is_a_link: {
                    name: 'Image is a Link',
                    type: 'checkbox',
                    default: 0
                },
                link_to: {
                    name: 'Link to',
                    type: 'text',
                    default: '#'
                }
            }
        },
        content: function() {
            return '<img src="http://www.online-image-editor.com//styles/2014/images/example_image.png" id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'">';
        }
    });
    $.squaresRegisterElement({
        name: "Video",
        iconClass: "fa fa-video-camera",
        controls: {
            video: {
                mp4_url: {
                    name: 'MP4 URL',
                    type: 'text',
                    default: 'http://html5demos.com/assets/dizzy.mp4'
                },
                webm_url: {
                    name: 'WEBM URL',
                    type: 'text',
                    default: 'http://html5demos.com/assets/dizzy.webm'
                },
                ogg_url: {
                    name: 'OGG URL',
                    type: 'text',
                    default: 'http://html5demos.com/assets/dizzy.ogg'
                },
                video_is_a_link: {
                    name: 'Video is a Link',
                    type: 'checkbox',
                    default: 0
                },
                link_to: {
                    name: 'Link to',
                    type: 'text',
                    default: '#'
                }
            }
        },
        content: function() {
            return '<video autoplay id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'"><source src="http://html5demos.com/assets/dizzy.mp4" type="video/mp4"><source src="http://html5demos.com/assets/dizzy.webm" type="video/webm"><source src="http://html5demos.com/assets/dizzy.ogg" type="video/ogg"></video>';
        }
    });
    $.squaresRegisterElement({
        name: "YouTube",
        iconClass: "fa fa-youtube",
        controls: {
            youtube: {
                embed_code: {
                    name: 'Embed Code',
                    type: 'textarea',
                    default: '<iframe width="560" height="315" src="https://www.youtube.com/embed/IstWciF_aW0" frameborder="0" allowfullscreen></iframe>'
                },
                allow_fullscreen: {
                    name: 'Allow Fullscreen',
                    type: 'checkbox',
                    default: 1
                },
            }
        },
        content: function() {
            // use the same width/height as the element
            return '<iframe id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'" width="560" height="315" src="https://www.youtube.com/embed/IstWciF_aW0" frameborder="0" allowfullscreen></iframe>';
        }
    });
    $.squaresRegisterElement({
        name: "Button",
        iconClass: "fa fa-hand-pointer-o",
        controls: {
            button: {
                text: {
                    name: 'Text',
                    type: 'text',
                    default: 'Button'
                },
                link_to: {
                    name: 'Link to',
                    type: 'text',
                    default: '#'
                },
            }
        },
        content: function() {
            return '<input type="button" value="'+ this.controls.button.text.getVal() +'" id="'+ this.id +'" style="'+ this.styles +'" class="'+ this.classes +'">';
        }
    });
})(jQuery, window, document);
