import { Position, Range, TextEditor } from "vscode";
import { tokenizer } from "./tokenizer";

function findNeedleInHaystack(needle: string, haystack: string) {
  const lineWordGenerator = tokenizer(
    haystack,
    "./()\"'-:,.;<>~!@#$%^&*|+=[]{}~?"
  );

  let next = lineWordGenerator.next();

  while (!next.done) {
    if (next.value.startsWith(needle)) {
      return next.value;
    }

    next = lineWordGenerator.next();
  }
  return null;
}

function* lineSequence({ document }: TextEditor, wordRange: Range) {
  const currentLine = wordRange.end.line;
  const firstLine = document.lineAt(currentLine).text;

  yield firstLine.substring(wordRange.end.character);

  for (let i = 1; i < document.lineCount; i++) {
    yield document.lineAt((i + currentLine) % document.lineCount).text;
  }

  yield firstLine.substring(0, wordRange.start.character);
}

// if (completion !== null) {

// }

export class HippieComplete {
  searchableLines?: Generator<string>;
  searchingWord: string | null = null;

  async tryCompleteNext(editor: TextEditor) {
    const wordRange = editor.document.getWordRangeAtPosition(
      editor.selection.active
    );

    if (!wordRange) {
      return;
    }

    const wordAtPoint = editor.document.getText(wordRange);

    if (
      !this.searchableLines ||
      !this.searchingWord ||
      !wordAtPoint.startsWith(this.searchingWord)
    ) {
      this.searchableLines = lineSequence(editor, wordRange);
      this.searchingWord = wordAtPoint;
    }

    let searchable = this.searchableLines.next();
    while (!searchable.done) {
      const line = searchable.value;

      const match = findNeedleInHaystack(
        this.searchingWord.toLowerCase(),
        line.toLowerCase()
      );

      if (match) {
        await editor.edit((editBuilder) => {
          const { selection, document } = editor;
          const wordRange = document.getWordRangeAtPosition(selection.end);

          if (wordRange) {
            editBuilder.delete(wordRange);
          }

          editBuilder.insert(selection.end, match);
        });
        return;
      } else {
        searchable = this.searchableLines.next();
      }
    }

    // it's done and no matches were found, match original word an reset the generator
    await editor.edit((editBuilder) => {
      const { selection, document } = editor;
      const wordRange = document.getWordRangeAtPosition(selection.end);

      if (wordRange) {
        editBuilder.delete(wordRange);
      }

      if (this.searchingWord) {
        editBuilder.insert(selection.end, this.searchingWord);
      }
    });

    this.searchableLines = lineSequence(editor, wordRange);
  }
}
