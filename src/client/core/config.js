(function () {
    'use strict';

    var cgBusyDefaults =  {
            backdrop: true,
            templateUrl: 'layout/loader.tpl.html',
            delay: 0,
            minDuration: 0
        };

    angular
        .module('app')
        .value('cgBusyDefaults', cgBusyDefaults)
        .service('config', config);

    //@ngInject
    function config () {
        return {
            uploads : '/uploads/'
        };
    }
})();