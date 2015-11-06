var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var utf8Convert = require('gulp-utf8-convert');

gulp.task('default', function() {
	return gulp.src('./lib/*.js')
        .pipe(utf8Convert())
    	.pipe(uglify())
    	.pipe(rename({ suffix: '.min' }))
    	.pipe(gulp.dest('lib/'));
});
