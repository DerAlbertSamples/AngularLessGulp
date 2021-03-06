
var gulp = require('gulp');
var path = require('path');
var ignore = require('gulp-ignore');
var less = require('gulp-less');
var typescript = require('gulp-typescript');
var inject = require('gulp-inject');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync');
var ngAnnotate = require('gulp-ng-annotate');
var sync = require('gulp-sync')(gulp);
var del = require('del');
var util = require('gulp-util');

var config = {
	'site' : './source',
	'assets' : './source/assets',
	'app' : './source/app/',	
	'injectFiles' : './source/index.html',
	'bowerComponents': './bower_components',

	'typescript' : {
		removeComments: false,
		target: 'ES5',
		noExternalResolve: false,
		noImplicitAny: false
	},
	'typings' : './typings'
}

gulp.task('clean-app', function(cb) {
	del([
		path.join(config.app, "**/*.css"),
		path.join(config.app, "**/*.map"),
		path.join(config.app, "**/*.js")
		], cb)
});

gulp.task('clean-assets', function(cb) {
	del([path.join(config.assets,"**/*")], cb);
})


gulp.task('copy-assets', ['clean-assets'], function() {
	return gulp.src(mainBowerFiles(), 
		{ 'base': config.bowerComponents })
	.pipe(gulp.dest(config.assets));
});

gulp.task('inject-files', function() {
	var assetsFiles = [
		path.join(config.assets, "angular/*"),
		path.join(config.assets, "bootstrap/dist/css/bootstrap.css"),
		path.join(config.assets, "**/*"),
	];

	var appFiles = [
		path.join(config.app, "common/**/*"),
		path.join(config.app, "modules/**/*"),
		path.join(config.app, "*"),
		path.join(config.site, "css/*")
	];

	var appStream = gulp.src(appFiles, { 'base' : config.site});
	var assetsStream = gulp.src(assetsFiles, { 'base' : config.site});

	return gulp.src(config.injectFiles)
	.pipe(inject(assetsStream, { name: 'assets', ignorePath: config.site.substring(2), relative:false}))
	.pipe(inject(appStream, { name: 'app', ignorePath: config.site.substring(2), relative:false}))
	.pipe(gulp.dest(config.site));
});

var tsProject = typescript.createProject(config.typescript);
gulp.task('compile-ts', function() {

	var typescriptFiles = [
		path.join(config.app, "**/*.ts"),
		path.join(config.typings, "**/*.ts")
		];

	return gulp.src(typescriptFiles)
	.pipe(typescript(tsProject))
	.pipe(ngAnnotate())
	.pipe(gulp.dest(config.app));
});

gulp.task('watch-ts', ['compile-ts'], function() {
	var watcher = gulp.watch("**/*.ts", { cwd : config.app, read:false, debounceDelay: 50 }, ['compile-ts']);
	watcher.on('change', function (e) {
		if (e.type == "deleted") {
			var file = util.replaceExtension(e.path, ".*");
			del(file);
		}
	});
});

gulp.task('compile-less', function() {
	return gulp.src(path.join(config.site, "**/*.less"), {base: config.site})
	.pipe(less())
	.pipe(gulp.dest(config.site));
});

gulp.task('watch-less', ['compile-less'], function() {
	var watcher = gulp.watch("**/*.less", { cwd : path.join(config.site, "css"), read: false, debounceDelay: 50 }, ['compile-less']);
	watcher.on('change', function (e) {
		if (e.type == "deleted") {
			var file = util.replaceExtension(e.path, ".*");
			del(file);
		}
	});
});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: config.site
        },
        files: [
	        "**/*.js",
	        "**/*.css",
	        "**/*.html"
        ],
        watchOptions: {
            debounceDelay: 100,
            cwd: config.site
        },
        logFileChanges: false
    });
});

gulp.task('watch-inject-files', ['inject-files'], function () {
    var files = ["**/*.js", "**/*.css"];
    var watcher = gulp.watch(files, {cwd: config.site, read: false});
    var timeout;
    watcher.on('change', function (e) {
        if (e.type == "deleted" || e.type == "added") {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                timeout = undefined;
                gulp.start('inject-files');
            }, 300);
        }
    });
});

gulp.task('live-edit',
    sync.sync(
        [
            ['watch-ts', 'watch-less'],
            'watch-inject-files',
            'browser-sync'
        ], "live-edit"
    )
);
