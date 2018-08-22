const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');
const plumberNotifier = require('gulp-plumber-notifier');
const babelify = require('babelify');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const gutil = require('gulp-util');

let paths = {
  dest: 'dist/',
  src: 'assets/',
  styles: {
      src: './assets/styles/app.scss',
      dest: './dist/styles',
      fileName: 'app.css',
      minifiedFileName: 'app.min.css',
      watch: './assets/styles/**/*.scss'
  },
  html: {
      src: './assets/views/*.pug',
      dest: './',
      remove: './*.html',
      watch: './assets/views/**/*.pug'
  },
  scripts: {
      require: ['materialize-css'],
      src: './assets/scripts/vendor.js',
      dest: './dist/scripts',
      fileName: 'vendor.js',
      minifiedFileName: 'vendor.min.js',
      watch: './assets/scripts/*.js'
  },
  images: {
      src: './assets/images/*',
      dest: './dist/images',
      watch: './assets/images'
  },
  fonts: {
      src: './assets/fonts/*',
      dest: './dist/fonts'
  },
  json: {
    src: './assets/scripts/datatables-es_ES.json',
    dest: './dist/scripts'
},
  sync: {
      server: true
  }
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del([ 'dist' ]);
}

/*
 * Define our tasks using plain functions
 */
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    // .pipe(sourcemaps.write({includeContent: false}))
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(sourcemaps.write('.'))
    // .pipe(cleanCSS())
    // pass in options to the stream
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return browserify({ entries: [paths.scripts.src], require: [paths.scripts.require] })
      .transform(babelify, { presets: ['es2015'] }) // "es2015", "react"
      .bundle()
      .pipe(source(paths.scripts.fileName))
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(browserSync.stream());
}

// Fonts
function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
}

// JSon files
function json() {
  return gulp.src(paths.json.src)
    .pipe(gulp.dest(paths.json.dest));
}

// Image minification
function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}

// Pug to HTML
function html() {
  del([ paths.html.remove ]);

  return gulp.src(paths.html.src)
    .pipe(plumber())
    .pipe(plumberNotifier())
    .pipe(pug({
        pretty: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Lint the JS with jslint
function jslint() {
  return gulp.src(paths.scripts.watch)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('default'));
}

function watch() {
  browserSync.init(paths.sync);
  
  gulp.watch(paths.scripts.watch, scripts);
  gulp.watch(paths.styles.watch, styles);
  gulp.watch(paths.html.watch, html);
  gulp.watch(paths.images.watch, images);
}

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.jslint = jslint;
exports.fonts = fonts;
exports.json = json;
exports.images = images;
exports.html = html;
exports.watch = watch;

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var start = gulp.series(clean, gulp.parallel(styles, scripts, json, images, html, watch));

/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task('clean', clean);
gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('start', start);
gulp.task('fonts', fonts);
gulp.task('json', json);
gulp.task('images', images);
gulp.task('jslint', jslint);
gulp.task('html', html);

gulp.task('build', gulp.series('clean', 'styles', 'scripts', 'json', 'images', 'html', function(done) {
  gulp.src(paths.styles.dest + '/' + paths.styles.fileName)
    .pipe(cleanCSS())
    .pipe(rename(paths.styles.minifiedFileName))
    .pipe(gulp.dest(paths.styles.dest));
  
  gulp.src(paths.scripts.dest + '/' + paths.scripts.fileName)
    .pipe(rename(paths.scripts.minifiedFileName))
    .pipe(uglify())
    .on('error', function(err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest(paths.scripts.dest));

  done();
}));

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', start);