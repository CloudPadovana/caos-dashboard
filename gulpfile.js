////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2016, 2017 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// Author: Fabrizio Chiarello <fabrizio.chiarello@pd.infn.it>
//
////////////////////////////////////////////////////////////////////////////////

const gulp = require('gulp');

const _ = require('lodash');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const inject = require('gulp-inject-string');
const sass = require('gulp-sass');
const server = require('gulp-server-livereload');
const sourcemaps = require('gulp-sourcemaps');
const system_builder = require('systemjs-builder');
const ts = require('gulp-typescript');
const tslint = require("gulp-tslint");
const uglify = require('gulp-uglify');

const SRC_DIR = './src';
const SRC_APP_DIR = SRC_DIR + '/app';
const SRC_ASSETS_DIR = SRC_DIR + '/assets';
const SRC_STYLE_DIR = SRC_DIR + '/style';

const OUTPUT_DIR = './output/';
const OUTPUT_JS_DIR = OUTPUT_DIR + 'js/';
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

gulp.task('build:js', function() {
  if (flags.production) {
    var js_builder_opts = { sourceMaps: false, lowResSourceMaps: false, minify: true };
  } else {
    var js_builder_opts = { sourceMaps: true,
                            sourceMapContents: true,
                            lowResSourceMaps: false,
                            minify: false,
                            mangle: false,
                            globalDefs: { DEBUG: true }
                          };
  }

  js_builder.invalidate('caos/*');

  var js_entrypoints = [
    'reflect-metadata/Reflect',
    'caos/bootstrap'
  ].join(' + ');

  return gulp.src([SRC_APP_DIR + '/**/*.ts'])
    .pipe(gulpif(flags.production,
                 inject.replace('// INJECT PRODUCTION CODE',
                                "import { enableProdMode } from '@angular/core'; enableProdMode();")))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(ts_project(ts.reporter.fullReporter()))
    .on('error', function (error) {
      //console.log('Typescript compilation exited with ' + error);
    }).js
    // .pipe(debug({title: "Stream contents:", minimal: true}))
    .pipe(gulpif(flags.production, uglify()))
    .pipe(gulpif(!flags.production, sourcemaps.write('.')))
    .pipe(gulp.dest(DIST_DIR))
    .on('end', function () {
      js_builder.bundle(js_entrypoints,
                        OUTPUT_JS_DIR + 'bundle.js',
                        js_builder_opts)
        .then(function() {
          console.log('Build complete');
        })
        .catch(function(err) {
          console.log('JS builder compilation exited with ' + err);
        });
    });
});

gulp.task('watch:js', ['build:js'], function() {
  var watcher = gulp.watch(['./systemjs.config.js',
                            SRC_APP_DIR + '/**/*.ts'], ['build:js']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });
});

gulp.task('build:css', function() {
  if (flags.production) {
    var sass_opts = {
      includePaths: ['./node_modules' ],
      outputStyle: 'compressed'
    };
  } else {
    var sass_opts = {
      includePaths: ['./node_modules' ],
      outputStyle: 'nested'
    };
  }

  return gulp.src(SRC_STYLE_DIR + '/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sass_opts)
          .on('error', sass.logError))
    .pipe(gulpif(!flags.production, sourcemaps.write('.')))
    .pipe(gulp.dest(OUTPUT_CSS_DIR))
    .on('error', gutil.log);
});

gulp.task('watch:css', ['build:css'], function() {
  var watcher = gulp.watch(SRC_STYLE_DIR + '/**/*.scss', ['build:css']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });
});

const ASSETS = {
  fonts: [
    'node_modules/font-awesome/fonts/**/*',
  ],
  js: [
    SRC_DIR + '/env.js',
  ],
  'js/vendor': [
    'node_modules/core-js/client/shim.min.js',
    gulpif(!flags.production, 'node_modules/core-js/client/shim.min.js.map'),
    'node_modules/zone.js/dist/zone.min.js',
    'node_modules/systemjs/dist/system.js',
    gulpif(!flags.production, 'node_modules/systemjs/dist/system.js.map')
  ],
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

gulp.task('build', [
  'build:assets',
  'build:css',
  'build:js',
]);

gulp.task('watch', [
  'watch:assets',
  'watch:css',
  'watch:js'
], function() {
  var watcher = gulp.watch('gulpfile.js', ['build']);

  watcher.on('change', function (event) {
    console.log('Event ' + event.type + ' on path: ' + event.path);
  });
});

gulp.task("tslint", [], () => {
  return gulp.src([SRC_APP_DIR + '/**/*.ts'])
    .pipe(tslint())
    .pipe(tslint.report({
      emitError: true,
      allowWarnings: true,
      summarizeFailureOutput: true
    }));
});

gulp.task('dev', ['watch', 'server']);

gulp.task('default', ['build']);

gulp.task('server', ['build'], function () {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  gulp.src(OUTPUT_DIR)
    .pipe(server({
      host: '0.0.0.0',
      port: 3333,
      log: 'debug',
      fallback: 'index.html',
      open: true,
      https: true,
      livereload: {
        enable: true,
        port: 35729},
      proxies: [{
        source: '/api/v1',
        //target: 'http://10.0.2.2:4000/api/v1',
        target: 'http://172.17.0.1:4000/api/v1',
        //target: 'https://10.0.2.2:4000/testing/api/v1',
        options: {
          headers: {
            'Access-Control-Allow-Origin': '*'}}
      }]}));
});
