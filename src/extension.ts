import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const removeAllDisposable = vscode.commands.registerCommand('comment-remover.removeAll', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            return;
        }
        const cleanedText = getCodeWithoutComments(editor.document.getText());
        updateEditor(editor, cleanedText);
        vscode.window.showInformationMessage('All comments and docstrings removed.');
    });

    const removeHashOnlyDisposable = vscode.commands.registerCommand('comment-remover.removeHashCommentsOnly', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            return;
        }
        const fullText = editor.document.getText();
        const lines = fullText.split('\n');
        const finalLines: string[] = [];

        for (const line of lines) {
            if (line.trim().startsWith('#')) {
                continue;
            }
            finalLines.push(stripHashComment(line));
        }
        updateEditor(editor, finalLines.join('\n'));
        vscode.window.showInformationMessage('Comments removed (docstrings kept).');
    });

    const copyWithoutCommentsDisposable = vscode.commands.registerCommand('comment-remover.copyWithoutComments', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            return;
        }
        const cleanedText = getCodeWithoutComments(editor.document.getText());
        
        await vscode.env.clipboard.writeText(cleanedText);
        vscode.window.showInformationMessage('Code copied to clipboard without comments.');
    });

    context.subscriptions.push(
        removeAllDisposable,
        removeHashOnlyDisposable,
        copyWithoutCommentsDisposable
    );
}

function getCodeWithoutComments(fullText: string): string {
    const docstringRegex = /(^\s*"{3}[\s\S]*?"{3})|(^\s*'{3}[\s\S]*?'{3})/gm;
    const textWithoutDocstrings = fullText.replace(docstringRegex, '');

    const lines = textWithoutDocstrings.split('\n');
    const finalLines: string[] = [];
    for (const line of lines) {
        if (line.trim().startsWith('#')) {
            continue;
        }
        finalLines.push(stripHashComment(line));
    }
    return finalLines.join('\n');
}

function stripHashComment(line: string): string {
    let in_single_quote = false;
    let in_double_quote = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === "'" && (i === 0 || line[i - 1] !== '\\')) {
            in_single_quote = !in_single_quote;
        } else if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
            in_double_quote = !in_double_quote;
        }

        if (char === '#' && !in_single_quote && !in_double_quote) {
            return line.substring(0, i).trimEnd();
        }
    }
    return line;
}

function updateEditor(editor: vscode.TextEditor, newText: string) {
    const document = editor.document;
    editor.edit(editBuilder => {
        const fullRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount + 1, 0));
        editBuilder.replace(fullRange, newText);
    });
}

export function deactivate() {}