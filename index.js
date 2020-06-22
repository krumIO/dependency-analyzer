#!/usr/bin/env node

var fs = require('fs');
var engine = require('php-parser');
var path = require('path');

// initialize a new parser instance
var parser = new engine({
  // some options :
  parser: {
    extractDoc: true,
    php7: true,
    suppressErrors: true,
  },
  ast: {
    withPositions: true
  }
});

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

// Load a static file (Note: this file should exist on your computer)
let getIncludes = (parsed, path) => {
    let includes = [];
    if (parsed.children) {
      parsed.children.forEach((child) => {
          if (child && child.expression && child.expression.kind === 'include') {
            let target = child.expression.target;
            let includePath = '';
            let prefix = '';
            if (target.kind === 'bin') {
              if (
                target &&
                target.left &&
                target.left.what &&
                target.left.what.name === 'dirname') {
                  if (
                    target &&
                    target.left &&
                    target.left.arguments[0] &&
                    target.left.arguments[0].value === '__FILE__') {
                      prefix = path.substring(0, path.lastIndexOf('/'));
                  }
              }
              if (target && target.right && target.right.value) {
                  includePath = target.right.value;
              }
            }
            else if (target.kind === 'variable' || target && target.what && target.what.kind === 'variable') {
                prefix = path.substring(0, path.lastIndexOf('/'));
                includePath = 'VARIABLE';
            }
            else if (target.kind === 'call') {
                if (target && target.arguments[0] && target.arguments[0].value) {
                    prefix = path.substring(0, path.lastIndexOf('/'));
                    includePath = target.arguments[0].value;
                }
            }
            else if (target.value) {
              prefix = path.substring(0, path.lastIndexOf('/'));
              includePath = target.value;
            }
            else {
              includes.push(child.expression);
              return;
            }
            includes.push(prefix + includePath);
          }
          if (child.body) {
              includes = includes.concat(getIncludes(child.body, path));
          }
      });
    }
    else {
      // console.log('expected children for ' + parsed);
    }
    return includes;
}

let includes = [];
walkSync(process.argv[2], (path) => {
  if (path.endsWith('.php')) {
    let phpFile = fs.readFileSync(path);
    try {
      let parsed = parser.parseCode(phpFile);

      let currentFileIncludes = getIncludes(parsed, path);
      includes.push({
        path: path,
        includes: currentFileIncludes,
      });
    }
    catch (error) {
      includes.push({
          path: path,
          includes: ['ERROR'],
      });
    }
  }
});

let nodesSet = new Set();
let edges = [];
includes.forEach((entry) => {
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

fs.writeFileSync('output', JSON.stringify(data, null, 2));