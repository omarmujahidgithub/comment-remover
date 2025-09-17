import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const removeAllDisposable = vscode.commands.registerCommand('comment-remover.removeAll', async () => {
        await applyChangesToEditorOrNotebook(text => getCodeWithoutComments(text));
        vscode.window.showInformationMessage('All comments and docstrings removed.');
    });

    const removeHashOnlyDisposable = vscode.commands.registerCommand('comment-remover.removeHashCommentsOnly', async () => {
        await applyChangesToEditorOrNotebook(text => {
            const lines = text.split('\n');
            const finalLines: string[] = [];
            for (const line of lines) {
                if (line.trim().startsWith('#')) {
                    continue;
                }
                finalLines.push(stripHashComment(line));
            }
            return finalLines.join('\n');
        });
        vscode.window.showInformationMessage('Comments removed (docstrings kept).');
    });

    const copyWithoutCommentsDisposable = vscode.commands.registerCommand('comment-remover.copyWithoutComments', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        const activeNotebook = vscode.window.activeNotebookEditor;
        let textToCopy = '';

        if (activeEditor && activeEditor.document.languageId === 'python') {
            textToCopy = getCodeWithoutComments(activeEditor.document.getText());
        } else if (activeNotebook) {
            const selectedCells = getSelectedPythonCells(activeNotebook);
            const cleanedCellContent = selectedCells.map(cell => getCodeWithoutComments(cell.document.getText()));
            textToCopy = cleanedCellContent.join('\n\n# ---- New Cell ----\n\n');
        } else {
            return; 
        }
        
        await vscode.env.clipboard.writeText(textToCopy);
        vscode.window.showInformationMessage('Code copied to clipboard without comments.');
    });

    context.subscriptions.push(
        removeAllDisposable,
        removeHashOnlyDisposable,
        copyWithoutCommentsDisposable
    );
}

async function applyChangesToEditorOrNotebook(transform: (text: string) => string) {
    const activeEditor = vscode.window.activeTextEditor;
    const activeNotebook = vscode.window.activeNotebookEditor;

    if (activeEditor && activeEditor.document.languageId === 'python') {
        const originalText = activeEditor.document.getText();
        const newText = transform(originalText);
        updateEditor(activeEditor, newText);
    } 
    else if (activeNotebook) {
        const selectedCells = getSelectedPythonCells(activeNotebook);
        if (selectedCells.length === 0) return;

        const workspaceEdit = new vscode.WorkspaceEdit();
        for (const cell of selectedCells) {
            const originalText = cell.document.getText();
            const newText = transform(originalText);
            const fullRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(cell.document.lineCount, 0));
            workspaceEdit.replace(cell.document.uri, fullRange, newText);
        }
        await vscode.workspace.applyEdit(workspaceEdit);
    }
}

function getSelectedPythonCells(notebookEditor: vscode.NotebookEditor): vscode.NotebookCell[] {
    if (!notebookEditor.selections || notebookEditor.selections.length === 0) {
        return [];
    }
    const selectedRanges = notebookEditor.selections;
    const selectedCells: vscode.NotebookCell[] = [];
    selectedRanges.forEach(range => {
        const cells = notebookEditor.notebook.getCells(range);
        cells.forEach(cell => {
            if (cell.kind === vscode.NotebookCellKind.Code && cell.document.languageId === 'python') {
                selectedCells.push(cell);
            }
        });
    });
    return selectedCells;
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