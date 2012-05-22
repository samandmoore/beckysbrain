(function ($, window) {

    function _generateRandomColorString() {
        return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
    }
    
    var utils = {
        generateRandomColor: _generateRandomColorString
    };

    if (!window.beckysbrain) {
        window.beckysbrain = {};
    }
    
    window.beckysbrain.utils = utils;
    
}(jQuery, window));