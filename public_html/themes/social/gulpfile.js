// ===================================================
// Required packages
// ===================================================

var gulp          = require('gulp'),
    postcss       = require('gulp-postcss'),
    sass          = require('gulp-sass'),
    sourcemaps    = require('gulp-sourcemaps'),
    autoprefixer  = require('autoprefixer'),
    mqpacker      = require('css-mqpacker'),
    precss        = require('precss'),
    lost          = require('lost'),
    rucksack      = require('gulp-rucksack'),
    jade          = require('gulp-jade'),
    path          = require('path'),
    fs            = require('fs'),
    data          = require('gulp-data'),
    concat        = require('gulp-concat'),
    notify        = require('gulp-notify'),
    beep          = require('beepbeep'),
    gutil         = require('gulp-util'),
    uglify        = require('gulp-uglify'),
    cssnano       = require('gulp-cssnano'),
    connect       = require('gulp-connect'),
    plumber       = require('gulp-plumber'),
    deploy        = require('gulp-gh-pages');

// ===================================================
// Config
// ===================================================

var folder = {
  dist: 'dist',
  jade: 'jade',
  css: 'css',
  scss: 'css/src',
  js: 'js',
  js_comp: 'js/components',
  js_project: 'js/project',
  data: 'locales',
  js_vendor: '../../core/assets/vendor'
}

var glob = {
  jade: folder.jade + '/*.jade',
  css: folder.css + '/*.css',
  scss: folder.css + '/src/**/*.scss',
  js: folder.js + '/**/*.js',
  data: folder.data + '/**/*.json',
  font: 'font/**/*',
  images: 'images/**/*'
};

var onError = function(err) {
  notify.onError({
    title:    "Gulp error in " + err.plugin,
    message:  "<%= error.message %>",
    sound: "Beep"
  })(err);
  this.emit('end');
};

// ===================================================
// Styles
// ===================================================

gulp.task('css', function () {

  var processors = [
    autoprefixer({browsers: ['last 2 versions']}),
    mqpacker({sort: true}),
    lost()
  ];

  var stream = gulp.src(folder.scss + '/*.scss')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe( sass() )
    //.pipe( sourcemaps.init() )
    //.pipe( sourcemaps.write('.') )
    .pipe( postcss(processors) )
    .pipe( rucksack() )
    .pipe( gulp.dest(folder.css) )
    .pipe( cssnano() )
    .pipe( gulp.dest(folder.dist + '/css') )
    .pipe( connect.reload() );
  return stream;

});

// ===================================================
// Template file (Jade)
// ===================================================

gulp.task('jade', function() {

  return gulp.src(glob.jade)
    .pipe(plumber({
      handleError: onError
    }))
    .pipe(data(function(file) {
      return JSON.parse(fs.readFileSync(folder.data + '/en-US/translation.json'));
    }))
    .pipe(jade({
      pretty: true
    })) // pip to jade plugin
    .pipe(gulp.dest(folder.dist)) // tell gulp our output folder
    .pipe(connect.reload());
});



// ===================================================
// Scripts
// ===================================================

// get component scripts and make available for dist in one file
gulp.task('script-components', function() {
  return gulp.src([
    folder.js_comp + "/initial.js",
    folder.js_comp + "/jquery.easing.1.3.js",
    folder.js_comp + "/animation.js",
    folder.js_comp + "/velocity.min.js",
    folder.js_comp + "/classie.js",
    folder.js_comp + "/hammer.min.js",
    folder.js_comp + "/jquery.hammer.js",
    folder.js_comp + "/global.js",
    folder.js_comp + "/responsive-dom.js",
    folder.js_comp + "/collapsible.js",
    folder.js_comp + "/sideNav.js",
    folder.js_comp + "/buttons.js",
    folder.js_comp + "/waves.js",
    folder.js_comp + "/forms.js",
    folder.js_comp + "/ui-search.js",
    folder.js_comp + "/dropdown.js"
    ])
    .pipe( concat('components.js') )
    .pipe( gulp.dest(folder.js) )
    //.pipe( uglify() )
    .pipe( gulp.dest(folder.dist + '/js') )
    .pipe( connect.reload() );
});

// get project scripts and make available for dist in one file
gulp.task('script-project', function() {
  return gulp.src([
    folder.js_project + "/main-menu.js"
    ])
    .pipe( concat('project.js') )
    .pipe( gulp.dest(folder.js) )
    //.pipe( uglify() )
    .pipe( gulp.dest(folder.dist + '/js') )
    .pipe( connect.reload() );
});

//copy vendor scripts from drupal to make them available for the styleguide
gulp.task('script-vendor', function() {
  return gulp.src([
    folder.js_vendor + '/jquery/jquery.min.js',
    folder.js_vendor + 'jquery-once/jquery.once.min.js',
    'js/vendor/jquery.touch-swipe.js'
  ])
  .pipe( concat('vendor.js') )
  .pipe( uglify() )
  .pipe( gulp.dest(folder.dist + '/js') );
});

//copy init script to the styleguide
gulp.task('script-init', function() {
  return gulp.src([folder.js + "/init.js"])
  .pipe( gulp.dest(folder.dist + '/js') );
});

// ===================================================
// Fonts
// ===================================================

gulp.task('font', function() {
  stream = gulp.src(glob.font)
    .pipe( gulp.dest(folder.dist + '/font') )
    .pipe( connect.reload() );
  return stream;
});

// ===================================================
// Images
// ===================================================

gulp.task('images', function() {
  stream = gulp.src(glob.images)
    .pipe( gulp.dest(folder.dist + '/images') )
    .pipe( connect.reload() );
  return stream;
});



// ===================================================
// Set up a server
// ===================================================

gulp.task('connect', function() {
  connect.server({
    root: [folder.dist],
    livereload: true,
    port: 5002
  });
});


// ===================================================
// Watch dev tasks
// ===================================================

gulp.task('watch', function() {
  gulp.watch([
    glob.scss
  ], ['css']);

  gulp.watch([
    folder.jade + '/**/*'
  ], ['jade']);

  gulp.watch([
    folder.js_comp + '/**/*.js'
  ], ['scripts']);

  gulp.watch([
    folder.js_project + '/**/*.js'
  ], ['script-project']);

  gulp.watch([
    folder.js + "/init.js"
  ], ['script-init']);

  gulp.watch([
    glob.font
  ], ['font']);

  gulp.watch([
    glob.images
  ], ['images']);

});

// ===================================================
// Deploy to github pages branch
// ===================================================

gulp.task('deploy', ['build'], function() {
  return gulp.src([folder.dist + '/**/*'])
    .pipe( deploy() );
});

gulp.task('scripts', ['script-components', 'script-project', 'script-vendor', 'script-init']);

gulp.task('build', ['css', 'jade' , 'scripts', 'font', 'images']);

gulp.task('default', ['css', 'jade' , 'scripts', 'connect', 'watch']);
