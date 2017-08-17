//From: https://raw.githubusercontent.com/jstrace/chart/master/index.js

/**
 * Module dependencies.
 */

//var matrix = require('array-matrix'); // https://github.com/segmentio/array-matrix/blob/master/index.js


function padding(str, n) {
    var linew = str.split('\n')[0].length;
    var line = new Array(linew).join(' ') + '\n';

    // y
    str = new Array(n).join(line) + str;
    str = str + new Array(n).join(line);

    // x
    str = str.replace(/^/gm, new Array(n).join(' '));
    return str;
}

/**
 * Convert matrix to a string.
 */

function string(out) {
    var buf = [];

    for (var i = 0; i < out.length; i++) {
        buf.push(out[i].join(''));
    }

    return buf.join('\n');
}

/**
 * Return max in array.
 */

function max(data) {
    var n = data[0];

    for (var i = 1; i < data.length; i++) {
        n = data[i] > n ? data[i] : n;
    }

    return n;
}

function matrix(x, y) { //var matrix = require('array-matrix'); // https://github.com/segmentio/array-matrix/blob/master/index.js
    var arr = new Array(y);

    for (var i = 0; i < y; i++) {
        arr[i] = new Array(x);
    }

    return arr;
}



/**
 * Return ascii chart of `data`.
 *
 * - `width` total chart width [130]
 * - `height` total chart height [30]
 * - `padding` edge padding [3]
 *
 * @param {Array} data
 * @param {Object} [opts]
 * @return {String}
 * @api public
 */
var chart = {
    chart: function(data, opts) {
        opts = opts || {};

        var x;

        // options
        var w = opts.width || 130;
        var h = opts.height || 30;

        // padding
        var pad = opts.padding || 3;
        w -= pad * 2;
        h -= pad * 2;

        // setup
        var out = matrix(w, h);
        var m = max(data) || 0;
        var label = Math.abs(m).toString();
        var labelw = label.length;
        var labelp = 1;

        // chart sizes void of padding etc
        var ch = h;
        var cw = w - labelw - labelp;

        // fill
        for (var y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                out[y][x] = ' ';
            }
        }

        // y-axis labels
        for (var i = 0; i < labelw; i++) {
            out[0][i] = label[i];
        }

        out[h - 1][labelw - labelp] = '0';

        // y-axis
        for (y = 0; y < h; y++) { //JSHINT : var already defined
            out[y][labelw + labelp] = '·';
        }

        // x-axis
        x = labelw + labelp; //JSHINT : var already defined
        while (x < w) {
            out[h - 1][x++] = '·';
            out[h - 1][x++] = ' ';
        }

        // strip excess from head
        // so that data may "roll"
        var space = Math.floor(w / 2) - 1;
        var excess = Math.max(0, data.length - space);
        if (excess) data = data.slice(excess);

        // plot data
        x = labelw + labelp + 2; //JSHINT : var already defined
        for (i = 0; i < data.length; i++) { //JSHINT : var already defined
            var d = data[i];
            var p = d / m;
            y = Math.round((h - 2) * p); //JSHINT : var already defined
            var c = y < 0 ? '¦' : '¦';
            if (y < 0) y = -y;

            while (y--) {
                out[Math.abs(y - h) - 2][x] = c;
            }

            x += 2;
        }

        return padding(string(out, h), pad);
    }

    /**
     * Apply padding.
     */



};
module.exports = chart;
