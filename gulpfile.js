// Variables
var gulp            = require('gulp')
var $               = require('gulp-load-plugins')();
var mainBowerFiles  = require('main-bower-files');
var browserSync     = require('browser-sync').create();
var runSequence     = require('run-sequence');
var rimraf          = require('rimraf');
var path            = require('path');
var through         = require('through2');

// Compile SCSS into css - Autoprefix it - Minify it - Push it into /build - Make a rev - Make a manifest
gulp.task('css', () => {
  return gulp.src('app/assets/css/*.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.plumber())
    .pipe($.autoprefixer('last 5 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe($.cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('build/css/'))
    .pipe($.rev())
    .pipe(gulp.dest('build/css'))
    .pipe($.rev.manifest())
    .pipe( gulp.dest('build/css'))
    .pipe(browserSync.stream());
});

// Minify JS  - Push it into "build" - Make a rev - Make a manifest
gulp.task('js', () => {
  return gulp.src('app/assets/js/*.js')
    .pipe($.uglify())
    .pipe(gulp.dest('build/js/'))
    .pipe($.rev())
    .pipe(gulp.dest('build/js'))
    .pipe($.rev.manifest())
    .pipe( gulp.dest('build/js'))
    .pipe(browserSync.stream());
});

// Replace links in .html files with the latest Rev of files
gulp.task('rev', function () {
    return gulp.src(['build/**/*.json', 'build/*.html'])
        .pipe($.revCollector({
            replaceReved: true,
            dirReplacements: {
                'css': 'css',
                'js': 'js'
            }
        }) )
        .pipe( gulp.dest('build') );
});

// Function that clean older versions of Rev
function cleaner() {
    return through.obj(function(file, enc, cb){
        rimraf( path.resolve( (file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new gutil.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}

// Clean older verions of Rev
gulp.task('clean', function() {
    gulp.src( ['build/css/main*.css'], {read: false})
        .pipe($.revOutdated(2) ) // leave 1 latest asset file 
        .pipe( cleaner() );
    gulp.src( ['build/js/app*.js'], {read: false})
        .pipe($.revOutdated(2) ) // leave 3 recent assets 
        .pipe( cleaner() );
    return;
});

// Compile JADE into .html - Push it into build
gulp.task('jade', () => {
  return gulp.src(['app/assets/jade/**/*.jade', '!app/assets/jade/template.jade', '!app/assets/jade/blocks/*.jade'])
  // MULTILANGUAGE SUPPORT, '!app/assets/jade/en/template.jade', '!app/assets/jade/en/en-blocks/*.jade'])
    .pipe($.plumber())
    .pipe($.jade({pretty: true}))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
})

// Compress images
gulp.task('img', () => {
  return gulp.src('build/img/**/*')
    .pipe($.imagemin({progressive: true}))
    .pipe(gulp.dest('build/img'))
});

// Take main files from bower-components - Push them into app/assets/vendor
gulp.task('bower', () => {
    return gulp.src(mainBowerFiles(), { base: 'bower_components' })
        .pipe(gulp.dest('app/assets/vendor'))
});

// Take .js files into app/assets/vendor - Minify them - Push them into build/js
gulp.task('vendor-js', () => {
  return gulp.src('app/assets/vendor/**/*.js')
      .pipe($.concat('vendor.js'))
      .pipe($.uglify())
      .pipe(gulp.dest('build/js'))
});

// Take .css files into app/assets/vendor - Minify them - Push them into build/css
gulp.task('vendor-css', () => {
  return gulp.src('app/assets/vendor/**/*.css')
      .pipe($.concat('vendor.css'))
      .pipe($.cleanCss({compatibility: 'ie8'}))
      .pipe(gulp.dest('build/css'))
});

// Take humans.txt, robots.txt, .htaccess - Push them into build
gulp.task('extras' , () => {
  return gulp.src('app/*.*')
      .pipe(gulp.dest('build'))
});

gulp.task('fonts', function() {
    return gulp.src(['bower_components/**/fonts/*.eot', 'bower_components/**/fonts/*.woff', 'bower_components/**/fonts/*.svg', 'bower_components/**/fonts/*.ttf'])
    .pipe($.flatten())
    .pipe(gulp.dest('build/fonts'))
});

// Static Server + watching scss/html files
gulp.task('serve', ['watch'], () => {
    browserSync.init({
        server: "./build"
    });
});

// Watch for changes
gulp.task('watch', () => {    
    gulp.watch('app/assets/jade/**/*.jade', ['jade']);
    gulp.watch('app/assets/js/*.js', ['js', 'clean']);  
    gulp.watch('app/assets/css/**/*.scss', ['css','clean']);
});

gulp.task('default', (callback) => {
     runSequence(['watch', 'js', 'css', 'jade','img', 'fonts'], 'bower', ['vendor-js', 'vendor-css'], 'serve', callback);
});

gulp.task('build', ['extras', 'img', 'rev', 'fonts']);

gulp.task('inject', () => {
     runSequence('bower', ['vendor-js', 'vendor-css']);
});

