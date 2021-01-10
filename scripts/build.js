/* eslint-disable @typescript-eslint/no-var-requires */
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

const binDir = path.join(process.cwd(), "node_modules", ".bin");
const distDir = path.join(process.cwd(), "dist");

if (fs.existsSync(distDir)) {
    console.log("Deleting ./dist");
    fs.rm(distDir, {
        force: true,
        recursive: true,
    }, (err) => {
        if (err)
            return console.error(err);
        runTsc();
    });
} else {
    runTsc();
}

function runTsc() {
    console.log("Running typescript");
    child_process.exec(
        path.join(binDir, "tsc"),
        (err) => {
            if (err)
                console.error(err);
        }
    );
}
