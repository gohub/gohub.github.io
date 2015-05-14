'use strict';
var gulp = require('gulp');
var gls = require('gulp-live-server');

gulp.task('default', function() {
  var server = gls.static('.', 6060);
  server.start();

  gulp.watch(
    [
      '*.html','*.json', '*.md',
      'js/**/*.js', 'js/**/*.css', 
      'css/*.css'
    ],
    server.notify);
});