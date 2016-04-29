var gulp = require('gulp')
var $ = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');

gulp.task('css', () => {
  return gulp.src('app/assets/css/*.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer('last 5 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe($.cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('build/css/'))
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
  return gulp.src('app/assets/js/*.js')
  	.pipe($.uglify())
    .pipe(gulp.dest('build/js/'))
    .pipe(browserSync.stream());
});

gulp.task('rev', function () {
    return gulp.src(['build/css/*.css', 'build/js/*.js'], {base: 'build'})
        .pipe(gulp.dest('build'))  // copy original assets to build dir
        .pipe($.rev())
        .pipe(gulp.dest('build'))  // write rev'd assets to build dir
        .pipe($.rev.manifest())
        .pipe(gulp.dest('build')); // write manifest to build dir
});

gulp.task('jade', () => {
  return gulp.src(['app/assets/jade/**/*.jade', '!app/assets/jade/template.jade', '!app/assets/jade/blocks/*.jade'])
  // MULTILANGUAGE SUPPORT, '!app/assets/jade/en/template.jade', '!app/assets/jade/en/en-blocks/*.jade'])
    .pipe($.jade({pretty: true}))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
})

gulp.task('img', () => {
  return gulp.src('build/img/**/*')
    .pipe($.newer('build/img'))
    .pipe($.imagemin({progressive: true}))
    .pipe(gulp.dest('build/img'))
});

gulp.task('bower', () => {
    return gulp.src(mainBowerFiles(), { base: 'bower_components' })
        .pipe(gulp.dest('app/assets/vendor'))
});

gulp.task('vendor-js', () => {
  return gulp.src('app/assets/vendor/**/*.js')
      .pipe($.concat('vendor.js'))
      .pipe($.uglify())
      .pipe(gulp.dest('build/js'))
});
gulp.task('vendor-css', () => {
  return gulp.src('app/assets/vendor/**/*.css')
      .pipe($.concat('vendor.css'))
      .pipe($.cleanCss({compatibility: 'ie8'}))
      .pipe(gulp.dest('build/css'))
});

gulp.task('extras' , () => {
  return gulp.src('app/*.*')
      .pipe(gulp.dest('build'))
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
    gulp.watch('app/assets/js/*.js', ['js']);  
    gulp.watch('app/assets/css/*.scss', ['css']);
});

gulp.task('default', (callback) => {
     runSequence(['watch', 'js', 'css', 'jade','img'], 'bower', ['vendor-js', 'vendor-css'], 'serve', callback);
});

gulp.task('build', ['extras', 'img']);
