(function () {
    'use strict';
    angular
        .module('fetchers.receipt', [])
        .service('receiptService', receipt);
    //@ngInject
    function receipt($http, Upload, rest, helpers) {
        var request;

        return {
            add_receipt: add_receipt,
            get_receipts: get_receipts,
            update_receipt: update_receipt,
            delete_receipt: delete_receipt
        };

        function add_receipt(data) {
            request = Upload.upload({
                url: rest.api_base + '/receipt',
                fields: data,
                file: data.photo[0]
            });
            return request;
        }

        function get_receipts(data) {
            request = $http({
                method: 'GET',
                url: rest.api_base + '/receipts?' + helpers.serialize(data)
            });
            return (request.then(rest.handle_success, rest.handle_error));
        }

        function update_receipt(data) {
            request = Upload.upload({
                url: rest.api_base + '/receipt/' + data.id,
                method: 'PUT',
                fields: data,
                file: data.photo[0]
            });
            return request;
        }

        function delete_receipt(receipt_id) {
            request = $http({
                method: 'DELETE',
                url: rest.api_base + '/receipt/' + receipt_id,
                headers: rest.custom_headers,
            });
            return (request.then(rest.handle_success, rest.handle_error));
        }

    }
})();

