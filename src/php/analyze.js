
const engine = require('php-parser');

module.exports.retrieveDependencies = (file, path) => {
    let ast = parser.parseCode(file);
    return getIncludes(ast, path);
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

const getIncludes = (ast, path) => {
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
      // console.log('expected children for ' + ast);
    }
    return includes;
}