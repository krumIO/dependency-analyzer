const fs = require('fs');
const path = require('path');


const { retrieveDependencies : getPHPDependencies } = require('./php/analyze');

module.exports.retrieveDependenciesFromDirectory = (root, extensions, output) => {
    const dependencies = [];

    let extensionNumMap = {};
    let numFilesAnalyzed = 0;

    walkSync(root, (filepath) => {
        let currentDependencies;

        const extension = path.extname(filepath);
        if (extensions && extensions.length > 0) {
            if (!extensions.includes(extension.substring(1))) {
                return;
            }
        }
        switch (extension) {
            case '.php':
                const phpFile = fs.readFileSync(filepath);
                try {
                    currentDependencies = getPHPDependencies(phpFile, filepath);
                }
                catch (err) {
                    currentDependencies = ['ERROR'];
                }

                numFilesAnalyzed++;
                extensionNumMap[extension] = extensionNumMap[extension] ? extensionNumMap[extension] + 1 : 1;
                break;
            case '':
                //file has no extension
                break;
            default:
                // extension is undefined
                break;
        }

        if (currentDependencies) {
            process.stdout.cursorTo(0);
            process.stdout.write("Analyzing... Files analyzed: " + numFilesAnalyzed);
            dependencies.push({
                path: filepath,
                includes: currentDependencies,
                extension: extension,
            });
        }
    });
    process.stdout.write("\n\nExtensions analyzed:");
    for (key in extensionNumMap) {
        process.stdout.write("\n\t" + key + ":\t" + extensionNumMap[key]);
    }
    process.stdout.write("\n");

    buildOutput(dependencies, output);
}

const walkSync = (dir, callback) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
    var filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
        walkSync(filepath, callback);
    } else if (stats.isFile()) {
        callback(filepath, stats);
    }
    });
};

const buildOutput = (dependencies, output) => {
    let nodesSet = new Set();
    let edges = [];
    dependencies.forEach((entry) => {
        nodesSet.add(entry.path);
        entry.includes.forEach((include) => {
            edges.push({
                source: entry.path,
                target: include,
            });
            nodesSet.add(include)
        })
    })
    let nodes = Array.from(nodesSet);

    let data = {
        nodes: nodes,
        edges: edges,
    };

    fs.writeFileSync(output, JSON.stringify(data, null, 2));
}