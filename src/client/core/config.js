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
            uploads : '/uploads/',
            filters : [
                {label: 'All', value: 'all'},
                {label: 'Referrer', value: 'referrer'},
                {label: 'Name', value: 'name'},
                {label: 'ID', value: 'id'},
                {label: 'Reference Number', value: 'reference_number'},
                {label: 'Batch Number', value: 'batch_number'}
            ]
        };
    }
})();