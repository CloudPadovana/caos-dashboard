const gulp = require('gulp');

const _ = require('lodash');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const inject = require('gulp-inject-string');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const server = require('gulp-server-livereload');
const sourcemaps = require('gulp-sourcemaps');
const system_builder = require('systemjs-builder');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');


const SRC_DIR = './src';
const APP_SRC_DIR = SRC_DIR + '/app';
const ASSETS_DIR = SRC_DIR + '/assets';
const PUG_DIR = SRC_DIR + '/pug';
const STYLE_DIR = SRC_DIR + '/style';

const OUTPUT_DIR = './output/';
const OUTPUT_JS_DIR = OUTPUT_DIR + 'js/';
const OUTPUT_JS_VENDOR_DIR = OUTPUT_JS_DIR + 'vendor/';
const OUTPUT_CSS_DIR = OUTPUT_DIR + 'css/';

const DIST_DIR = 'dist';


var flags = {
  production: false
};

gulp.task('production', function () {
  flags.production = true;
});

var ts_project = ts.createProject('tsconfig.json', {
  typescript: require('typescript'),
  noEmitOnError: true
});
var js_builder = new system_builder('.', './systemjs.config.js');

gulp.task('build:js:app', function() {
  if (flags.production) {
    var js_builder_opts = { sourceMaps: false, lowResSourceMaps: false, minify: true };
  } else {
    var js_builder_opts = { sourceMaps: true, lowResSourceMaps: true, minify: false };
  }

  js_builder.invalidate('caos/*');

  return gulp.src(['typings/index.d.ts',
                   APP_SRC_DIR + '/**/*.ts'
                  ])
    .pipe(gulpif(flags.production,
                 inject.replace('// INJECT PRODUCTION CODE',
                                "import { enableProdMode } from '@angular/core'; enableProdMode();")))
    .pipe(sourcemaps.init({loadMaps: true}))
  // .pipe(plumber())
    .pipe(ts(ts_project, {}, ts.reporter.fullReporter()))
    .on('error', function (error) {
      var log = gutil.log, colors = gutil.colors;
      log('Typescript compilation exited with ' + colors.red(error));
    }).js
  // .pipe(debug({title: "Stream contents:", minimal: true}))
    .pipe(gulpif(flags.production, uglify()))
    .pipe(gulpif(!flags.production, sourcemaps.write('.')))
    .pipe(gulp.dest(DIST_DIR))
    .on('end', function () {
      js_builder.bundle('caos/bootstrap',
                        OUTPUT_JS_DIR + 'bundle.js',
                        js_builder_opts)
        .then(function() {
          console.log('Build complete');
        })
        .catch(function(err) {
          console.log('Build error');
          console.log(err);
        });
    });
});

gulp.task('watch:js:app', ['build:js:app'], function() {
  var watcher = gulp.watch(['./systemjs.config.js',
                            APP_SRC_DIR + '/**/*.ts'], ['build:js:app']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });

});

const VENDOR_JS = {
  'shim.min.js':     'node_modules/core-js/client/shim.min.js',
  'zone.js': 'node_modules/zone.js/dist/zone.js',
  'Reflect.js':     'node_modules/reflect-metadata/Reflect.js',
  'system.js':     'node_modules/systemjs/dist/system.js'
};

const VENDOR_JS_DEV = {
  'shim.min.js.map': 'node_modules/core-js/client/shim.min.js.map',
  'Reflect.js.map': 'node_modules/reflect-metadata/Reflect.js.map',
  'system.js.map': 'node_modules/systemjs/dist/system.js.map'
};

gulp.task('build:js:vendor', function() {
  var FILES = VENDOR_JS;

  if (!flags.production) {
    FILES = _(FILES).extend(VENDOR_JS_DEV);
  }

  _(FILES).forEach(function(value, key) {
    console.log('Processing ' + value + ' to ' + OUTPUT_JS_VENDOR_DIR + key);

    gulp.src(value)
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(gulpif(flags.production, uglify()))
      .on('error', gutil.log)
      .pipe(gulpif(!flags.productions,sourcemaps.write('.')))
      .pipe(rename(key))
      .pipe(gulp.dest(OUTPUT_JS_VENDOR_DIR));
  });

});

