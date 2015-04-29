(function() {
    'use strict';

    angular
        .module('app.home', [])
        .config(config)
        .controller('home', home);

    function config( $stateProvider ) {
        $stateProvider.state( 'home', {
            url: '/',
            views: {
                "main": {
                    controller: 'home',
                    controllerAs: 'vm',
                    templateUrl: 'home/template.tpl.html'
                }
            }
        });
    }
    config.$inject = ["$stateProvider"];

    //@ngInject
    function home ($modal, $state, growl, moment, receiptService, userService) {
        /*jshint validthis: true */
        var date = moment(),
            vm = this;

        vm.add_form = false;

        vm.current_page = 1;
        vm.search_cat = false;
        vm.filters =  ['All', 'Referrer', 'Name', 'ID'];
        vm.filter = vm.filters[0];
        vm.receipts = [];
        vm.max_date = date.format('YYYY-MM-DD');
        vm.start_date = date.format('YYYY-MM-DD');
        vm.end_date = date.add(1, 'days').format('YYYY-MM-DD');

        vm.open_start = open_start;
        vm.open_end = open_end;
        vm.date_changed = date_changed;
        vm.get_receipts = get_receipts;
        vm.open_receipt = open_receipt;

        function open_start ($event) {
           $event.preventDefault();
           $event.stopPropagation();
           vm.opened_start = true;
        }

        function open_end ($event) {
           $event.preventDefault();
           $event.stopPropagation();
           vm.opened_end = true;
        }

        function date_changed () {
            return get_receipts(null, 'date', vm.start_date, vm.end_date);
        }

        function get_receipts (q, category, start_date, end_date) {
            vm.receipts = [];

            vm.getting = receiptService.get_receipts({
                q: q,
                category: (category==='All') ? '' : category.toLowerCase(),
                page: vm.current_page,
                start_date: start_date,
                end_date: end_date
            }).then(function (data) {
                data.forEach(function(e){
                    e.date = new Date(e.date);
                });
                vm.receipts = data;

            }, function (data) {
                if(data.err === 'NO_DATA') {
                    vm.receipts = [];
                }
                growl.error(data.message);
            });
        }

        function open_receipt (mode, receipt) {
            var modalInstance = $modal.open({
                controller: receipt_controller,
                templateUrl: 'home/receipt.tpl.html',
                resolve : {
                    mode : function () {
                        return mode;
                    },
                    receipt : function () {
                        return receipt;
                    }
                }
            });

            modalInstance.result.then(function () {
                get_receipts(null, 'date', vm.start_date, vm.end_date);
            });
        }

        //@ngInject
        function receipt_controller ($scope, $modalInstance, mode, receipt) {
            $scope.data = {
                name: '',
                share_type: 'Solo',
                share_amount: 1,
                amount: 1,
                bank: '',
                date: moment(new Date()).format('YYYY-MM-DD'),
                time: new Date(),
                reference_number: '',
                referrer: '',
                user_id: userService.user
            };

            if (mode === 'update') {
                // var receipt_date = moment(angular.copy(receipt.date));
                var receipt = angular.copy(receipt);
                $scope.data = receipt;
                $scope.data.time = moment(receipt.date).toDate();
                $scope.data.date = moment(receipt.date).format('YYYY-MM-DD');
                console.log("$scope.data",$scope.data);
                console.log("receipt",receipt);
            }

            $scope.share_amount_disabled = true;
            $scope.max_date = moment(new Date()).format('YYYY-MM-DD');
            $scope.mode = mode;

            console.log("mode",mode);

            $scope.save_receipt = save_receipt;
            $scope.close = close;
            $scope.open = open;
            $scope.share_changed = share_changed;

            function share_changed () {
                switch($scope.data.share_type) {
                    case 'Solo' :
                        $scope.data.share_amount = 1;
                        $scope.share_amount_disabled = true;
                        break;
                    case 'Fast Track' :
                        $scope.data.share_amount = 1;
                        $scope.share_amount_disabled = false;
                        break;
                    case 'Patak Patak' :
                        $scope.data.share_amount = 1;
                        $scope.share_amount_disabled = true;
                        break;
                }
            }

            function open ($event) {
               $event.preventDefault();
               $event.stopPropagation();
               $scope.opened = true;
            }

            function close () {
                $modalInstance.dismiss('cancel');
            }

            function save_receipt() {

                var m = moment($scope.data.date);
                m.minute($scope.data.time.getMinutes());
                m.hours($scope.data.time.getHours());

                $scope.data.date = +m;


                if(mode == 'add') {
                    $scope.saving = receiptService.add_receipt($scope.data).then(function (data) {
                        growl.success(data.message);
                        $modalInstance.close('success');
                    }, function (data) {
                        $modalInstance.close('error');
                        growl.error(data.message);
                    });
                } else {
                    $scope.saving = receiptService.update_receipt($scope.data).then(function (data) {
                        growl.success(data.message);
                        $modalInstance.close('success');
                    }, function (data) {
                        $modalInstance.close('error');
                        growl.error(data.message);
                    });
                }
            }

        }

        get_receipts(null, 'date', vm.start_date, vm.end_date);

    }
})();