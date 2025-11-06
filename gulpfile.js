'use strict';
const opener = require('open');
const open = opener.default || opener;
var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// compile scss to css
gulp.task('sass', function () {
    return gulp.src('./sass/styles.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({basename: 'styles.min'}))
        .pipe(gulp.dest('./css'));
});

// watch changes in scss files and run sass task
gulp.task('sass:watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
});

// minify js
gulp.task('minify-js', function () {
    return gulp.src('./js/scripts.js')
        .pipe(uglify())
        .pipe(rename({basename: 'scripts.min'}))
        .pipe(gulp.dest('./js'));
});

// --- ADD THIS NEW TASK ---
gulp.task('start', function() {
    // Define the path to your index.html file
    const filePath = 'index.html';

    // Use the correctly defined open function
    return open(filePath);
});

// Add this to your gulpfile.js:

// Define the 'build' task to run both compilation steps
// Replace the old task (which was likely failing on line 42) with this:
gulp.task('build',
    // The second argument must be a function.
    // Use gulp.parallel() to run sass and minify-js at the same time.
    gulp.parallel('sass', 'minify-js')
);

// default task
gulp.task('default', gulp.series('sass', 'minify-js'));