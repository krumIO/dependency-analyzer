
const engine = require('php-parser');
const path = require('path');

module.exports.retrieveDependencies = (file, filepath) => {
    let ast = parser.parseCode(file);
    return getIncludes(ast, filepath);
};

// initialize a new parser instance
const parser = new engine({
    // some options :
    parser: {
      extractDoc: false,
      php7: true,
      suppressErrors: true,
    },
    ast: {
      withPositions: true
    }
  });

const getIncludes = (ast, filepath) => {
    let includes = [];
    if (ast.children) {
      ast.children.forEach((child) => {
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
                      prefix = filepath.substring(0, filepath.lastIndexOf('/'));
                  }
              }
              if (target && target.right && target.right.value) {
                  includePath = target.right.value;
              }
            }
            else if (target.kind === 'variable' || target && target.what && target.what.kind === 'variable') {
                prefix = filepath.substring(0, filepath.lastIndexOf('/'));
                includePath = '/VARIABLE';
            }
            else if (target.kind === 'call') {
                if (target && target.arguments[0] && target.arguments[0].value) {
                    prefix = filepath.substring(0, filepath.lastIndexOf('/'));
                    includePath = target.arguments[0].value;
                }
            }
            else if (target.value) {
              prefix = filepath.substring(0, filepath.lastIndexOf('/'));
              includePath = target.value;
            }
            else {
              includes.push(child.expression);
              return;
            }
            if (includePath[0] !== '/') {
                includePath = '/' + includePath;
            }
            let finalPath = path.normalize(prefix + includePath);
            includes.push(finalPath);
          }
          if (child.body) {
              includes = includes.concat(getIncludes(child.body, filepath));
          }
      });
    }
    else {
      // console.log('expected children for ' + ast);
    }
    return includes;
}