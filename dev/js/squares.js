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
    function Squares(host) {
        // "host" is the direct parent of the embedded editor
        this.host = $(host);

        this.init();
    }
    Squares.prototype.init = function () {
        // Save a reference in the host to the Editor
        this.host.data.editor = this;


    };
    Squares.prototype.redraw = function () {

    };

    // The "Container" class servs literally as a container
    // for Block objects, similar to Bootstrap's "row" class.
    // It will have settings only for layout.
    function Container() {

    }

    // The block object will represent a single piece of content.
    // Image, text, video, etc.
    // It will have settings for layout and styling
    function Block() {

    }
})(jQuery, window, document);
