const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const terser = require("gulp-terser");
// create も実行しておく.
const browsersync = require("browser-sync").create();

// sass
function scssTask() {
  // src で scss ファイル読み取り
  return (
    src("./app/scss/style.scss", { sourcemaps: true })
      // sass 関数にパイプ.
      .pipe(sass())
      // post css を呼び出し, css nano を実行.
      .pipe(postcss([cssnano()]))
      // dest 先を指定する. 同じ場所にソースマップ保存.
      .pipe(dest("dest", { sourcemaps: "." }))
  );
}

function jsTask() {
  return (
    // terser で minifier.
    src("app/js/script.js", { sourcemaps: true })
      .pipe(terser())
      .pipe(dest("dest", { sourcemaps: "." }))
  );
}

// サーバーの初期化.
// タスクの終了を明示するためコールバックを呼び出す. done とかで書かれたりもする.
function browsersyncServer(cb) {
  // init で起動.
  browsersync.init({
    server: {
      // どこに index.html(例) があるか伝える.
      baseDir: ".",
    },
  });
  cb();
}

// リロードするたびに新しい関数を作成する必要がある.
function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// 監視.
function watchTask() {
  watch("*.html", browsersyncReload);
  watch(
    ["app/scss/**/*.scss", "app/js/**/*.js"],
    series(scssTask, jsTask, browsersyncReload)
  );
}

// Default gulp task.
// すべての関数を順番に実行.
exports.default = series(scssTask, jsTask, browsersyncServer, watchTask);
