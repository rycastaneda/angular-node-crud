(function () {
    'use strict';

    angular
        .module('app.home', [])
        .config(config)
        .controller('home', home);

    function config($stateProvider) {
        $stateProvider.state('home', {
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
    function home($modal, $state, growl, moment, receiptService, userService, config) {
        /*jshint validthis: true */
        var date = moment(),
            init = 0,
            today = date.format('YYYY-MM-DD'),
            vm = this;

        vm.config = config;
        vm.current_page = 1;
        vm.search_cat = false;
        vm.filters = ['All', 'Referrer', 'Name', 'ID'];
        vm.filter = vm.filters[0];
        vm.receipts = [];
        vm.max_date = date.format('YYYY-MM-DD');
        vm.start_date = date.format('YYYY-MM-DD');
        vm.end_date = date.add(1, 'days').format('YYYY-MM-DD');

        vm.open_start = open_start;
        vm.open_end = open_end;
        vm.date_changed = date_changed;
        vm.get_receipts = get_receipts;
        vm.delete_receipt = delete_receipt;
        vm.open_receipt = open_receipt;
        vm.to_csv = to_csv;

        console.log("vm.config", vm.config);

        function open_start($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened_start = true;
        }

        function open_end($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened_end = true;
        }

        function date_changed() {
            if (today === moment(vm.start_date).format('YYYY-MM-DD')) {
                return;
            }

            return get_receipts(null, 'date', moment(vm.start_date).format('YYYY-MM-DD'), moment(vm.end_date)
                .format('YYYY-MM-DD'));
        }

        function get_receipts(q, category, start_date, end_date) {
            vm.receipts = [];

            vm.getting = receiptService.get_receipts({
                q: q,
                category: (category === 'All') ? '' : category.toLowerCase(),
                page: vm.current_page,
                start_date: start_date,
                end_date: end_date
            }).then(function (data) {
                data.forEach(function (e) {
                    e.date = new Date(e.date);
                });
                vm.receipts = data;
                console.log("vm.receipts", vm.receipts);

            }, function (data) {
                if (data.err === 'NO_DATA') {
                    vm.receipts = [];
                    return;
                }
                growl.error(data.message);
            });
        }

        function delete_receipt(id, idx) {
            vm.getting = receiptService.delete_receipt(id).then(function (data) {
                growl.success(data.message);
                vm.receipts.splice(idx, 1);
            }, function (data) {
                growl.error(data.message);
            });
        }

        function open_receipt(mode, receipt) {
            var modalInstance = $modal.open({
                controller: receipt_controller,
                templateUrl: 'home/receipt.tpl.html',
                resolve: {
                    mode: function () {
                        return mode;
                    },
                    receipt: function () {
                        return receipt;
                    }
                }
            });

            modalInstance.result.then(function () {
                get_receipts(null, 'date', vm.start_date, vm.end_date);
            });
        }

        function to_csv() {
            if (!vm.receipts) {
                return;
            }
            var csvContent = "data:text/csv;charset=utf-8,",
                receipts_csv = angular.copy(vm.receipts),
                encodedUri, link;

            delete receipts_csv[0].photo;

            csvContent += Object.keys(receipts_csv[0]).join(',') + ',\r\n';
            receipts_csv.forEach(function (e) {
                e.date = moment(e.date).format('YYYY-MM-DD');
                delete e.photo;
            });


            csvContent += ConvertToCSV(receipts_csv);
            encodedUri = encodeURI(csvContent);
            link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "my_data.csv");
            link.click();
        }

        function ConvertToCSV(objArray) {
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var str = '';

            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var index in array[i]) {
                    if (line !== '') line += ',';

                    line += array[i][index];
                }

                str += line + '\r\n';
            }

            return str;
        }

        //@ngInject
        function receipt_controller($scope, $modalInstance, Upload, mode, receipt, config) {
            $scope.data = {
                name: 'test',
                share_type: 'Solo',
                share_amount: 1,
                amount: 1,
                bank: 'test',
                date: moment(new Date()).format('YYYY-MM-DD'),
                time: new Date(),
                reference_number: 'test',
                referrer: 'test',
                photo: null,
                user_id: userService.user
            };
            $scope.config = config;
            $scope.fileReaderSupported = window.FileReader !== null && (window.FileAPI === null);

            if (mode === 'update') {
                // var receipt_date = moment(angular.copy(receipt.date));
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
                    break;
                case 'Fast Track':
                    $scope.data.share_amount = 1;
                    $scope.share_amount_disabled = false;
                    break;
                case 'Patak Patak':
                    $scope.data.share_amount = 1;
                    $scope.share_amount_disabled = true;
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
                console.log("file", file);
                if (file !== null) {
                    if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                        $timeout(function () {
                            var fileReader = new FileReader();
                            fileReader.readAsDataURL(file);
                            fileReader.onload = function (e) {
                                $timeout(function () {
                                    file.dataUrl = e.target.result;
                                    $scope.show_thumb = true;
                                    console.log("$scope.show_thumb", $scope.show_thumb);
                                    console.log("file.dataUrl", file.dataUrl);
                                });
                            }
                        });
                    }
                }
            };

            function save_receipt(files) {
                var m = moment($scope.data.date);
                m.minute($scope.data.time.getMinutes());
                m.hours($scope.data.time.getHours());

                $scope.data.date = +m;

                console.log("$scope.data", $scope.data);

                if (mode == 'add') {
                    $scope.saving = receiptService.add_receipt($scope.data).success(function (data) {
                        growl.success(data.message);
                        $modalInstance.close('success');
                    }).error(function (data) {
                        growl.error(data.message);
                    });
                }
                else {
                    $scope.saving = receiptService.update_receipt($scope.data).success(function (data) {
                        growl.success(data.message);
                        $modalInstance.close('success');
                    }).error(function (data) {
                        growl.error(data.message);
                    });
                }
            }

        }

        get_receipts(null, 'date', vm.start_date, vm.end_date);

    }
})();

