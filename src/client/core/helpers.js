(function () {
    'use strict';

    angular
        .module('app')
        .service('helpers', helpers);

    function helpers () {
        return {
            extend : extend,
            serialize : serialize

        };

        function extend (obj, source) {
            var prop;

            for (prop in source) {
                if (source.hasOwnProperty(prop)) {
                   obj[prop] = source[prop];
                }
            }

            return obj;
        }

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