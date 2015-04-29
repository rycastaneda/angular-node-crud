(function () {
    'use strict';

    angular
        .module('app')
        .service('helpers', helpers);

    function helpers () {
        return {
            serialize : serialize
        };

        function serialize (obj) {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p) && obj[p]) {
                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                }
            }
            return str.join('&');
        }
    }
})();