var config = require(__dirname + '/../config/config')
    mysql = require(__dirname + '/../lib/mysql'),
    util = require(__dirname + '/../helpers/util');

module.exports = function(app) {
    app.get('/', function(req, res) {
      console.log('req.cookies', req.cookies);
      console.log("__dirname",__dirname);
      if(req.cookies && req.cookies.eg_user) {
        console.log("req.cookies.eg_user",req.cookies.eg_user, JSON.stringify(req.cookies.eg_user));
        res.render('index.jade', {
            user: JSON.stringify(req.cookies.eg_user),
        });
      }
      else {
        res.render('index.jade', {
            user: false,
        });
      }
    });
    // console.log("app.post",app.post);
    app.post('/login', function(req, res, next) {
        var data = util.get_data(['username', 'password'], ['staysignin'], req.body),
            start = function () {
                if(data.username && data.password) {
                    return check_user(data);
                }

                return next('invalid data');
            },
            check_user = function () {
                return mysql.open(config.DB)
                    .query('Select * from user where username = ? and password = ?',
                        [data.username, data.password],
                        update_cookies
                    );
            },
            update_cookies = function (err, result) {
                if (err) {
                    return next(err);
                }

                if ( ! result.length) {
                    res.send('invalid password');
                }

                if (data.staysignin) {
                    res.cookie('eg_user', result[0], { maxAge: 604800000, httpOnly: false});
                    return res.send(result[0]);
                }

                res.cookie('eg_user', result[0], { httpOnly: false });
                res.send(result[0]);
            };

        start();

        // console.log("next",next);
    });

    app.get('/logout', function(req, res) {
        if(req.cookies.access_token) {
          var access_token = req.cookies.access_token;
          var http = require('http');
          var options = {};
          var url = '';
          var req = http.request( {host: backend_server_url, port: backend_server_port, path: '/logout', method: 'GET', headers: {'X-ACCESS-TOKEN': access_token}}, function(response) {
            console.log('RESPONSE: ' + response.statusCode);
            if(response.statusCode) {
              res.clearCookie('access_token');
              res.redirect('/logout');
            }
            // console.log('Problem with request: ' + e.message);
          });req.end();
        }
        else {
          if (req.query.message) res.redirect('/error?message=' + req.query.message);
          else res.redirect('/');
        }
    });



    app.get('/api/maa', getMaa);

    function getMaa(req, res, next) {
        var json = jsonfileservice.getJsonFromFile('/../../data/maa.json');
        json[0].data.results.forEach(function(character) {
            var pos = character.name.indexOf('(MAA)');
            character.name = character.name.substr(0, pos - 1);
        });
        res.send(json);
    }



};