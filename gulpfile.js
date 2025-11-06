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

gulp.task('copy-html-assets', function() {
    // Selects ALL necessary files:
    // 1. **/*.html (all HTML files, including root index.html)
    // 2. css/**/*.css (all compiled CSS)
    // 3. js/**/*.js (all minified JS)
    // 4. images/**/* (assuming you have an images folder)
    return gulp.src([
        '**/*.html',
        'css/**/*.css',
        'js/**/*.js',
        'images/**/*'
    ], {
        // The base option is critical: it tells Gulp to preserve the folder
        // structure relative to the root of your project.
        base: './'
    })
        .pipe(gulp.dest('dist')); // <-- THIS CREATES THE 'dist' FOLDER
});

gulp.task('build',
    gulp.series(
        gulp.parallel('sass', 'minify-js'), // Step 1: Compile assets
        'copy-html-assets'                  // Step 2: Move everything to 'dist'
    )
);

// default task
gulp.task('default', gulp.series('sass', 'minify-js'));