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

(function(global) {

  var paths = {
    'npm:': 'node_modules/',
    'caos/': './dist/'
  };

  // map tells the System loader where to look for things
  var map = {
    'caos/': './dist/',
    'rxjs': './node_modules/rxjs',
    'reflect-metadata': './node_modules/reflect-metadata',

    'ngx-bootstrap': './node_modules/ngx-bootstrap',
    'moment': './node_modules/moment',
    'primeng': './node_modules/primeng',
    'd3': './node_modules/d3',
    'mathjs': './node_modules/mathjs',
    'nvd3': './node_modules/nvd3',
    'ng2-nvd3': './node_modules/ng2-nvd3'
  };

  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'caos': {
      main: 'bootstrap.js',
      defaultExtension: 'js'
    },

    'reflect-metadata': {
      main: 'Reflect.js',
      defaultExtension: 'js'
    },

    'rxjs': {
      main: 'bundles/Rx.umd.js',
      defaultExtension: 'js'
    },

    'moment': {
      main: 'min/moment-with-locales.js',
      defaultExtension: 'js'
    },

    'd3': {
      main: 'd3.js',
      defaultExtension: 'js',
      format: 'global'
    },

    'mathjs': {
      main: 'dist/math.js',
      defaultExtension: 'js',
      format: 'global'
    },

    'nvd3': {
      main: 'build/nv.d3.js',
      defaultExtension: 'js',
      format: 'global'
    },

    'ng2-nvd3': {
      main: 'build/lib/ng2-nvd3.js',
      defaultExtension: 'js'
    },

    'ngx-bootstrap': {
      format: 'cjs',
      main: 'bundles/ngx-bootstrap.umd.js',
      defaultExtension: 'js'
    },

    'primeng': {
      main: 'primeng.js',
      defaultExtension: 'js'
    },

  };

  var angular_pkgs = [
    'animations',
    'common',
    'compiler',
    'core',
    'forms',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router'
  ];

  angular_pkgs.forEach(function(pkgName) {
    map['@angular/' + pkgName] = 'npm:@angular/' + pkgName + '/bundles/' + pkgName + '.umd.js';
  });

  map['@angular/platform-browser/animations'] = 'npm:@angular/platform-browser/bundles/platform-browser-animations.umd.js';
  map['@angular/animations/browser'] = 'npm:@angular/animations/bundles/animations-browser.umd.js';

  var config = {
    transpiler: false,
    map: map,
    packages: packages,
    paths: paths
  };

  // filterSystemConfig - index.html's chance to modify config before we register it.
  if (global.filterSystemConfig) { global.filterSystemConfig(config); }

  System.config(config);
})(this);
