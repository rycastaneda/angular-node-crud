(function () {
    'use strict';
    angular
        .module('app')
        .filter('offset', filter)
        .filter('capitalize', capitalize);

    //@ngInject
    function filter($q) {
        return function (input, start) {
            if (input) {
                start = parseInt(start, 10);
                return input.slice(start);
            }

            return;
        };
    }

    function capitalize() {
        return function(input, char) {
            if (isNaN(input)) {
                char = char - 1 || 0;
                var letter = input.charAt(char).toUpperCase(), out = [];

                for (var i = 0; i < input.length; i++) {
                    if (i == char) {
                        out.push(letter);
                    } else {
                        out.push(input[i]);
                    }
                }

                return out.join('');

            } else {
                return input;
            }
        };
    }

})();

