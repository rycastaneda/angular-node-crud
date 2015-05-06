(function () {
    'use strict';

    angular
        .module('app.home')
        .directive('receiptViewer', directive);

    function directive () {

        return  {
            restrict: 'E',
            scope: {receipt : '=', mode: '@', success: '&'},
            template: '<button class="pull-right btn btn-primary" ng-click="open_receipt(mode, receipt)">{{capitalize(mode)}} </button>',
            controllerAs: 'vm',
            controller: receipts
        };

        //@ngInject
        function receipts($scope, $modal, $state, growl, moment, receiptService, userService, config, $filter) {
            /*jshint validthis: true */
            var date = moment(),
                today = date.format('YYYY-MM-DD');

            $scope.config = config;
            $scope.capitalize = $filter('capitalize');
            $scope.open_receipt = open_receipt;

            function open_receipt() {
                var modalInstance = $modal.open({
                    controller: receipt_controller,
                    templateUrl: 'home/receipt.tpl.html',
                    resolve: {
                        mode: function () {
                            return $scope.mode;
                        },
                        receipt: function () {
                            return $scope.receipt;
                        }
                    }
                });

                modalInstance.result.then($scope.success);
            }

            //@ngInject
            function receipt_controller($scope, $modalInstance, Upload, mode, receipt, config) {
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
                    photo: null,
                    user_id: userService.user
                };
                $scope.config = config;
                $scope.fileReaderSupported = window.FileReader !== null && (window.FileAPI === null);

                if (mode === 'update') {
                    var receipt_copy = angular.copy(receipt);
                    $scope.data = receipt_copy;
                    $scope.data.time = moment(receipt_copy.date).toDate();
                    $scope.data.date = moment(receipt_copy.date).format('YYYY-MM-DD');
                }

                $scope.share_amount_disabled = true;
                $scope.max_date = moment(new Date()).format('YYYY-MM-DD');
                $scope.mode = mode;


                $scope.save_receipt = save_receipt;
                $scope.close = close;
                $scope.open = open;
                $scope.is_string = is_string;
                $scope.share_changed = share_changed;

                function share_changed() {
                    switch ($scope.data.share_type) {
                    case 'Solo':
                        $scope.data.share_amount = 1;
                        $scope.share_amount_disabled = true;
                        $scope.max_share_amount = 1;
                        break;
                    case 'Fast Track':
                        $scope.data.share_amount = 1;
                        $scope.share_amount_disabled = false;
                        $scope.max_share_amount = 10;
                        break;
                    case 'Patak Patak':
                        $scope.data.share_amount = 1;
                        $scope.max_share_amount = 35;
                        $scope.share_amount_disabled = false;
                        break;
                    }
                }

                function open($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                }

                function close() {
                    $modalInstance.dismiss('cancel');
                }

                function is_string(data) {
                    return typeof data === 'string';
                }

                $scope.generateThumb = function (file) {
                    if (file !== null) {
                        if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                            $timeout(function () {
                                var fileReader = new FileReader();
                                fileReader.readAsDataURL(file);
                                fileReader.onload = function (e) {
                                    $timeout(function () {
                                        file.dataUrl = e.target.result;
                                        $scope.show_thumb = true;
                                    });
                                };
                            });
                        }
                    }
                };

                function save_receipt(files) {
                    var m = moment($scope.data.date);
                    m.minute($scope.data.time.getMinutes());
                    m.hours($scope.data.time.getHours());

                    $scope.data.date = +m;
                    if (!$scope.data.photo) {
                        return growl.error('Please select a photo of receipt.', {referenceId : 'modal'});
                    }

                    if (mode == 'add') {
                        $scope.saving = receiptService.add_receipt($scope.data).success(function (data) {
                            growl.success(data.message);
                            $modalInstance.close('success');
                        }).error(function (data) {
                            growl.error(data.message, {referenceId : 'modal'});
                        });
                    }
                    else {
                        $scope.saving = receiptService.update_receipt($scope.data).success(function (data) {
                            growl.success(data.message);
                            $modalInstance.close('success');
                        }).error(function (data) {
                            growl.error(data.message, {referenceId : 'modal'});
                        });
                    }
                }

            }

        }
    }
})();

