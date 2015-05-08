'use strict';
var config      = require('./gulp.config.json'),
    gulp        = require('gulp'),
    // gutil       = require('gulp-util'),
    // clean       = require('gulp-clean'),
    sass        = require('gulp-sass'),
    prefixer    = require('gulp-autoprefixer'),
    minifycss   = require('gulp-minify-css'),
    jshint      = require('gulp-jshint'),
    ngAnnotate  = require('gulp-ng-annotate'),
    html2js     = require('gulp-html2js'),
    uglify      = require('gulp-uglify'),
    sourcemaps  = require('gulp-sourcemaps'),
    filesize    = require('gulp-filesize'),
    rename      = require('gulp-rename'),
    concat      = require('gulp-concat'),
    notify      = require('gulp-notify'),
    ginject     = require('gulp-inject'),
    nodemon     = require('gulp-nodemon'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    env         = 'development';

    gulp.task('vendorcss', function() {
        return gulp.src(config.vendorcss)
            .pipe(concat('vendor.css'))
            .pipe(sourcemaps.init())
            .pipe(filesize())
            .pipe(minifycss())
            .pipe(filesize())
            .pipe(rename('vendor.min.css'))
            .pipe(sourcemaps.write('../maps'))
            .pipe(gulp.dest('build/css'));
    });

    gulp.task('vendorjs', function() {
        return gulp.src(config.vendorjs)
            .pipe(concat('vendor.js'))
            .pipe(sourcemaps.init())
            .pipe(filesize())
            .pipe(uglify())
            .pipe(filesize())
            .pipe(rename('vendor.min.js'))
            .pipe(sourcemaps.write('../maps'))
            .pipe(gulp.dest('build/js'));
    });

    gulp.task('js', function () {
        return gulp.src(config.js)
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(concat('scripts.js'))
            .pipe(ngAnnotate({
                add: true,
                single_quotes: true
            }))
            .pipe(gulp.dest('build/js'))
            .pipe(sourcemaps.init())
            .pipe(filesize())
            .pipe(uglify())
            .pipe(filesize())
            .pipe(rename('scripts.min.js'))
            .pipe(sourcemaps.write('../maps'))
            .pipe(gulp.dest('build/js'))
            .pipe(notify({ message: 'JS task complete' }));;
    });

    gulp.task('fonts', function() {
        return gulp
            .src(config.fonts)
            .pipe(gulp.dest('build/fonts'));
    });

    gulp.task('sass', function() {
        return gulp.src(config.allcss)
            .pipe(sass({ noCache: true }))
            .pipe(concat('styles.css'))
            .pipe(prefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(gulp.dest('build/css'))
            .pipe(filesize())
            .pipe(minifycss())
            .pipe(filesize())
            .pipe(rename('styles.min.css'))
            .pipe(gulp.dest('build/css'))
            .pipe(notify({ message: 'Sass Styles task complete' }));
    });

    gulp.task('templates', function() {
      gulp.src(config.htmltemplates)
        .pipe(html2js())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('build/js'));
    })


    gulp.task('inject', function() {
        return gulp.src(config.index)
            .pipe(inject('css/vendor.min.css', 'inject-vendor'))
            .pipe(inject('css/styles.min.css'))
            .pipe(inject('js/vendor.min.js', 'inject-vendor'))
            .pipe(inject('js/scripts.min.js'))
            .pipe(gulp.dest(config.client))
            .pipe(notify({ message: 'Inject task complete' }));
    });

    gulp.task('test', function () {
        return gulp.src(config.js)
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(sourcemaps.write('../new'))
            .pipe(gulp.dest('build'));
    });

    gulp.task('watchers', function() {
        env = 'development';

        serve({
            mode: env
        });

        gulp.watch(config.allcss, ['sass',reload]).on('change',function() {
            notify({message:'Changed'})
        });
        gulp.watch(config.js, ['js',reload]).on('change',function() {
            notify({message:'Changed'})
        });
        gulp.watch(config.htmltemplates, ['templates','js',reload]).on('change',function() {
            notify({message:'Changed'})
        });
        gulp.watch(config.html).on('change', reload);

    });

    gulp.task('serve-dev', ['sass', 'js', 'templates', 'vendorcss', 'vendorjs', 'fonts', 'inject', 'watchers']);


    gulp.task('serve-production', ['sass', 'js', 'templates', 'vendorcss', 'vendorjs', 'fonts', 'inject'], function() {
        env = 'production';

        serve({
           mode: env
        });

        gulp.watch(config.css, ['css']);
        gulp.watch(config.html).on('change', reload);

    });

    gulp.task('default', ['serve-dev']);


    function inject(path, name) {
        var pathGlob = config[env].build + path,
        options = {
            read: false
        };
        if (name) {
            options.name = name;
        }
        return ginject(gulp.src(pathGlob), options);
    }

    /**
     * Start the node server using nodemon.
     * Optionally start the node debugging.
     * @param  {Object} args - debugging arguments
     * @return {Stream}
     */
    function serve (args) {
        var options = {
            script: config.server + 'app.js',
            delayTime: 1,
            env: {
                'NODE_ENV': args.mode,
                'PORT': 3000
            },
            watch: [config.server]
        };

        var exec;
        if (args.debug) {
            log('Running node-inspector. Browse to http://localhost:8080/debug?port=5858');
            exec = require('child_process').exec;
            exec('node-inspector');
            options.nodeArgs = [args.debug + '=5858'];
        }

        return nodemon(options)
            // .on('start', startBrowserSync)
            //.on('change', tasks)
            .on('restart', function() {
                setTimeout(function () {
                    browserSync.reload({ stream: false });
                }, 1000);
            });
    }

    function startBrowserSync() {
        browserSync({

            proxy: 'localhost:' + 3001,
            files: [config.client + '/**/*.*'],
            ghostMode: { // these are the defaults t,f,t,t
                clicks: true,
                location: false,
                forms: true,
                scroll: true
            },
            logLevel: 'debug',
            logPrefix: 'gulp-patterns',
            notify: true,
            reloadDelay: 1000
        });
    }