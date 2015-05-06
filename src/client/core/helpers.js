(function () {
    'use strict';

    angular
        .module('app')
        .service('helpers', helpers);

    function helpers () {
        return {
            extend : extend,
            serialize : serialize,
            receipts_to_csv : receipts_to_csv,
            convert_to_csv : convert_to_csv
        };

        function extend (obj, source) {
            var prop;

            for (prop in source) {
                if (source.hasOwnProperty(prop)) {
                   obj[prop] = source[prop];
                }
            }

            return obj;
        }

        function serialize (obj) {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p) && obj[p]) {
                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                }
            }
            return str.join('&');
        }


        function receipts_to_csv(receipts) {

            var csvContent = "data:text/csv;charset=utf-8,",
                encodedUri, link;

            delete receipts[0].photo;

            csvContent += Object.keys(receipts[0]).join(',') + ',\r\n';
            receipts.forEach(function (e) {
                e.date = moment(e.date).format('YYYY-MM-DD');
                delete e.photo;
            });

            csvContent += convert_to_csv(receipts);
            encodedUri = encodeURI(csvContent);
            link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "my_data.csv");
            link.click();
        }

        function convert_to_csv(objArray) {
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

    }
})();