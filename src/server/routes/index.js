module.exports = function(app) {
    app.get('/', function(req, res) {
      console.log('req.cookies', req.cookies);
      console.log("__dirname",__dirname);
      if(req.cookies && req.cookies.eg_user) {
        res.render('index.jade', {
            user: req.cookies.eg_user,
        });
      }
      else {
        res.render('index.jade', {
            user: 'false hahaha',
        });
      }
    });

    app.get('/dashboard', function(req, res) {
      console.log('req.cookies.access_token', req.cookies.access_token)
      if(req.cookies.access_token) {
        res.render('index.jade', {
          module_name: 'user',
          // public_dir: config.public_dir,
          // public_dir_forced: config.public_dir_forced,
          module_angular: 'ui.freedom'

        });
      }
      else {
        res.render('index.jade', {
          module_name: 'user',
          // public_dir: config.public_dir,
          // public_dir_forced: config.public_dir_forced,
          module_angular: 'ui.freedom'

        });
      }
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