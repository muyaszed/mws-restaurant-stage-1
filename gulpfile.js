var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var babel = require('gulp-babel');
var pngquant = require('imagemin-pngquant');
var imagemin = require('gulp-imagemin');


gulp.task('dist', [
	'copy-html',
	'copy-images',
	'copy-sw',
	'copy-manifest',
	'styles',
	'scripts-dist'
]);

gulp.task('copy-html', function() {
	gulp.src('./*.html')
		.pipe(gulp.dest('./dist'));
});
gulp.task('copy-sw', function() {
	gulp.src('./sw.js')
		.pipe(gulp.dest('./dist'));
});
gulp.task('copy-manifest', function() {
	gulp.src('./manifest.json')
		.pipe(gulp.dest('./dist'));
});

gulp.task('scripts-dist', function() {
	gulp.src('js/**/*.js')
		.pipe(babel())
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('styles', function() {
	gulp.src('sass/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('dist/css'))

});

gulp.task('copy-images', function() {
	gulp.src('images/*')
		.pipe(imagemin({
			progressive: true,
			use: [pngquant()]
		}))
		.pipe(gulp.dest('dist/images'));
});
