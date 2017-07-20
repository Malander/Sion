// Variables
var gulp            = require('gulp')
var $               = require('gulp-load-plugins')();
var mainBowerFiles  = require('main-bower-files');
var browserSync     = require('browser-sync').create();
var runSequence     = require('run-sequence');
var revDel          = require('rev-del');
// var rimraf          = require('rimraf');
// var path            = require('path');
// var through         = require('through2');
var RevAll = require('gulp-rev-all');

// Compile SCSS into css - Autoprefix it - Minify it - Push it into /build - Make a rev - Make a manifest
gulp.task('css', () => {
  return gulp.src('app/assets/css/*.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.plumber())
    .pipe($.autoprefixer('last 5 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    // .pipe($.rev())
    // .pipe( gulp.dest('build/css'))
    // .pipe($.rev.manifest())
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream());
});

// gulp.task('css-vers', () => {
//   return gulp.src('build/css/main.css')
//     .pipe($.rev())
//     .pipe( gulp.dest('build/css'))
//     .pipe($.rev.manifest())
//     .pipe(revDel({ dest: 'build/css' })) 
//     .pipe( gulp.dest('build/css'));
// });

// gulp.task('js-vers', () => {
//   return gulp.src('build/js/app.js')
//     .pipe($.rev())
//     .pipe( gulp.dest('build/js'))
//     .pipe($.rev.manifest())
//     .pipe(revDel({ dest: 'build/js' }))
//     .pipe( gulp.dest('build/js'));
// });




// gulp.task('rev', function () {

//   gulp.src('build/**/*')
//     .pipe(RevAll.revision({dontRenameFile:['.html','css/vendor.css','js/vendor.js','.woff','.ttf','.eot','.svg','.json'], debug:true}))
//     .pipe(gulp.dest('build'))
//     .pipe(RevAll.manifestFile())
//     .pipe(gulp.dest('build'));

// });



// gulp.task("rev", ["css-vers", "js-vers"], function() {
//   var manifest = gulp.src("build/**/rev-manifest.json");

//   return gulp.src("build/**/*.html")
//   .pipe($.revReplace({manifest: manifest}))
//   .pipe(gulp.dest('build'));
// });






// Minify JS  - Push it into "build" - Make a rev - Make a manifest
gulp.task('js', () => {
  return gulp.src('app/assets/js/*.js')
    .pipe($.uglify())
    .pipe( gulp.dest('build/js'))
    .pipe(browserSync.stream());
});

// Compile pug into .html - Push it into build
gulp.task('pug', () => {
  return gulp.src(['app/assets/pug/**/*.pug', '!app/assets/pug/master.pug', '!app/assets/pug/partials/*.pug'])
    .pipe($.changed('build', {extension: '.html'}))
    .pipe($.plumber())
    .pipe($.pug({pretty:true}))
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
  return gulp.src(['app/assets/vendor/jquery/**/*.js', 'app/assets/vendor/**/*.js'])
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
    gulp.watch('app/assets/pug/**/*.pug', ['pug']);
    gulp.watch('app/assets/js/*.js', ['js']);  
    gulp.watch('app/assets/css/**/*.scss', ['css']);
});

gulp.task('default', (callback) => {
     runSequence(['watch', 'js', 'css', 'pug','img', 'fonts'], 'bower', ['vendor-js', 'vendor-css'], 'serve', callback);
});

gulp.task('build', ['extras', 'img', 'fonts', 'rev']);

gulp.task('inject', () => {
     runSequence('bower', ['vendor-js', 'vendor-css']);
});

