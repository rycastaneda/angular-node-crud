(function() {
    'use strict';

    angular
        .module('app.login', [])
        .config(config)
        .controller('Login', Login);

    function config( $stateProvider ) {
        $stateProvider.state( 'login', {
            url: '/login',
            views: {
                "main": {
                    controller: 'Login',
                    controllerAs: 'vm',
                    templateUrl: 'login/template.tpl.html'
                }
            }
        });
    }
    config.$inject = ["$stateProvider"];

    //@ngInject;
    function Login ($state, $scope, $rootScope, growl, userService, helpers) {
        var vm = this;
        vm.submit_login = submit_login;
        vm.data = {
            username : '',
            password : '',
            stay : false
        };

        function submit_login () {
            vm.login_loading = userService.login(vm.data).then(function (user) {
                $scope.$emit('logged', user.id);
                userService.user = user;
                $state.go('home');
            }, function (data) {
                growl.error(data);
            });
        }
    }
})();