gulp.task('build:js', [
  'build:js:app',
  'build:js:vendor'
]);

gulp.task('watch:js', [
  'watch:js:app',
  'watch:js:vendor'
]);

gulp.task('watch:js:vendor', ['build:js:vendor'], function() {
  var vendor = [];

  _(VENDOR_JS).forEach(function(value, key) {
    vendor.push(value);
  });

  var watcher = gulp.watch(vendor, ['build:js:vendor']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });
});

gulp.task('build:css', ['build:css:vendor'], function() {
  return gulp.src(STYLE_DIR + '/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['./node_modules' ],
    })
          .on('error', sass.logError))
    .pipe(gulpif(!flags.production, sourcemaps.write('.')))
    .pipe(gulp.dest(OUTPUT_CSS_DIR))
    .on('error', gutil.log);
});

const VENDOR_CSS = [
  'node_modules/bootstrap/dist/css/bootstrap.css',
  'node_modules/font-awesome/css/font-awesome.css',
  'node_modules/ng2-select/components/css/ng2-select.css',
  'node_modules/nvd3/build/nv.d3.css'
];

gulp.task('build:css:vendor', function() {
  return gulp.src(VENDOR_CSS)
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({debug: true}))
    .pipe(concat('vendor.css'))
    .pipe(gulpif(!flags.production, sourcemaps.write('.')))
    .pipe(gulp.dest(OUTPUT_CSS_DIR))
    .on('error', gutil.log);
});

gulp.task('watch:css', ['build:css'], function() {
  var css = VENDOR_CSS;
  css.push(STYLE_DIR + '/**/*.scss');

  var watcher = gulp.watch(css, ['build:css']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });
});

const ASSETS = {
  fonts: [
    'node_modules/font-awesome/fonts/**/*',
    ASSETS_DIR + '/glyphicons-halflings-regular.eot',
    ASSETS_DIR + '/glyphicons-halflings-regular.ttf',
    ASSETS_DIR + '/glyphicons-halflings-regular.woff2',
    ASSETS_DIR + '/glyphicons-halflings-regular.svg',
    ASSETS_DIR + '/glyphicons-halflings-regular.woff'
  ],
  js: [
    SRC_DIR + '/env.js',
  ],
  css: [
    ASSETS_DIR + '/glyphicons.css'
  ]
};

gulp.task('build:assets', function() {
  _(ASSETS).forEach(function(value, key) {
    console.log('Copying ' + value + ' to ' + OUTPUT_DIR + key);

    gulp.src(value)
      .pipe(gulp.dest(OUTPUT_DIR + key))
      .on('error', gutil.log);
  });
});

gulp.task('watch:assets', ['build:assets'], function() {
  var assets = [];

  _(ASSETS).forEach(function(value, key) {
    _(value).forEach(function(f) {
      assets.push(f);
    });
  });

  var watcher = gulp.watch(assets, ['build:assets']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });
});

gulp.task('build:html', function() {
  return gulp.src(PUG_DIR + '/**/[^_]*.pug')
    .pipe(pug({
      doctype: 'html',
      pretty: !flags.production
    }))
    .on('error', gutil.log)
    .pipe(debug({title: "Stream contents:", minimal: true}))
    .pipe(gulp.dest(OUTPUT_DIR));
});

gulp.task('watch:html', ['build:html'], function() {
  var watcher = gulp.watch(PUG_DIR + '/**/*.pug', ['build:html']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });
});


gulp.task('build', [
  'build:assets',
  'build:css',
  'build:html',
  'build:js',
]);

gulp.task('watch', [
  'watch:assets',
  'watch:css',
  'watch:html',
  'watch:js'
], function() {
  var watcher = gulp.watch('gulpfile.js', ['build']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });
});

gulp.task('dev', ['watch', 'server']);

gulp.task('default', ['build']);

gulp.task('server', function () {
  gulp.src(OUTPUT_DIR)
    .pipe(server({
      host: '0.0.0.0',
      port: 3333,
      log: 'debug',
      fallback: 'index.html',
      open: true,
      livereload: {
        enabled: true,
        port: 35729}
    }));
});
