/**
    Utilities
*/
'use strict';
var config = require(__dirname + '/../config/config'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    // smtp_transport = nodemailer.createTransport({
    //     service: config.MAIL.service,
    //     auth: {
    //         user: config.MAIL.user,
    //         pass: config.MAIL.pass
    //     }
    // }),
    mysql = require(__dirname + '/../lib/mysql');


exports.mail = function (to, subject, html, cb) {
    var mail_options = {};
    mail_options.from = config.MAIL.from;
    mail_options.to = to;
    mail_options.subject = subject;
    mail_options.html = html;
    // smtp_transport.sendMail(mail_options, cb);
};


exports.hash = function (string, hash) {
    return crypto.createHash(hash || 'sha1').update('' + string).digest('hex');
};


exports.get_data = function (reqd, optional, body) {
    var i = reqd.length,
        ret = {},
        temp;

    while (i--) {
        if (!body[temp = reqd[i]] || body[temp] instanceof Array) {
            return temp + ' is missing';
        }
        ret[temp] = body[temp];
    }

    i = optional.length;

    while (i--) {
        if (body[temp = optional[i]]) {
            ret[temp] = body[temp];
        }
    }
    return ret;
};


exports.random_string = function (i) {
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        str = '',
        l = i || 32;

    while (l--)
        str += possible.charAt(~~(Math.random() * 62));

    return str;
};


exports.generate_UUID = function () {
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x'
                    ? r
                    : (r & 0x3 | 0x8)
                )
                .toString(16);
        }
    );
};


exports.sql_like = function (data, field, keyword) {
    var filtered_data = data.filter(function (e) {
         var search_regex = new RegExp(keyword + '.*');
         return e[field].match(search_regex);
    });
    return filtered_data;
};


exports.unique_short_string = function (n) {
    return (+new Date * Math.random())
        .toString(36)
        .replace('.', '')
        .substring(0, n);
};


exports.pad = function (num, size) {
    return ('000000000' + num).substr(-(size || 2));
};


exports.extract_files = function (files, name, next) {
    if (files[name])
        return (files[name] instanceof Array) ? files[name] : [files[name]];
    if (next) {
        next(name + ' is missing');
        return false;
    }
    return [];
};


exports.to_title_case = function (str) {
    if (str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    return false;
};


exports.caps_first = function (string) {
    return string.charAt(0)
            .toUpperCase()
        + string.slice(1);
};


exports.current_date = function () {
    var d = new Date();
    return [
        d.getFullYear(),
        this.pad(d.getMonth() + 1),
        this.pad(d.getDate())
    ].join('-');
};


exports.clean_string = function (string) {
    return string
        .match(/\S{1,30}/g)
        .join(' ');
};


exports.to_object_id = function (t) {
    return require('mongoskin')
        .helper
        .toObjectID(t);
};


exports.format_data = function (data) {
    var temp,
        i, j;

    data.columnHeaders = data.columnHeaders.map(function (header) {
        return header.name;
    });

    data.data = {};

    for (i in data.columnHeaders) {
        data.rows = data.rows || [];
        j = data.rows.length;

        while (j--) {
            temp = data.data[data.columnHeaders[i]];

            if (!temp) {
                temp = [];
            }

            temp.push(data.rows[j][i]);
        }
    }

    delete data.rows;
    return data;
};


exports.split = function (a, n) {
    var len = a.length,
        out = [],
        i = 0;

    while (i < len) {
        out.push(a.slice(i, i += Math.ceil((len - i) / n--)));
    }

    return out;
};


exports.slice = function (a, n) {
    var len = a.length,
        out = [],
        number_of_slice = Math.ceil(len / n);
        i = 0;

    while (number_of_slice--) {
        out.push(a.splice(0, n));
        i += n;
    }

    return out;
};


exports.extend = function (obj, source) {
    var prop;

    for (prop in source) {
        if (source.hasOwnProperty(prop)) {
           obj[prop] = source[prop];
        }
    }

    return obj;
};


exports.get_percentage_growth = function (before, after) {
    var total = 0,
        difference = 0;

    before = before || 1;
    if (before) {
        before = 1;
    }

    after = after || 1;
    if (after) {
        after = 1;
    }

    if (after < before) {
        return 0;
    }

    difference = after - before;

    if (difference && after) {
        total = difference / before;
    }

    if (total > 10000) {
        return 10000;
    }

    return Math.round(total * 100);
};
