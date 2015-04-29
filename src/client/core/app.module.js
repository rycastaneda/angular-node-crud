(function () {
    'use strict';
    angular
        .module('app', [
            'ui.router',
            'ui.bootstrap',
            'angularMoment',
            'cgBusy',
            'angular-growl',
            'blocks',
            'fetchers',
            'app.layout',
            'app.home',
            'app.login',
        ]);


})();