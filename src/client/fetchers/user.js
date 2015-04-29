(function () {
    'use strict';
    angular
        .module('fetchers.user', [])
        .service('userService', user);
    //@ngInject
    function user ($http, rest, helpers) {
        var request;

        return {
            user: 0,
            login : login
        };

        function login (data) {
            request = $http({
                method: 'POST',
                url: '/login',
                headers: rest.custom_headers,
                data : helpers.serialize(data)
            });
            return( request.then( rest.handle_success, rest.handle_error ) );
        }
    }
})();