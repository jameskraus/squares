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
            $('#' + this.elementID).val(parseInt(v, 10));
        },
        HTML: function() {
            return '<input type="text" id="'+ this.elementID +'">';
        },
        init: function() {
            var self = this;
            $(document).on('change', '#' + this.elementID, function() {
                self.valueChanged();
            });
        }
    });
    $.squaresRegisterControl({
        type: 'float',
        getValue: function() {
            return parseFloat($('#' + this.elementID).val());
        },
        setValue: function(v) {
            $('#' + this.elementID).val(parseFloat(v));
        },
        HTML: function() {
            return '<input type="text" id="'+ this.elementID +'">';
        },
        init: function() {
            var self = this;
            $(document).on('change', '#' + this.elementID, function() {
                self.valueChanged();
            });
        }
    });
    $.squaresRegisterControl({
        type: 'text',
        getValue: function() {
            return $('#' + this.elementID).val();
        },
        setValue: function(v) {
            $('#' + this.elementID).val(v);
        },
        HTML: function() {
            return '<input type="text" id="'+ this.elementID +'">';
        },
        init: function() {
            var self = this;
            $(document).on('change', '#' + this.elementID, function() {
                self.valueChanged();
            });
        }
    });
    $.squaresRegisterControl({
        type: 'checkbox',
        getValue: function() {
            if ($('#' + this.elementID).get(0).checked == true) {
                return 1;
            } else {
                return 0;
            }
        },
        setValue: function(v) {
            if (parseInt(v, 10) === 1) {
                $('#' + this.elementID).get(0).checked = true;
            } else {
                $('#' + this.elementID).get(0).checked = false;
            }
        },
        HTML: function() {
            return '<input type="checkbox" id="'+ this.elementID +'">';
        },
        init: function() {
            var self = this;
            $(document).on('change', '#' + this.elementID, function() {
                self.valueChanged();
            });
        }
    });
    $.squaresRegisterControl({
        type: 'color',
        getValue: function() {
            return $('#' + this.elementID).val();
        },
        setValue: function(v) {
            $('#' + this.elementID).val(v);
        },
        HTML: function() {
            return '<input type="color" id="'+ this.elementID +'">';
        },
        init: function() {
            var self = this;
            $(document).on('change', '#' + this.elementID, function() {
                self.valueChanged();
            });
        }
    });
    $.squaresRegisterControl({
        type: 'select',
        getValue: function() {
            return $('#' + this.elementID).val();
        },
        setValue: function(v) {
            $('#' + this.elementID).val(v);
        },
        HTML: function() {
            var html = '';

            html += '<select id="'+ this.elementID +'">';

            for (var i=0; i<this.options.length; i++) {
                html += '<option value="'+ this.options[i] +'">'+ this.options[i] +'</option>';
            }

            html += '</select>';

            return html;
        },
        init: function() {
            var self = this;
            $(document).on('change', '#' + this.elementID, function() {
                self.valueChanged();
            });
        }
    });
    $.squaresRegisterControl({
        type: 'box model',
        getValue: function() {
            return {
                margin: {
                    top: parseInt($('#squares-element-option-boxmodel-margin-top').val(), 10),
                    bottom: parseInt($('#squares-element-option-boxmodel-margin-bottom').val(), 10),
                    left: parseInt($('#squares-element-option-boxmodel-margin-left').val(), 10),
                    right: parseInt($('#squares-element-option-boxmodel-margin-right').val(), 10)
                },
                padding: {
                    top: parseInt($('#squares-element-option-boxmodel-padding-top').val(), 10),
                    bottom: parseInt($('#squares-element-option-boxmodel-padding-bottom').val(), 10),
                    left: parseInt($('#squares-element-option-boxmodel-padding-left').val(), 10),
                    right: parseInt($('#squares-element-option-boxmodel-padding-right').val(), 10)
                }
            }
        },
        setValue: function(v) {
            $('#squares-element-option-boxmodel-margin-top').val(this._value.margin.top);
            $('#squares-element-option-boxmodel-margin-bottom').val(this._value.margin.bottom);
            $('#squares-element-option-boxmodel-margin-left').val(this._value.margin.left);
            $('#squares-element-option-boxmodel-margin-right').val(this._value.margin.right);

            $('#squares-element-option-boxmodel-padding-top').val(this._value.padding.top);
            $('#squares-element-option-boxmodel-padding-bottom').val(this._value.padding.bottom);
            $('#squares-element-option-boxmodel-padding-left').val(this._value.padding.left);
            $('#squares-element-option-boxmodel-padding-right').val(this._value.padding.right);
        },
        HTML: function() {
            var html = '';

            html += '<div class="sq-boxmodel-margin" id="'+ this.elementID +'">';
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

            return html;
        },
        init: function() {
            var self = this;
            $(document).on('change', '#' + this.elementID + ' input', function() {
                self.valueChanged();
            });
        }
    });
    $.squaresRegisterControl({
        type: 'slider',
        getValue: function() {
            var v = 0;

            // Get the ball position
            var ball = $('#' + this.elementID).find('.sq-control-slider-ball');
            var ballPosition = ball.position().left;

            // Get the track width
            var track = $('#' + this.elementID).find('.sq-control-slider-track');
            var trackWidth = track.outerWidth();

            // Calculate value
            var progress = ballPosition / trackWidth;
            v = this.options.min + (this.options.max - this.options.min) * progress;

            return v;
        },
        setValue: function(v) {
            var progress = (v - this.options.min) / (this.options.max - this.options.min);

            var ball = $('#' + this.elementID).find('.sq-control-slider-ball');

            // Get the track width
            var track = $('#' + this.elementID).find('.sq-control-slider-track');
            var trackWidth = track.outerWidth();

            ball.css({
                left: trackWidth * progress
            });
        },
        HTML: function() {
            var html = '';

            html += '<div class="sq-control-slider" id="'+ this.elementID +'">';
            html += '   <div class="sq-control-slider-track"></div>';
            html += '   <div class="sq-control-slider-ball"></div>';
            html += '</div>';

            return html;
        },
        init: function() {
            var self = this;
            var ix = 0, iex = 0, dragging = false, ball = undefined, track = undefined;

            // Ball dragging
            $(document).on('mousedown', '#' + self.elementID + ' .sq-control-slider-ball', function(e) {
                ball = $('#' + self.elementID).find('.sq-control-slider-ball');
                track = $('#' + self.elementID).find('.sq-control-slider-track');
                ix = ball.position().left;
                iex = e.pageX;

                dragging = true;
            });
            $(document).on('mousemove.' + this.elementID, function(e) {
                if (dragging) {
                    var o = ix - iex + e.pageX;

                    if (o < 0) o = 0;
                    if (o > track.outerWidth()) o = track.outerWidth();

                    ball.css({
                        left: o
                    });

                    self.valueChanged();
                }
            });
            $(document).on('mouseup.' + this.elementID, function(e) {
                if (dragging) {
                    dragging = false;
                    self.valueChanged();
                }
            });

            // Click on the track
            $(document).on('mousedown', '#' + self.elementID + ' .sq-control-slider-track', function(e) {
                ball = $('#' + self.elementID).find('.sq-control-slider-ball');
                track = $('#' + self.elementID).find('.sq-control-slider-track');

                // Set the ball to the mouse position
                var o = e.pageX - track.offset().left;

                if (o < 0) o = 0;
                if (o > track.outerWidth()) o = track.outerWidth();

                ball.css({
                    left: o
                });

                // Start dragging
                ix = ball.position().left;
                iex = e.pageX;

                dragging = true;
            });
        }
    });
})(jQuery, window, document);
