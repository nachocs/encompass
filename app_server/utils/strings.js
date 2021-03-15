import { chain, isNumber, isString } from 'underscore';

function getFirstCharOfStr(str) {
  if (!isString(str)) {
    return;
  }
  if (str.length === 0) {
    return '';
  }
  return str.charAt(0);
}

// trim leading and trailing whitespaces and also remove excess whitespaces between words
// e.g. 'alex    williams ' -> 'alex williams'
function removeExtraSpacesFromStr(str) {
  if (!isString(str)) {
    return;
  }
  if (str.length === 0) {
    return '';
  }

  let copy = str.slice();
  let trimmed = copy.trim();
  let words = trimmed.split(' ');

  return chain(words)
    .without('')
    .join(' ')
    .value();
}

function getNthWordOfStr(str, n, doRemoveExtraSpaces) {
  if (!isString(str) || !isNumber(n)) {
    return;
  }
  if (str.length === 0) {
    return '';
  }
  let copy = str.slice();

  if (doRemoveExtraSpaces) {
    copy = removeExtraSpacesFromStr(copy);
  }

  let words = copy.split(' ');
  let numWords = words.length;
  let wordIndex = n;

  // if desired word index is greater than num of words, return last word
  if (wordIndex > numWords) {
    wordIndex = numWords;
  }
  return words[wordIndex];
}

// return input string with first letter capitalized
function capitalizeWord(str) {
  if (!isString(str)) {
    // throw Error?
    return;
  }
  if (str.length === 0) {
    return '';
  }
  let copy = str.slice();
  let trimmed = copy.trim();

  let firstLetterCap = trimmed.charAt(0).toUpperCase();

  if (trimmed.length === 1) {
    return firstLetterCap;
  }

  let slicedFrom1 = trimmed.slice(1);
  return firstLetterCap + slicedFrom1;
}

// expects a space delimited string
// returns new string with first letter of each word capitalized
function capitalizeString(str, doRemoveExtraSpaces) {
  if (!isString(str)) {
    // throw error?
    return;
  }
  if (str.length === 0) {
    return '';
  }
  let copy = str.slice();

  if (doRemoveExtraSpaces) {
    copy = removeExtraSpacesFromStr(copy);
  }


  let words = copy.split(' ');

  return chain(words)
    .map(capitalizeWord)
    .join(' ')
    .value();
}

const _getFirstCharOfStr = getFirstCharOfStr;
export { _getFirstCharOfStr as getFirstCharOfStr };
export { _removeExtraSpacesFromStr as removeExtraSpacesFromStr };
export { _getNthWordOfStr as getNthWordOfStr };
export { _capitalizeWord as capitalizeWord };
export { _capitalizeString as capitalizeString };
const _removeExtraSpacesFromStr = removeExtraSpacesFromStr;
const _getNthWordOfStr = getNthWordOfStr;
const _capitalizeWord = capitalizeWord;
const _capitalizeString = capitalizeString;

