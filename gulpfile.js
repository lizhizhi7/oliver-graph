const {src, dest} = require("gulp");

function defaultTask(cb) {
    // place code for your default task here
    return src(["./src/**/*.css"])     // Source file
        .pipe(dest("./dist"));
}

exports.default = defaultTask;
