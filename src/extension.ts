import * as vscode from "vscode";
import { HippieComplete } from "./hippie-complete";

const hc = new HippieComplete();

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand(
    "hippieComplete.next",
    (textEditor, edit, args) => {
      hc.tryCompleteNext(textEditor);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
