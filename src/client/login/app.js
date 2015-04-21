(function() {
    'use strict';

    angular
        .module('app.login', [])
        .config(config)
        .controller('Login', Login);

    function config( $stateProvider ) {
        $stateProvider.state( 'login', {
            // abstract: true,
            url: '/login',
            views: {
                "main": {
                    controller: 'Login',
                    controllerAs: 'vm',
                    // templateUrl: 'src/client/login/template.tpl.html',
                    templateUrl: 'login/template.tpl.html'
                }
            }
        });
    }
    config.$inject = ["$stateProvider"];

    function Login () {
        var vm = this;

        vm.news = {
            title: 'Marvel Avengers',
            description: 'Marvel Avengers 2 is now in production!'
        };
        vm.avengerCount = 0;
        vm.avengers = [];
        vm.title = 'Login';

        console.log("vm.title",vm.title);
    }
})();