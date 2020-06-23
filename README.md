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
depa
```

This will analyze the current directory for all  <a href="#supported-languages">supported languages</a>.

### Options

```
Options:
  -e, --extensions  Extensions to analyze                              [array] [choices: "php"]
  -d, --directory   Directory to analyze                               [string]
  -o, --output      Output file name (default=output)                  [string]
  -t, --type        Output file format (default=json)                  [string] [choices: "json", "dot"]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean
```

#### Example

Running

```
depa -e php js -d ./myPhpProject/ -o myPhpProjectAnalysis.json -t json
```

will analyze the `./myPhpProject/` directory for `*.php` and `*.js` files and write the output to the `myPhpProjectAnalysis.json` file in the `json` format

*NOTE: `js` is not yet supported.*

## Supported languages

Currently, the only supported language is `php`, but there are plans to support more languages.

## Output

Output is currently either a file with the following JSON-formatted structure:

```
{
    "nodes": [
        <An array of strings representing all of the files involved in the dependency graph>
    ],
    "edges": [
        {
            "source": <A string representing the source file>,
            "target": <A string representing the target/dependency file>
        },
        ...
    ]
}
```

or a `DOT` format file for use with Graphviz.