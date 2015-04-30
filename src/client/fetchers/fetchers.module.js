(function () {
    'use strict';
    angular
        .module('fetchers', [
            'fetchers.github',
            'fetchers.receipt',
            'fetchers.user'
        ])
        .service('rest', config);

    //@ngInject
    function config ($q) {
        return {
            custom_headers : {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            api_base : '/api',
            handle_error : handle_error,
            handle_success : handle_success,
        };

        function handle_error ( response ) {
            if (!angular.isObject( response.data ) || !response.data.message) {
                return( $q.reject( 'An unknown error occurred.' ) );
            }

            return( $q.reject( response.data ) );
        }

        function handle_success ( res ) {
            return( res.data );
        }
    }


})();