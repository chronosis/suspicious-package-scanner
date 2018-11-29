
class PackageTests {
  constructor() {
  }

  run(content) {
    const results = {};
    const C = Object.getPrototypeOf(this);
    Object.getOwnPropertyNames(C)
      .filter((prop) => {
        return ((typeof this[prop] === 'function') && prop !== 'constructor' && prop !== 'run');
       })
       .forEach((prop) => {
         const testValue = this[prop](content);
         if (testValue) {
           results[prop] = testValue;
         }
       });
    return results;
  }

  // Add new content tests below this point they should be of the form
  // testName(content) { ... } and return false when they pass and have no matches.
  // and an array of matches when they fail
  possibleByteCode(content) {
    const byteCodeRegEx = /['"`]([0-9a-f]{2}){4,}['"`]/gmi;
    const onlyNumbersRegEx = /['"`][1-9][0-9]{2,}['"`]/g;
    const sequenceRegEx = /['"`](0123456789|0124356789)['"`]/g;

    if (!byteCodeRegEx.test(content)) {
      return false;
    } else {
      // Bits 32, 48, 64, 80, 96, 128, 160, 192, 224, 256, 320, 384, 512, 640, 768, 1024
      const validLengths = [ 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256 ];
      const matches = content.match(byteCodeRegEx)
        .filter((match) => {
          const length = (match.length - 2);
          const byteLength = length / 2;
          // Check if its only numeric values
          const numberCheck = onlyNumbersRegEx.test(match);
          // Check if its only numeric values
          const sequenceCheck = sequenceRegEx.test(match);
          // Check that the string is a non-even length
          const evenLengthCheck = ((length % 2) === 0);
          // Check that the count of hex bytes is even
          const validHexLengthCheck = ((byteLength % 2) === 0);
          // Check that its a valid bitdepth for common hex encoded values
          const bitDepthCheck = validLengths.includes(length);

          return !(numberCheck || sequenceCheck || (evenLengthCheck && validHexLengthCheck && bitDepthCheck));
        });
      if (!matches || matches.length === 0) {
        return false;
      }
      return matches;
    }
  }

  longUnicodeString(content) {
    const unicodeRegEx = /(\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F]{2}){6,}/mg;
    if (!unicodeRegEx.test(content)) {
      return false;
    } else {
      const matches = content.match(unicodeRegEx);
      if (!matches || matches.length === 0) {
        return false;
      }
      return matches;
    }
  }
}

module.exports = PackageTests;
