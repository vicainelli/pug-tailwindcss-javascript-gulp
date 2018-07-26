
const paths = require("./package.json").paths;

const gulp = require("gulp");
const concat = require("gulp-concat");
const plumber = require("gulp-plumber");
const pug = require('gulp-pug');
const postcss = require("gulp-postcss");
const purgecss = require("gulp-purgecss");
const tailwindcss = require("tailwindcss");


// Custom extractor for purgeCSS, to avoid stripping classes with `:` prefixes
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}

// compiling tailwind CSS
gulp.task("css", () => {
  return gulp
    .src(paths.src.css + "*.css")
    .pipe(
      postcss([tailwindcss(paths.config.tailwind), require("autoprefixer")])
    )
    .pipe(
      purgecss({
        content: [paths.dist.base + "*.html"],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html", "js"]
          }
        ]
      })
    )
    .pipe(gulp.dest(paths.dist.css));
});


// SCRIPTS
gulp.task('scripts', () => {
  return gulp.src(['./src/js/app.js', './src/js/components/*.js'])
  .pipe(concat('app.js'))
  .pipe(gulp.dest('./dist/js'));
});


// VIEWS
gulp.task('views', () => {
  return gulp.src('./src/views/**/*.pug')
  .pipe(plumber())
  .pipe(pug({}))
  .pipe(gulp.dest('./dist/'))
});

// WATCH
gulp.task('default', function () {
  gulp.watch("./src/views/**/*.pug", ["views"]);
  gulp.watch("./src/js/**/*.js", ["scripts"]);
  gulp.watch(paths.dist.base + "**/*.html", ["css"]);
});