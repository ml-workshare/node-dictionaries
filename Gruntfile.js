/*jshint indent: 4, smarttabs: true, maxcomplexity: 6, maxstatements: 25, maxlen: 140 */
/*global module:false */
'use strict';
/**
	@file Gruntfile.js
	@author Brent S.A. Cowgill
	@see {@link module:Gruntfile}
	@description
	Grunt build configuration.

	@example

	# run a single test plan instead of all of them
	grunt test --plan test/app.spec.js

	# auto TDD mode: skip jshint, just run coverage+tests or tests alone
	grunt tdd --watch coverage
	grunt tdd --watch test
 	grunt tdd --watch test --plan test/app.spec.js

	# build all, then watch for changes use the airplane test reporter
	grunt all watcher --reporter landing --force

	# watch file changes to rerun tests and also build the documentation
	grunt watcher --also jsdoc

	# jshint check a single file
	grunt jshint:single --check-file filename.js

	# run tests with a chosen reporter style
	grunt test --reporter spec

	@see {@link http://usejsdoc.org/ JSDoc Documentation}
*/

/**
	Grunt build configuration.
	@module Gruntfile
*/

var _arr, _getOptions, build;

build = function (grunt) {

	var opts = _getOptions(grunt),
		watch = opts.watch,
		coverLimit = opts.coverLimit,
		coverAllLimit = opts.coverAllLimit,
		plans = opts.plans;

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		// Task configuration.
		/**
			clean up files on disk before build.
			@see {@link https://github.com/gruntjs/grunt-contrib-clean About clean grunt plugin}
		*/
		clean: {
			jsdoc: {
				src: ['doc/']
			}
		},
		/**
			jshint validation of javascript code.
			@see {@link https://github.com/gruntjs/grunt-contrib-jshint About jshint grunt plugin}
			@see {@link http://jshint.com/docs/options/ jshint options}
			@see {@link https://github.com/jshint/jshint/blob/master/src/messages.js Warning codes for jshint}
		*/
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				globals: {},
			},
			gruntfile: {
				options: {
					jshintrc: '.jshintrc-gruntfile',
					globals: {}
				},
				src: ['package.json', '.jshintrc*', 'Gruntfile.js', '**/*.json']
			},
			single: {
				// grunt jshint:single --check-file filename
				src: [grunt.option('check-file') || '.jshintrc']
			},
			lib: {
				src: ['app.js', 'bin/www', 'app/**/*.js', 'lib/**/*.js']
			},
			test: {
				options: {
					jshintrc: 'test/.jshintrc',
					globals: {}
				},
				spec: plans, // for coverage
				src: ['test/**/*.js']
			}
		},
		/**
			Running tests in the console using mocha/chai/sinon.
			@see {@link https://github.com/thepeg/grunt-mocha-chai-sinon Grunt plugin for mocha, chai, and sinon}
			@see {@link http://visionmedia.github.io/mocha/ mocha documentation}
			@see {@link http://chaijs.com/api/ chai documentation}
		 	@see {@link http://sinonjs.org/docs/ sinon documentation}
		*/
		'mocha-chai-sinon': {
			test: {
				src: plans,
				options: {
					ui:  '<%= mocha_istanbul.coverage.options.ui %>',
					// spec, list, tap, nyan, progress, dot, min, landing, doc, markdown, html-cov, json-cov, json, json-stream, xunit
					reporter:  '<%= mocha_istanbul.coverage.options.reporter %>',
					bail: false, // true to bail after first test failure
					//grep: '.*', // invert: true, // filter to run subset of tests
					sort: true, // sort order of test files
					trace: true, // trace function calls
					'check-leaks': true, // check for global variable leaks
					'expose-gc': true,
					//timeout: 10, slow: 10, // async ms timeout and slow test threshold
					'inline-diffs': false// show actual/expected diffs inline
				}
			}
		},
		/**
			Generate code coverage reports using istanbul.
			@see {@link https://www.npmjs.com/package/grunt-mocha-istanbul Grunt plugin for mocha istanbul coverage}
			@see {@link http://gotwarlost.github.io/istanbul/ istanbul documentation}
		 	@see {@link https://github.com/nickmerwin/node-coveralls coveralls documentation}
			@see {@link http://tbusser.net/articles/js-unit-testing-part-02/#disqus_thread coverage under the hood}
		 */
		mocha_istanbul: {
			// use your browser to view this url for coverage report
			coverageUrl: '<%= mocha_istanbul.coverage.options.coverageFolder %>/index.html',
			coverage: {
				src: plans,
				options: {
					dryRun: false, // to debug the istanbul command line
					coverageFolder: 'doc/coverage',
					excludes: [],  // use istanbul help cover to see how excludes work
					reportFormats: [
						// html, lcovonly, lcov, cobertura, text-summary, text, teamcity
						'html',
						'text'
					],

					// Mocha options
					reporter: grunt.option('reporter') || 'spec',
					ui: 'bdd',

					// check percentage coverage to be a good build
					check: coverLimit
				}
			},
			coveralls: {
				src: plans,
				options: {
					coverage: true, // this will make the grunt.event.on('coverage') event listener to be triggered
					check: coverAllLimit,
					root: './lib', // define where the cover task should consider the root of libraries that are covered by tests
					reportFormats: ['cobertura','lcovonly']
				}
			}
		},

		/**
			Generate application documentation with jsdoc
			@see {@link https://github.com/krampstudio/grunt-jsdoc Grunt jsdoc plugin}
			@see {@link http://usejsdoc.org/ jsdoc documentation tags}
			@see {@link http://usejsdoc.org/about-commandline.html jsdoc command line options}
		*/
		jsdoc: {
			docs : {
				dest: 'doc',
				src: [
					'test/**/*.js',
					'lib/**/*.js',
					'Gruntfile.js',
					'README.md'
				],
				options: {
					configure: 'jsdoc.conf.json'
				}
			}
		},
		/**
			Watch files and run build targets on change
			@see {@link https://github.com/gruntjs/grunt-contrib-watch Grunt watch plugin}
		*/
		watch: {
			tdd: {
				files: [
					'.jshintignore',
					'<%= jshint.gruntfile.src %>',
					'<%= jshint.lib.src %>',
					'<%= jshint.test.src %>'
				],
				tasks: watch
			},
			all: {
				files: '<%= watch.tdd.files %>',
				tasks: watch
			}
		}
	});

	// These plugins provide necessary tasks.
	[
		'grunt-contrib-clean',
		'grunt-contrib-jshint',
// off for the moment		'grunt-jsdoc',
		'grunt-mocha-chai-sinon',
		'grunt-mocha-istanbul',
		'grunt-contrib-watch'
	].forEach(function (task) {
		grunt.loadNpmTasks(task);
	});

	// Important not to remove this if coveralls.options.coverage:true or grunt will hang
	grunt.event.on('coverage', function (lcovFileContents, done) {
		void lcovFileContents;
		done();
	});

	// Default task.
	grunt.registerTask('default', ['all']);
	grunt.registerTask('all', ['check', 'doc', 'coverage']);
	grunt.registerTask('doc', ['clean:jsdoc' /* off for the moment , 'jsdoc' */]);
	grunt.registerTask('docs', ['doc']);
	grunt.registerTask('test', [
		// hyphens in name make the config section annoying
		// as template lookup with <%= mocha-chai-sinon %> won't work
		'mocha-chai-sinon'
	]);
	grunt.registerTask('tests', ['test']);
	grunt.registerTask('check', [
		'jshint:gruntfile',
		'jshint:lib',
		'jshint:test'
	]);
	grunt.registerTask('checktest', ['check', 'test']);
	grunt.registerTask('checkcover', ['check', 'coverage']);
	grunt.registerTask('tdd', ['watch:tdd']);
	grunt.registerTask('watcher', ['watch:all']);
	grunt.registerTask('coverage', [
		'mocha_istanbul:coverage'
	]);
	grunt.registerTask('coveralls', [
		'mocha_istanbul:coveralls'
	]);
	grunt.registerTask('windows', ['check']);
	grunt.registerTask('single', ['jshint:single']);
};

