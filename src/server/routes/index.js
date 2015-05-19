var config = require(__dirname + '/../config/config')
mysql = require(__dirname + '/../lib/mysql'),
    util = require(__dirname + '/../helpers/util');
console.log('config', config);
module.exports = function (app) {
    app.get('/', function (req, res) {
        var index = (process.env.NODE_ENV === 'development') ? '-dev' : '';

        if (req.cookies && req.cookies.eg_user) {
            res.render('index' + index + '.jade', {
                user: req.cookies.eg_user,
            });
        }
        else {
            res.render('index' + index + '.jade', {
                user: false,
            });
        }
    });

    app.post('/login', function (req, res, next) {
        var data = util.get_data(['username', 'password'], ['stay'], req.body),
            start = function () {
                if (data.username && data.password) {
                    return check_user(data);
                }

                return next({
                    message: 'Invalid data request.',
                    err: 'DATA_ERROR'
                });
            },
            check_user = function () {
                return mysql.open(config.DB)
                    .query('Select id from user where username = ? and password = ?', [data.username, data.password],
                        update_cookies
                    );
            },
            update_cookies = function (err, result) {
                if (err) {
                    return next(err);
                }

                if (!result.length) {
                    return next({
                        message: 'Incorrect password. Please try again.',
                        err: 'AUTH_ERROR'
                    });
                }

                if (data.stay) {
                    res.cookie('eg_user', result[0].id, {
                        maxAge: 604800000,
                        httpOnly: false
                    });
                    return res.send(result[0]);
                }

                res.cookie('eg_user', result[0].id, {
                    httpOnly: false
                });
                res.send(result[0]);
            };

        start();
    });

    app.get('/logout', function (req, res) {
        if (req.cookies.eg_user) {
            res.clearCookie('eg_user');
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }
    });

    app.use('/api/*', function (req, res, next) {
        if (!req.cookies.eg_user) {
            res.status(400);
            return res.send({
                message: 'Please login first.',
                err: 'AUTH_REQUIRED'
            });
        }

        mysql.open(config.DB)
            .query('Select id from user where id = ?',
                req.cookies.eg_user,
                sql_result
            );

        function sql_result(err, result) {

            if (err) {
                res.status(400);
                return res.send({
                    message: 'DATABASE ERROR',
                    err: 'SQL_ERROR'
                });
            }

            if (result.length) {
                return next();
            }

            res.status(400);
            return res.send({
                message: 'INVALID COOKIE',
                err: 'COOKIE_ERROR'
            });

        }
    });

    app.get('/api/user', function (req, res, next) {
        var start = function () {
                return mysql.open(config.DB)
                    .query('Select name, email from user where id = ?',
                        req.cookies.eg_user,
                        done
                    );
            },
            done = function (err, result) {
                if (err) {
                    return next({
                        message: 'Something went wrong. Please try again',
                        err: 'SQL_ERROR'
                    });
                }

                res.send(result[0]);
            };

        start();
    });

    app.put('/api/receipt/:id', function (req, res, next) {
        var data = util.get_data([
                'name', 'bank', 'amount',
                'reference_number', 'date', 'share_type',
                'share_amount', 'user_id', 'reference_number', 'referrer'
            ], [], req.body),
            start = function () {


                return check_dups();
            },
            check_dups = function () {
                return mysql.open(config.DB)
                    .query('SELECT id FROM receipt where date = ? and id != ?',
                        [data.date, req.params.id],
                        save
                    );
            },
            save = function (err, result) {
                if (err) {
                    return next({
                        message: 'Receipt not saved. Please try again.',
                        err: 'SQL_ERROR'
                    });
                }

                if (result.length) {
                    return next({
                        message: 'Receipt with date already exists.',
                        data: result,
                        err: 'DATA_DUPES'
                    });
                }


                if (!req.files.file) {
                    delete data.photo;
                    // return next({message:'Invalid data request.', err: 'DATA_ERROR'});
                }
                else {
                    data.photo = req.files.file.name;
                }

                return mysql.open(config.DB)
                    .query('UPDATE receipt SET ? WHERE id = ?', [data, req.params.id],
                        done
                    );
            },
            done = function (err, result) {
                if (err) {
                    return next({
                        message: 'Receipt not saved. Please try again.',
                        err: 'SQL_ERROR'
                    });
                }

                res.send({
                    message: 'Receipt successfully updated'
                });
            };
        start();
    });

    app.post('/api/receipt', function (req, res, next) {
        var data = util.get_data([
                'name', 'bank', 'amount',
                'reference_number', 'date', 'share_type',
                'share_amount', 'user_id', 'reference_number', 'referrer'
            ], [], req.body),
            start = function () {
                if (!req.files) {
                    return next({
                        message: 'Invalid data request.',
                        err: 'DATA_ERROR'
                    });
                }

                return check_dups();
            },
            check_dups = function () {
                return mysql.open(config.DB)
                    .query('SELECT id FROM receipt where date = ?',
                        data.date,
                        save
                    );
            },
            save = function (err, result) {
                if (err) {
                    return next({
                        message: 'Receipt not saved. Please try again.',
                        err: 'SQL_ERROR'
                    });
                }

                if (result.length) {
                    return next({
                        message: 'Receipt with date already exists.',
                        data: result,
                        err: 'DATA_DUPES'
                    });
                }

                data.photo = req.files.file.name;

                return mysql.open(config.DB)
                    .query('INSERT INTO receipt SET ?',
                        data,
                        done
                    );
            },
            done = function (err, result) {
                if (err) {
                    return next({
                        message: 'Receipt not saved. Please try again.',
                        err: 'SQL_ERROR'
                    });
                }

                res.send({
                    message: 'Receipt successfully saved'
                });
            };

        start();

    });

    app.get('/api/receipt/:id', function (req, res, next) {
        var start = function () {
                if (!req.params.id) {
                    return next({
                        message: 'No id found.',
                        err: 'DATA_ERROR'
                    });
                }

                return get_receipt();
            },
            get_receipt = function () {
                return mysql.open(config.DB)
                    .query('SELECT * FROM receipt WHERE id = ? LIMIT 1',
                        req.params.id,
                        done
                    );

            },
            done = function (err, result) {
                if (err) {
                    return next(err);
                }

                if (!result.length) {
                    return next({
                        message: 'No receipt found on database.',
                        err: 'NO_DATA'
                    });
                }

                res.send(result[0]);
            };

        start();
    });


    app.get('/api/receipts', function (req, res, next) {
        var data = util.get_data([], ['q', 'category', 'page', 'start_date', 'end_date', 'id'], req.query),
            valid_category = ['name', 'share_type', 'reference_number', 'referrer', 'id', 'date'],
            query, params, receipts,
            start = function () {
                if (!req.cookies.eg_user) {
                    return next({
                        message: 'Please login first.',
                        err: 'AUTH_REQUIRED'
                    });
                }
                if (data.page) {
                    data.page = +data.page || 1;
                    data.limit = 25;
                }

                query = 'SELECT * FROM receipt';

                if (data.category !== 'all') {
                    return search();
                }

                return search_all();
            },
            search = function () {
                var where = '';

                params = [data.q, +req.cookies.eg_user];

                if (!~valid_category.indexOf(data.category)) {
                    return next({
                        message: 'Invalid category.',
                        err: 'PARAM_ERROR'
                    });
                }

                switch (data.category) {
                    case 'date':
                        where = ' WHERE date BETWEEN ? AND ?';
                        params = [+new Date(data.start_date), +new Date(data.end_date), +req.cookies.eg_user];
                        break;
                    case 'share_type':
                    case 'id':
                    case 'name':
                    case 'reference_number':
                    case 'referrer':
                        where = ' WHERE ' + data.category + ' = ?';
                        break;
                }

                where += ' AND user_id = ? ORDER BY id desc';

                query += where;

                if (data.page) {
                    query += ' LIMIT ?, ?';
                    params.push((data.page - 1) * data.limit);
                    params.push(data.limit);
                }

                console.log('query', query);
                console.log('params', params);

                return mysql.open(config.DB)
                    .query(query, params, get_total);
            },

            search_all = function () {
                if (!data.q) {
                    return search_user_receipts();
                }

                data.q = '%' + data.q + '%';
                params = [+req.cookies.eg_user, data.q, data.q, data.q];

                query += ' WHERE user_id = ? AND (name like ? OR reference_number like ? OR referrer like ? ) ORDER BY id desc';

                if ( data.page) {
                    query += ' LIMIT ?, ?';
                    params.push((data.page - 1) * data.limit);
                    params.push(data.limit);
                }

                console.log('query', query);
                console.log('params', params);

                return mysql.open(config.DB)
                    .query(query, params, get_total);
            },

            search_user_receipts = function () {
                query += ' WHERE user_id = ? ORDER BY id desc';
                params = [+req.cookies.eg_user];

                if ( data.page) {
                    query += ' LIMIT ?, ?';
                    params.push((data.page - 1) * data.limit);
                    params.push(data.limit);
                }

                return mysql.open(config.DB)
                    .query(query, params, get_total);
            },

            get_total = function (err, results) {
                if (err) {
                    return next(err);
                }

                if (!results.length) {
                    return next({
                        message: 'No receipts found on database.',
                        err: 'NO_DATA'
                    });
                }

                receipts = results;

                if (!data.page) {
                    return done(err, results);
                }

                query = query.replace('*', 'count(*) as count').replace('LIMIT ?, ?', '');
                params = params.splice(0, params.length - 2);

                return mysql.open(config.DB)
                    .query(query, params, done);

            },

            done = function (err, results) {
                if (err) {
                    return next(err);
                }
                res.send({
                    data: receipts,
                    count: results[0].count
                });
            };

        start();

    });

    app.delete('/api/receipt/:id', function (req, res, next) {
        var start = function () {
                return delete_receipt();
            },
            delete_receipt = function () {
                return mysql.open(config.DB)
                    .query('DELETE FROM receipt WHERE id = ?',
                        req.params.id,
                        done
                    );
            },
            done = function (err, results) {
                if (err) {
                    return next(err);
                }

                if (!results.affectedRows) {
                    return next({
                        message: 'No receipts found on database.',
                        err: 'SQL_ERROR'
                    });
                }

                res.send({
                    message: 'Receipt deleted successfully.'
                });
            };

        start();

    });

};

