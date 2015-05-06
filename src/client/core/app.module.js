(function () {
    'use strict';
    angular
        .module('app', [
            'ui.router',
            'ui.bootstrap',
            'angularMoment',
            'cgBusy',
            'angular-growl',
            'ngAnimate',
            'ngFileUpload',
            'blocks',
            'fetchers',
            'app.layout',
            'app.home',
            'app.login',
        ]);


})();