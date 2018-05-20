/* jshint esversion: 6 */

const
	gulp = require('gulp'),
	gls = require('gulp-live-server');

gulp.task('default', function() {
	var server = gls.static('.', 6060);
	server.host = '0.0.0.0';
	server.start();

	gulp.watch(
		[
			'*.html', '*.json', '*.md',
			'js/**/*.js', 'js/**/*.css',
			'css/*.css'
		],
		server.notify);
});