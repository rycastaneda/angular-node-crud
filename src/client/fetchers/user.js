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
            get_current_user : get_current_user,
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

        function get_current_user () {
            request = $http({
                method: 'GET',
                url: rest.api_base + '/user',
                headers: rest.custom_headers
            });
            return( request.then( rest.handle_success, rest.handle_error ) );
        }
    }
})();