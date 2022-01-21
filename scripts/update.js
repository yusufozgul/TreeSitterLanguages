#!/usr/bin/node
"use strict"
const os = require("os")
const path = require("path")
const fs = require("fs")
const { execSync } = require("child_process")

const tmpDirPath = createTemporaryDirection()
const config = loadConfig()
for (let i = 0; i < config.repositories.length; i++) {
  const repository = config.repositories[i]
  const repositoryDirName = repositoryDirectoryName(repository.name)
  const repositoryDirPath = path.join(tmpDirPath, repositoryDirName)
  console.log("Cloning " + repository.name + "...")
  cloneRepository(repository.name, repositoryDirPath)
  if (repository.runTreeSitterGenerate === true) {
    runTreeSitterGenerate(repositoryDirPath)
  }
  processTargets(repository.targets, repositoryDirPath)
}
fs.rmdirSync(tmpDirPath, { recursive: true })

function createTemporaryDirection() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "TreeSitterLanguages-"))
}

function loadConfig() {
  const filePath = path.join(__dirname, "..", "config.json")
  const tmp = JSON.parse(fs.readFileSync(filePath))
  let config = { repositories: [] }
  for (let repository of tmp.repositories) {
    let targets = repository.targets
    if (targets != null && Array.isArray(targets)) {
      config.repositories.push(repository)
    } else if (targets != null && targets.baseName != null && targets.treeSitterFunctionName != null) {
      repository.targets = standardTargetsConfig(targets.baseName, targets.treeSitterFunctionName)
      config.repositories.push(repository)
    } else {
      throw new Error("Invalid configuration for repository: " + JSON.stringify(repository))
    }
  }
  return config
}

function standardTargetsConfig(baseName, treeSitterFunctionName) {
  return [{
    name: baseName,
    files: [{
      filePath: "src/parser.c",
      sourceFilePath: "src/parser.c"
    }, {
      filePath: "src/scanner.cc",
      sourceFilePath: "src/scanner.cc"
    }, {
      filePath: "src/tree_sitter",
      sourceFilePath: "src/tree_sitter"
    }, {
      filePath: "include/public.h",
      template: "public.h",
      variables: {
        name: treeSitterFunctionName
      }
    }]
  }, {
    name: baseName + "Queries",
    files: [{
      filePath: "queries",
      sourceFilePath: "queries"
    }, {
      filePath: "Query.swift",
      template: "Query.swift",
      scannedDirectoryPath: "queries"
    }]
  }]
}

function repositoryDirectoryName(repositoryName) {
  const components = repositoryName.split("/")
  return components[components.length - 1]
}

function cloneRepository(name, repositoryDirPath) {
  const url = "git@github.com:" + name + ".git"
  execSync("rm -rf " + repositoryDirPath + " && mkdir " + repositoryDirPath + " && cd " + repositoryDirPath + " && git clone --quiet " + url + " .")
}

function runTreeSitterGenerate(dirPath) {
  console.log("Running `tree-sitter generate` in " + dirPath)
  execSync("cd " + dirPath + " && npm install && tree-sitter generate")
}

function processTargets(targets, repositoryDirPath) {
  for (let j = 0; j < targets.length; j++) {
    const target = targets[j]
    for (let k = 0; k < target.files.length; k++) {
      const targetDirPath = path.join(__dirname, "..", "Sources", target.name)
      processFile(repositoryDirPath, targetDirPath, target.files[k])
    }
  }
}

function processFile(repositoryDirPath, targetDirPath, file) {
  const fullDestinationFilePath = path.join(targetDirPath, file.filePath)
  if ("template" in file) {
    execSync("rm -rf " + fullDestinationFilePath)
    if (file.template == "Query.swift") {
      if (file.scannedDirectoryPath != null) {
        const queriesDirPath = path.join(targetDirPath, file.scannedDirectoryPath)
        const filenames = fs.readdirSync(queriesDirPath)
        const fileContents = loadFilledOutQuerySwiftTemplate(file.template, filenames)
        ensureDirectoriesExist(fullDestinationFilePath)
        fs.writeFileSync(fullDestinationFilePath, fileContents)
      } else {
        throw new Error("Query.swift template must specify scannedDirectoryPath")
      }
    } else {
      const fileContents = loadFilledOutTemplate(file.template, file.variables)
      ensureDirectoriesExist(fullDestinationFilePath)
      fs.writeFileSync(fullDestinationFilePath, fileContents)
    }
  } else if (file.sourceFilePath != null) {
    const sourceFilePath = path.join(repositoryDirPath, file.sourceFilePath)
    if (fs.existsSync(fullDestinationFilePath)) {
      execSync("rm -rf " + fullDestinationFilePath)
    }
    if (fs.existsSync(sourceFilePath)) {
      ensureDirectoriesExist(fullDestinationFilePath)
      execSync("cp -r " + sourceFilePath + " " + fullDestinationFilePath)
    }
  } else {
    throw new Error("Missing sourceFilePath in file: " + JSON.stringify(file))
  }
}

function ensureDirectoriesExist(filePath) {
  execSync("mkdir -p " + path.dirname(filePath))
}

function loadFilledOutQuerySwiftTemplate(templateName, filenames) {
  let sources = []
  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i]
    const fileExtension = ".scm"
    if (filename.endsWith(".scm")) {
      const rawFilename = filename.slice(0, filename.length - fileExtension.length)
      const paramName = rawFilename.split("-").map((word, index) => {
        if (index == 0) {
          return word.toLowerCase()
        } else {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }
      }).join('')
      let source = `    public static var ${paramName}FileURL: URL {
        return url(named: "${rawFilename}")
    }`
    sources.push(source)
    }
  }
  const templateString = loadTemplate(templateName)
  return templateString.replace("{{SOURCE}}", sources.join("\n\n"))
}

function loadFilledOutTemplate(templateName, variables) {
  let templateString = loadTemplate(templateName)
  if (variables != null) {
    const variableNames = Object.keys(variables)
    for (let i = 0; i < variableNames.length; i++) {
      const variableName = variableNames[i]
      const variablePlaceholder = "{{" + variableName.toUpperCase() + "}}"
      const variableValue = variables[variableName]
      templateString = templateString.replace(variablePlaceholder, variableValue)
    }
  }
  return templateString
}

function loadTemplate(templateName) {
  const filePath = path.join(__dirname, "templates", templateName)
  return fs.readFileSync(filePath, "utf8")
}
