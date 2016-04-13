// Squares
// Description: Interactive and embeddable HTML content builder.
// Author: Nikolay Dyankov
// License: MIT

;(function ($, window, document, undefined) {
    $.squaresRegisterControl({
        type: 'int',
        getValue: function() {
            return parseInt($('#' + this.elementID).val(), 10);
        },
        setValue: function(v) {
            var newVal = parseInt(v, 10);
            $('#' + this.elementID).val(newVal);
        },
        HTML: function() {
            return '<input type="text" id="'+ this.elementID +'">';
        },
        events: function() {
            var self = this;
            $(document).on('change', '#' + this.elementID, function() {
                self.value = self.validate(this.val);
            });
        }
    });
    $.squaresRegisterControl({
        type: 'float',
        getValue: function() {
            return parseInt($('#' + this.elementID).val(), 10);
        },
        setValue: function(v) {
            var newVal = parseInt(v, 10);
            $('#' + this.elementID).val(newVal);
        },
        HTML: function() {
            return '<input type="text" id="'+ this.elementID +'">';
        }
    });
    $.squaresRegisterControl({
        type: 'text',
        getValue: function() {
            return parseInt($('#' + this.elementID).val(), 10);
        },
        setValue: function(v) {
            var newVal = parseInt(v, 10);
            $('#' + this.elementID).val(newVal);
        },
        HTML: function() {
            return '<input type="text" id="'+ this.elementID +'">';
        }
    });
    $.squaresRegisterControl({
        type: 'checkbox',
        getValue: function() {
            return parseInt($('#' + this.elementID).val(), 10);
        },
        setValue: function(v) {
            var newVal = parseInt(v, 10);
            $('#' + this.elementID).val(newVal);
        },
        HTML: function() {
            return '<input type="checkbox" id="'+ this.elementID +'">';
        }
    });
    $.squaresRegisterControl({
        type: 'color',
        getValue: function() {
            return parseInt($('#' + this.elementID).val(), 10);
        },
        setValue: function(v) {
            var newVal = parseInt(v, 10);
            $('#' + this.elementID).val(newVal);
        },
        HTML: function() {
            return '<input type="color" id="'+ this.elementID +'">';
        }
    });
    $.squaresRegisterControl({
        type: 'select',
        getValue: function() {
            return parseInt($('#' + this.elementID).val(), 10);
        },
        setValue: function(v) {
            var newVal = parseInt(v, 10);
            $('#' + this.elementID).val(newVal);
        },
        HTML: function() {
            var html = '';

            html += '<select id="'+ this.elementID +'">';
        }
    });
    $.squaresRegisterControl({
        type: 'box model',
        getValue: function() {
            return parseInt($('#' + this.elementID).val(), 10);
        },
        setValue: function(v) {
            var newVal = parseInt(v, 10);
            $('#' + this.elementID).val(newVal);
        },
        HTML: function() {
            // console.log(self);
            return 'test';
        }
    });
})(jQuery, window, document);
