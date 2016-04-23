// Squares
// Description: Interactive and embeddable HTML content builder.
// Author: Nikolay Dyankov
// License: MIT

;(function ($, window, document, undefined) {
    // Register built-in elements using the public API
    $.squaresRegisterElement({
        name: "Paragraph",
        iconClass: "fa fa-paragraph",
        controls: {
            text: {
                text: {
                    name: 'Text',
                    type: 'textarea',
                    default: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.'
                }
            }
        },
        controlGroupIcons: {
            text: 'fa fa-ellipsis-h'
        },
        content: function() {
            return '<p id="'+ this.controls.general.id.getVal() +'" style="'+ this.controls.general.css.getVal() +'" class="'+ this.controls.general.classes.getVal() +'">'+ this.controls.text.text.getVal() +'</p>';
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
        controlGroupIcons: {
            heading: 'fa fa-header'
        },
        content: function() {
            return '<'+ this.controls['heading']['heading'].getVal() +' id="'+ this.controls['general']['id'].getVal() +'" style="'+ this.controls['general']['css'].getVal() +'" class="'+ this.controls['general']['classes'].getVal() +'">'+ this.controls.heading.text.getVal() +'</'+ this.controls['heading']['heading'].getVal() +'>';
        }
    });
    $.squaresRegisterElement({
        name: "Image",
        iconClass: "fa fa-camera",
        controls: {
            image: {
                url: {
                    name: 'Image URL',
                    type: 'text',
                    default: 'http://www.online-image-editor.com//styles/2014/images/example_image.png'
                },
                image_is_a_link: {
                    name: 'Image is a Link',
                    type: 'switch',
                    default: 0
                },
                link_to: {
                    name: 'Link to',
                    type: 'text',
                    default: '#'
                }
            }
        },
        controlGroupIcons: {
            image: 'fa fa-camera'
        },
        content: function() {
            var html = '';

            if (parseInt(this.controls.image.image_is_a_link.getVal(), 10) == 1) {
                html += '<a href="'+ this.controls.image.link_to.getVal() +'">';
            }

            html += '<img src="'+ this.controls.image.url.getVal() +'" id="'+ this.controls.general.id.getVal() +'" style="'+ this.controls.general.css.getVal() +'" class="'+ this.controls.general.classes.getVal() +'">';

            if (parseInt(this.controls.image.image_is_a_link.getVal(), 10) == 1) {
                html += '</a>';
            }

            return html;
        }
    });
    $.squaresRegisterElement({
        name: "Video",
        iconClass: "fa fa-video-camera",
        useFontControls: false,
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
                    type: 'switch',
                    default: 0
                },
                link_to: {
                    name: 'Link to',
                    type: 'text',
                    default: '#'
                }
            }
        },
        controlGroupIcons: {
            video: 'fa fa-video-camera'
        },
        content: function() {
            var html = '';

            if (parseInt(this.controls.video.video_is_a_link.getVal(), 10) == 1) {
                html += '<a href="'+ this.controls.video.link_to.getVal() +'">';
            }

            html += '<video autoplay id="'+ this.controls.general.id.getVal() +'" style="'+ this.controls.general.css.getVal() +'" class="'+ this.controls.general.classes.getVal() +'"><source src="'+ this.controls.video.mp4_url.getVal() +'" type="video/mp4"><source src="'+ this.controls.video.webm_url.getVal() +'" type="video/webm"><source src="'+ this.controls.video.ogg_url.getVal() +'" type="video/ogg"></video>';

            if (parseInt(this.controls.video.video_is_a_link.getVal(), 10) == 1) {
                html += '</a>';
            }

            return html;
        }
    });
    $.squaresRegisterElement({
        name: "YouTube",
        iconClass: "fa fa-youtube",
        useStyleControls: false,
        useFontControls: false,
        controls: {
            youtube: {
                embed_code: {
                    name: 'Embed Code',
                    type: 'textarea',
                    default: '<iframe width="560" height="315" src="https://www.youtube.com/embed/IstWciF_aW0" frameborder="0" allowfullscreen></iframe>'
                },
                allow_fullscreen: {
                    name: 'Allow Fullscreen',
                    type: 'switch',
                    default: 1
                },
            }
        },
        controlGroupIcons: {
            youtube: 'fa fa-youtube'
        },
        content: function() {
            // to do:
            // get the embed code from the controls, wrap it in a div, apply ID, CSS and classes to the DIV and set the iframe to 100% width and height
            // also implement the "allow fullscreen" option

            var embedCode = this.controls.youtube.embed_code.getVal();
            var html = '';

            html += '<div id="'+ this.controls.general.id.getVal() +'" style="'+ this.controls.general.css.getVal() +'" class="'+ this.controls.general.classes.getVal() +'">';

            // Allow fullscreen

            // Set width/height

            html += embedCode;

            html += '</div>';

            return html;
        }
    });
    $.squaresRegisterElement({
        name: "Button",
        iconClass: "fa fa-link",
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
        controlGroupIcons: {
            button: 'fa fa-link'
        },
        content: function() {
            return '<a href="'+ this.controls.button.link_to.getVal() +'"><input type="button" value="'+ this.controls.button.text.getVal() +'" id="'+ this.controls.general.id.getVal() +'" style="'+ this.controls.general.css.getVal() +'" class="'+ this.controls.general.classes.getVal() +'"></a>';
        }
    });
})(jQuery, window, document);
