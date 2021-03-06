'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


module.exports = AppGenerator;

function AppGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.mainJsFile = '';
}

util.inherits(AppGenerator, yeoman.generators.NamedBase);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  var welcome =
  '\n     _-----_' +
  '\n    |       |' +
  '\n    |'+'--(o)--'.red+'|   .--------------------------.' +
  '\n   `---------´  |    '+'Welcome to Yeoman,'.yellow.bold+'    |' +
  '\n    '+'( '.yellow+'_'+'´U`'.yellow+'_'+' )'.yellow+'   |   '+'ladies and gentlemen!'.yellow.bold+'  |' +
  '\n    /___A___\\   \'__________________________\'' +
  '\n     |  ~  |'.yellow +
  '\n   __'+'\'.___.\''.yellow+'__' +
  '\n ´   '+'`  |'.red+'° '+'´ Y'.red+' `\n';

  console.log(welcome);
  console.log('Out of the box I include HTML5 Boilerplate, jQuery and Modernizr.');

  var prompts = [{
    name: 'compassBootstrap',
    message: 'Would you like to include Twitter Bootstrap for Sass?',
    default: 'Y/n',
    warning: 'Yes: All Twitter Bootstrap files will be placed into the styles directory.'
  },
  {
    name: 'includeRequireHM',
    message: 'Would you like to support writing ECMAScript 6 modules? (requires RequireJS)',
    default: 'Y/n',
    warning: 'Yes: RequireHM will be placed into the JavaScript vendor directory.'
  },
  {
    name: 'includeRequireJS',
    message: 'Would you like to include RequireJS (for AMD support)?',
    default: 'Y/n',
    warning: 'Yes: RequireJS will be placed into the JavaScript vendor directory.'
  }];

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit('error', err);
    }

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.compassBootstrap = (/y/i).test(props.compassBootstrap);
    this.includeRequireJS = (/y/i).test(props.includeRequireJS);
    this.includeRequireHM = (/y/i).test(props.includeRequireHM);

    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('component.json', 'component.json');
  this.install('', function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('\nI\'m all done. Just run ' + 'npm install'.bold.yellow + ' to install the required Node.js dependencies.');
  });
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('favicon.ico', 'app/favicon.ico');
  this.copy('404.html', 'app/404.html');
  this.copy('robots.txt', 'app/robots.txt');
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  if (this.compassBootstrap) {
    this.write('app/styles/main.scss', '@import \'sass-bootstrap/lib/bootstrap\'');
  } else {
    this.write('app/styles/main.css', '');
  }
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  // prepare default content text
  var defaults = ['HTML5 Boilerplate', 'Twitter Bootstrap'];
  var contentText = [
    '        <div class="container" style="margin-top:50px">',
    '            <div class="hero-unit">',
    '                <h1>\'Allo, \'Allo!</h1>',
    '                <p>You now have</p>',
    '                <ul>'
  ];

  if (this.compassBootstrap) {
    // wire Twitter Bootstrap plugins
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      'components/sass-bootstrap/js/bootstrap-affix.js',
      'components/sass-bootstrap/js/bootstrap-alert.js',
      'components/sass-bootstrap/js/bootstrap-dropdown.js',
      'components/sass-bootstrap/js/bootstrap-tooltip.js',
      'components/sass-bootstrap/js/bootstrap-modal.js',
      'components/sass-bootstrap/js/bootstrap-transition.js',
      'components/sass-bootstrap/js/bootstrap-button.js',
      'components/sass-bootstrap/js/bootstrap-popover.js',
      'components/sass-bootstrap/js/bootstrap-typeahead.js',
      'components/sass-bootstrap/js/bootstrap-carousel.js',
      'components/sass-bootstrap/js/bootstrap-scrollspy.js',
      'components/sass-bootstrap/js/bootstrap-collapse.js',
      'components/sass-bootstrap/js/bootstrap-tab.js'
    ]);
  }

  if (this.includeRequireJS) {
    defaults.push('RequireJS');
  }

  if (this.includeRequireHM) {
    defaults.push('Support for ES6 Modules');
  }

  // iterate over defaults and create content string
  defaults.forEach(function (el) {
    contentText.push('                    <li>' + el  +'</li>');
  });

  contentText = contentText.concat([
    '                </ul>',
    '                <p>installed.</p>',
    '                <h3>Enjoy coding! - Yeoman</h3>',
    '            </div>',
    '        </div>',
    ''
  ]);

  // append the default content
  this.indexFile = this.indexFile.replace('<body>', '<body>\n' + contentText.join('\n'));
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
AppGenerator.prototype.requirejs = function requirejs() {
  if (this.includeRequireJS) {
    // wire RequireJS/AMD (usemin: js/amd-app.js)
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/amd-app.js', ['scripts/vendor/require.js'], {
      'data-main': 'scripts/main'
    });

    // add a basic amd module
    this.write('app/scripts/app.js', [
      '/*global define */',
      'define([], function () {',
      '    \'use strict\';\n',
      '    return \'Hello from Yeoman!\';',
      '});'
    ].join('\n'));

    this.mainJsFile = [
      'require.config({',
      '    shim: {},',
      '    paths: {',
      '        jquery: \'vendor/jquery.min\'',
      '    }',
      '});',
      '',
      'require([\'app\'], function (app) {',
      '    \'use strict\';',
      '    // use app here',
      '    console.log(app);',
      '});'
    ].join('\n');
  }
};

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.write('app/index.html', this.indexFile);
  this.write('app/scripts/main.js', this.mainJsFile);
};

AppGenerator.prototype.test = function test() {
  this.mkdir('test');
  this.mkdir('test/spec');
};