_getOptions = function (grunt) {
	/* jshint maxcomplexity: 7 */

	var coverLimit = {
			functions:   95,
			branches:    95,
			lines:       95,
			statements:  95
		},
		coverAllLimit =  {
			functions:   90,
			branches:    90,
			lines:       90,
			statements:  90
		},
		plans = _arr(grunt.option('plan') ||
			grunt.option('plans') ||
			['test/**/*.spec.js']),
		also  = _arr(grunt.option('also') || []),
		watch = _arr(grunt.option('watch') ||
			['jshint:gruntfile', 'jshint:lib', 'jshint:test', 'coverage']);

	plans.unshift('test/setup.js');

	if (also.length) {
		watch.push(also);
	}

	// --nocoverfail to prevent coverage from failing the build
	if (grunt.option('nocoverfail'))
	{
		coverLimit = coverAllLimit = {};
	}

	return {
		'plans': plans,
		'watch': watch,
		'coverLimit': coverLimit,
		'coverAllLimit': coverAllLimit
	};
};

_arr = function (thing) {
	if (typeof thing === 'string')
	{
		thing = thing.replace(/,\s*$/, '');
		thing = thing.split(/\s*,\s*/g);
	}
//	console.log('_arr', thing);
	thing = Array.isArray(thing) ? thing : [thing];
	return thing;
};

module.exports = build;
