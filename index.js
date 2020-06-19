var fs = require('fs');
var engine = require('php-parser');

// initialize a new parser instance
var parser = new engine({
  // some options :
  parser: {
    extractDoc: true,
    php7: true
  },
  ast: {
    withPositions: true
  }
});

// Load a static file (Note: this file should exist on your computer)
var phpFile = fs.readFileSync( './test.php' );
let parsed = parser.parseCode(phpFile);
let getIncludes = (parsed) => {
    let includes = [];
    parsed.children.forEach((child) => {
        if (child.expression && child.expression.kind === 'include') {
            includes.push(child.expression);
        }
        if (child.body) {
            includes = includes.concat(getIncludes(child.body));
        }
    });
    return includes;
}

let file1Includes = getIncludes(parsed);

console.log(file1Includes);