(function ($, window) {

    function _generateRandomColorString() {
        return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
    }
    
    function padZero(s) {
        s = s.toString();
        if (s.length == 1) {
            return "0" + s;
        }
        return s;
    }
    
    function _decodeHtml(html) {
        return $("<div/>").html(html).text();
    }

    function _encodeHtml(html) {
        return $("<div/>").text(html).html();
    }
    
    function _truncateString(theString, length, append) {
        append = append || '...';
    
        if (!theString || theString.length < length) {
            return theString;
        }
        
        return theString.substring(0, length) + append;
    }

    String.prototype.fromJsonDate = function () {
        return eval(this.replace(/\/Date\((\d+)(\+|\-)?.*\)\//gi, "new Date($1)"));
    };

    Date.prototype.formatDate = function () {
        var m = this.getMonth() + 1,
            d = this.getDate(),
            y = this.getFullYear();

        return m + "/" + d + "/" + y;
    };

    Date.prototype.formatTime = function (showAp) {
        var ap = "";
        var hr = this.getHours();

        if (hr < 12) {
            ap = "AM";
        }
        else {
            ap = "PM";
        }

        if (hr == 0) {
            hr = 12;
        }

        if (hr > 12) {
            hr = hr - 12;
        }

        var mins = padZero(this.getMinutes());
        var seconds = padZero(this.getSeconds());
        return hr + ":" + mins + ":" + seconds
            + (showAp ? " " + ap : "");
    };

    // returns the date portion only (strips time)
    Date.prototype.toDate = function () {
        return new Date(this.getFullYear(), this.getMonth(), this.getDate());
    };
    
    var utils = {
        generateRandomColor: _generateRandomColorString,
        encodeHtml: _encodeHtml,
        decodeHtml: _decodeHtml,
        truncateString: _truncateString
    };

    if (!window.beckysbrain) {
        window.beckysbrain = {};
    }
    
    window.beckysbrain.utils = utils;
    
}(jQuery, window));