(function () {
    'use strict';
    angular
        .module('app')
        .filter('offset', filter);

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

})();

