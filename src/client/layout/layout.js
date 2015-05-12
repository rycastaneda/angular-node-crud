(function() {
    'use strict';

    angular
        .module('app.layout', [])
        .controller('Shell', Shell);


    // @ngInject
    function Shell($timeout, $rootScope, $state, userService, helpers) {
        /*jshint validthis: true */
        var vm = this;
        vm.in = false;
        vm.showSplash = true;
        vm.show_growl = true;
        vm.user = userService.user;

        activate();

        $rootScope.$on('logged', function (event, data) {
            vm.user = data;
            vm.show_growl = false;
            get_user();
        });


        function activate() {
            hideSplash();
        }

        function hideSplash() {
            $timeout(function() {
                vm.showSplash = false;
                if(! user) {
                    return $state.go('login');
                }

                if(!$state.current.name) {
                    vm.user = user;
                    userService.user = user;
                    return $state.go('home');
                }
            }, 1000);
        }

        function get_user () {
            userService.get_current_user().then(function (data) {
                vm.user_data = data;
                console.log("vm.user_data",vm.user_data);
            }, function () {
                return $state.go('login');
            });
        }

        if (user) {
            get_user();
        }
    }
})();