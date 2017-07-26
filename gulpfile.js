/*
|--------------------------------------------------------------------------
| Gulp Imports
|--------------------------------------------------------------------------
|
| Importing gulp variables so we can use both later
| for configuration settings
|
*/

var gulp            = require('gulp')
var $               = require('gulp-load-plugins')();
var mainBowerFiles  = require('main-bower-files');
var browserSync     = require('browser-sync').create();
var runSequence     = require('run-sequence');
var del             = require('del');

/*
|--------------------------------------------------------------------------
| Sass Task
|--------------------------------------------------------------------------
|
| Compile SCSS into css - Autoprefix it - Minify it
| Push it into /build
|
*/

gulp.task('scss', ['pug'], () => {
  return gulp.src('app/assets/scss/**/*.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer('last 5 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe($.cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('build/assets/css'))
    .pipe(browserSync.stream());
});


/*
|--------------------------------------------------------------------------
| JS Task
|--------------------------------------------------------------------------
|
| Minify JS  - Push it into "build"
|
*/

gulp.task('js', ['pug'], () => {
  return gulp.src('app/assets/js/*.js')
    .pipe($.uglify())
    .pipe(gulp.dest('build/assets/js'))
    .pipe(browserSync.stream());
});


/*
|--------------------------------------------------------------------------
| Pug Task
|--------------------------------------------------------------------------
|
| Compile pug into .html - Push it into build
|
*/

gulp.task('pug', () => {
  return gulp.src(['app/assets/pug/**/*.pug', '!app/assets/pug/layouts/**/*'])
    .pipe($.changed('build', {extension: '.html', hasChanged: $.changed.compareContents}))
    .pipe($.plumber())
    .pipe($.pug({pretty:true}))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
})


/*
|--------------------------------------------------------------------------
| Images Task
|--------------------------------------------------------------------------
|
| Minify Images
|
*/
gulp.task('images', () => {
  return gulp.src('build/img/**/*')
    .pipe($.imagemin({progressive: true}))
    .pipe(gulp.dest('build/img'))
});


/*
|--------------------------------------------------------------------------
| Bower Task
|--------------------------------------------------------------------------
|
| Take main files from bower-components - Push them into app/assets/vendor
|
*/

gulp.task('bower', () => {
    return gulp.src(mainBowerFiles(), { base: 'bower_components' })
      .pipe(gulp.dest('app/assets/vendor'))
});


/*
|--------------------------------------------------------------------------
| Vendor JS Task
|--------------------------------------------------------------------------
|
| Take .js files into app/assets/vendor - Minify them - Push them into build/js
|
*/

gulp.task('vendor-js', () => {
  return gulp.src(['app/assets/vendor/jquery/**/*.js', 'app/assets/vendor/**/*.js'])
      .pipe($.concat('vendor.js'))
      .pipe($.uglify())
      .pipe(gulp.dest('build/assets/js'))
});


/*
|--------------------------------------------------------------------------
| Vendor CSS Task
|--------------------------------------------------------------------------
|
| Take .css files into app/assets/vendor - Minify them - Push them into build/css
|
*/

gulp.task('vendor-css', () => {
  return gulp.src('app/assets/vendor/**/*.css')
      .pipe($.concat('vendor.css'))
      .pipe($.cleanCss({compatibility: 'ie8'}))
      .pipe(gulp.dest('build/assets/css'))
});


/*
|--------------------------------------------------------------------------
| Inject Task
|--------------------------------------------------------------------------
|
| Do bower task, then run vendor-css and vendor-js
|
*/

gulp.task('inject', () => {
     runSequence('bower', ['vendor-js', 'vendor-css']);
});


/*
|--------------------------------------------------------------------------
| Extras Task
|--------------------------------------------------------------------------
|
| Take humans.txt, robots.txt, .htaccess - Push them into build
|
*/

gulp.task('extras' , () => {
  return gulp.src(['app/*.*', 'app/.htaccess'])
      .pipe(gulp.dest('build'))
});


/*
|--------------------------------------------------------------------------
| Fonts Task
|--------------------------------------------------------------------------
|
| Take Fonts from bower components and push them into build folder
|
*/

gulp.task('fonts', () => {
    return gulp.src('bower_components/**/fonts/**/*')
    .pipe($.flatten())
    .pipe(gulp.dest('build/fonts'))
});


/*
|--------------------------------------------------------------------------
| Server Task
|--------------------------------------------------------------------------
|
| Static Server + watching scss/html files
|
*/

gulp.task('serve', () => {
    browserSync.init({
        server: "./build"
    });

    gulp.watch('app/assets/pug/**/*.pug', ['pug']);
    gulp.watch('app/assets/js/*.js', ['js']);  
    gulp.watch('app/assets/scss/**/*.scss', ['scss']);
});

/*
|--------------------------------------------------------------------------
| Revision Task
|--------------------------------------------------------------------------
|
| This will add hashes to your assets (app.js, main.css) and will push them
| in the build folder
|
*/

gulp.task('rev', ['clean'], () => {
    gulp.src(['build/assets/**/*', 'build/*.html'])
    .pipe($.revAll.revision({
        dontRenameFile:['.html'], debug:true,
        hashLength: 4,
        dontGlobal: ['assets/css/vendor.css','assets/js/vendor.js', '.json'],
    }))
    .pipe(gulp.dest('build'))
    .pipe($.revAll.manifestFile())
    .pipe(gulp.dest('build'));

});

gulp.task('clean', ['pug'], () => {
  return del('build/assets/**/*.*.*')
})


/*
|--------------------------------------------------------------------------
| Starter Task
|--------------------------------------------------------------------------
|
| Launch this to start your environment
|
*/
gulp.task('default', ['scss', 'js', 'pug', 'fonts', 'serve', 'inject']);


/*
|--------------------------------------------------------------------------
| Build Task
|--------------------------------------------------------------------------
|
| Launch this to create a folder optimized to be deployed on your FTP
|
*/
gulp.task('build', ['extras', 'images', 'rev']);



