// This file was fully copied from
// https://github.com/msafi/xvsc/blob/master/simpleAutocomplete/src/tokenizer.ts
import escapeRegExp from "escape-string-regexp";

export function* tokenizer(
  str: string,
  wordSeparators: string
): IterableIterator<string> {
  const wordSeparatorsRegExp = new RegExp(
    `[${escapeRegExp(wordSeparators)}\\s]`
  );

  let tokenStartIndex;
  for (let i = 0; i < str.length; i++) {
    const currentCharacter = str[i];
    const currentCharacterIsAWordSeparator = wordSeparatorsRegExp.test(
      currentCharacter
    );

    if (!currentCharacterIsAWordSeparator && tokenStartIndex === undefined) {
      tokenStartIndex = i;
    } else if (
      currentCharacterIsAWordSeparator &&
      tokenStartIndex !== undefined
    ) {
      yield str.slice(tokenStartIndex, i);

      tokenStartIndex = undefined;
    }
  }

  if (tokenStartIndex !== undefined) {
    yield str.slice(tokenStartIndex, str.length);
  }
}
