# dependency-analyzer

## Manual Installation

From the root directory of the project, run:
```
npm install
```

To be able to run this tool outside of the project directory, run:
```
npm link
```

## How to use

To generally analyze a project's internal dependency structure, run:

```
// analyze the current directory for all supported languages
depa
```

### Options

```
Options:
  -e, --extensions  Extensions to analyze                              [array]
  -d, --directory   Directory to analyze                               [string]
  -o, --output      Output file name (default=output)                  [string]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```

#### Example

Running

```
depa -e php js -d ./myPhpProject/ -o myPhpProjectAnalysis.json
```

will analyze the `./myPhpProject/` directory for `*.php` and `*.js` files and write the output to the `myPhpProjectAnalysis.json` file.

*NOTE: `js` is not yet supported.*

### Supported languages

Currently, the only supported language is `php`, but there are plans to support more languages.