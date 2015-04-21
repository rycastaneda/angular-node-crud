(function() {
    'use strict';

    angular
        .module('app.layout', [])
        .controller('Shell', Shell);


    // ngInject
    function Shell($timeout, $state) {
        /*jshint validthis: true */
        var vm = this;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        vm.showSplash = true;
        console.log("vm.busyMessage",vm.busyMessage);
        activate();

        function activate() {
            // logger.success(' loaded!', null);
//            Using a resolver on all routes or dataservice.ready in every controller
//            dataservice.ready().then(function(){
//                hideSplash();
//            });
            hideSplash();
        }

        function hideSplash() {
            //Force a 1 second delay so we can see the splash.
            $timeout(function() {
                vm.showSplash = false;

                if(! user) {
                    $state.go('login');
                }
            }, 1000);
        }


    }
})();