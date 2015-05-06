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
    function home($modal, $state, growl, moment, receiptService, userService, config, helpers) {
        /*jshint validthis: true */
        var date = moment(),
            init = 0,
            today = date.format('YYYY-MM-DD'),
            vm = this;

        vm.config = config;
        vm.current_page = 1;
        vm.search_cat = false;
        vm.filters = config.filters;
        vm.filter = vm.filters[0];
        vm.receipts = [];
        vm.q = '';
        vm.report_category = 'date';
        vm.max_date = date.format('YYYY-MM-DD');
        vm.start_date = date.format('YYYY-MM-DD');
        vm.end_date = date.add(1, 'days').format('YYYY-MM-DD');

        vm.open_start = open_start;
        vm.open_end = open_end;
        vm.date_changed = date_changed;
        vm.get_receipts = get_receipts;
        vm.delete_receipt = delete_receipt;
        vm.get_reports = get_reports;


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
            vm.report_category = 'date';
            return get_receipts(null, 'date', vm.start_date, vm.end_date);
        }

        function get_receipts(q, category, start_date, end_date) {
            vm.receipts = [];
            vm.getting = receiptService.get_receipts({
                q: q,
                category: (category === 'All') ? '' : category.toLowerCase(),
                page: vm.current_page,
                start_date: moment(start_date).format('YYYY-MM-DD'),
                end_date: moment(end_date).format('YYYY-MM-DD')
            }).then(function (data) {
                data.data.forEach(function (e) {
                    e.date = new Date(e.date);
                });

                vm.report_category = category;
                vm.receipts = data.data;
                vm.count = data.count;
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
            if (confirm('Sigurado ka ba?!')) {
                vm.getting = receiptService.delete_receipt(id).then(function (data) {
                    growl.success(data.message);
                    vm.receipts.splice(idx, 1);
                }, function (data) {
                    growl.error(data.message);
                });
            }
        }

        function get_reports () {
            vm.getting = receiptService.get_receipts({
                q: vm.q,
                category: vm.report_category,
                start_date: moment(vm.start_date).format('YYYY-MM-DD'),
                end_date: moment(vm.end_date).format('YYYY-MM-DD')
            }).then(function (data) {
                data.data.forEach(function (e) {
                    e.date = new Date(e.date);
                });
                return helpers.receipts_to_csv(data.data);

            }, function (data) {
                if (data.err === 'NO_DATA') {
                    return;
                }
                growl.error(data.message);
            });
        }

        get_receipts(null, 'date', vm.start_date, vm.end_date);

    }
})();

