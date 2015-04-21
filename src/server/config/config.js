var path = require('path'),

    extend = function (obj, source) {
        var prop;

        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                obj[prop] = source[prop];
            }
        }

        return obj;
    },

    config = {
        APP_NAME: 'emgoldex backend',

        PORT: 3000,

        CORS :  {
            allowed_headers : 'Access-Token, X-Requested-With, Content-Type, Accept',
            // allowed_origins : '*',
            allowed_methods : 'GET, POST, PUT, OPTIONS, DELETE'
        },

        UPLOAD_DIR: path.normalize(__dirname + '/../uploads/'),
        VIEWS_DIR: path.normalize(__dirname + '/../views'),
        LOGS_DIR: path.normalize(__dirname + '/../logs/'),


        DB: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'test'
        }

    };

    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'development';
    }

    module.exports = extend(config, require(__dirname + '/env/' + process.env.NODE_ENV));