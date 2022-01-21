# TreeSitterLanguages

Languages for the [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) parser generator wrapped in Swift packages.

## Motivation

There are two reasons this package exists:

1. As an easy way to add several Tree-sitter languages to an app and particularly to an app that uses the [Runestone](https://github.com/simonbs/runestone) framework.
2. To show how a Tree-sitter language can be wrapped in a Swift package.

## Installation

The languages are distributed using the [Swift Package Manager](https://www.swift.org/package-manager/) as separated libraries in a single Swift package. Install the package in your project by adding it as a dependency in your Package.swift manifest or through "Package Dependencies" in your project settings.

**NB:** Adding the package can take a a couple of minutes since it contains a lot of submodules that needs to be cloned.

```swift
let package = Package(
    dependencies: [
        .package(url: "git@github.com:simonbs/TreeSitterLanguages.git", from: "0.1.0")
    ]
)
```

## Usage

The Swift package contains multiple libraries. Each language is wrapped in its own Swift package so you don't need to import a whole suite of languages in case you only need a few.

The package contains the following libraries.

1. TreeSitterLanguagesCommon. This contains base types needed when referring to Tree-sitter. You will only need to import this when explicitly referring to any of Tree-sitter's types, for example when using the TSLanguage type.
2. TreeSitterXYZ where XYZ is a language (e.g. Bash or JavaScript). These packages contain the Tree-sitter language.
3. TreeSitterXYZQueries. These packages contain queries (e.g. highlights) for the language.

The only reason a language and it's queries is in two different packages is that Swift Package Manager doesn't allow mixing C code and Swift code.

## Compatibility

The parser.c file of a language is generated using [tree-sitter-cli](https://github.com/tree-sitter/tree-sitter/blob/master/cli/README.md) and a language generated with one version of the CLI may not be compatible with future versions of Tree-sitter. All languages in this repository are kept compatible with the version of Tree-sitter used by my [Runestone](https://github.com/simonbs/runestone) framework.

## Update Languages

The repository originally contained a submodule for each language's official repository. However, adding this Swift package to a project would entail checking out all repository which took several minutes. Instead the repository now contains copies of select files from each repository.

Running the following command will update all languages by checking out the repository and copying select files into this repository. The repositories and files to be copied is specified in `config.json`.

```bash
node ./scripts/update.js
```

## Acknowledgements

This repository contains files from the following repositories.

- ![tree-sitter-bash](https://github.com/tree-sitter/tree-sitter-bash)
- ![tree-sitter-c](https://github.com/tree-sitter/tree-sitter-c)
- ![tree-sitter-c-sharp](https://github.com/tree-sitter/tree-sitter-c-sharp)
- ![tree-sitter-cpp](https://github.com/tree-sitter/tree-sitter-cpp)
- ![tree-sitter-css](https://github.com/tree-sitter/tree-sitter-css)
- ![tree-sitter-elixir](https://github.com/elixir-lang/tree-sitter-elixir)
- ![tree-sitter-go](https://github.com/tree-sitter/tree-sitter-go)
- ![tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html)
- ![tree-sitter-java](https://github.com/tree-sitter/tree-sitter-java)
- ![tree-sitter-javascript](https://github.com/tree-sitter/tree-sitter-javascript)
- ![tree-sitter-jsdoc](https://github.com/tree-sitter/tree-sitter-jsdoc)
- ![tree-sitter-json](https://github.com/tree-sitter/tree-sitter-json)
- ![tree-sitter-markdown](https://github.com/ikatyang/tree-sitter-markdown)
- ![tree-sitter-ocaml](https://github.com/tree-sitter/tree-sitter-ocaml)
- ![tree-sitter-perl](https://github.com/ganezdragon/tree-sitter-perl)
- ![tree-sitter-php](https://github.com/tree-sitter/tree-sitter-php)
- ![tree-sitter-python](https://github.com/tree-sitter/tree-sitter-python)
- ![tree-sitter-regex](https://github.com/tree-sitter/tree-sitter-regex)
- ![tree-sitter-ruby](https://github.com/tree-sitter/tree-sitter-ruby)
- ![tree-sitter-rust](https://github.com/tree-sitter/tree-sitter-rust)
- ![tree-sitter-swift](https://github.com/alex-pinkus/tree-sitter-swift)
- ![tree-sitter-typescript](https://github.com/tree-sitter/tree-sitter-typescript)
- ![tree-sitter-yaml](https://github.com/ikatyang/tree-sitter-yaml)
- ![nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)
