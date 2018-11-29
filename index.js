const fs = require('fs');
const __ = require('lodash');
const PackageTests = require('./lib/packageTests');

const spinner = ['|', '/', '-', '\\'];

class Scanner {
  constructor() {
    this.folderCount = 0;
    this.fileCount = 0;
    this.counter = 0;
    this.results = [];
    this.packageTests = new PackageTests();
  }

  runTests(path) {
    const contents = fs.readFileSync(path, 'utf8');
    const shortPath = path.replace('./node_modules/', '');
    const result = this.packageTests.run(contents.toString());
    if (Object.keys(result).length !== 0) {
      this.results.push({
        path: path,
        shortPath: shortPath,
        result: result
      });
    }
  }

  walk(path) {
    fs.readdirSync(path)
    .forEach((file) => {
      const fullPath = `${path}/${file}`;
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (this.folderCount !== 0) {
          process.stdout.write('\b');
        }
        process.stdout.write('O');
        this.folderCount++;
        this.counter = 0;
        // Skip Test folders
        if (file !== 'test') {
          this.walk(fullPath);
        }
      } else if (file.substr(0,1) !== '.' && file.substr(-3) === '.js') {
        if (this.counter !== 0) {
          process.stdout.write('\b');
        }
        process.stdout.write(`${spinner[this.counter % 4]}`);
        this.counter++;
        this.fileCount++;
        this.runTests(fullPath);
      }
    });
  }

  reset() {
    this.results = [];
  }

  shortenStringLength(str, len) {
    if (str.length > len) {
      return `${str.substr(0,len - 3)}...`;
    } else {
      return str;
    }
  }

  run() {
    process.stdout.write('Progress:');
    this.walk(`./node_modules`);
    console.log('');
    console.log(`Scanned ${this.folderCount} folders, ${this.fileCount} files.`);
    if (this.results.length === 0) {
      console.log('No Suspsected Files');
    } else {
      console.log(`Found ${this.results.length} suspicious files.`)
      console.log('\nReport\n===============');
      __.forEach(this.results, (value) => {
        console.log(`${value.shortPath}`);
        __.forEach(value.result, (inner, key) => {
          console.log(`    ${key} found ${inner.length} suspicious entries`);
          for (let itr = 0; itr < inner.length; itr++) {
            if (itr <= 2) {
              console.log(`        ${this.shortenStringLength(inner[itr], 45)}`);
            } else if (itr === 3){
              console.log(`        ...and ${inner.length - 3} others`);
            }
          }
        });
      })
    }
  }
}

const scanner = new Scanner();
scanner.run();
