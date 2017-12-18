'use strict';
const vscode = require("vscode");

function activate(context) {
    const path = require('path');
    let terminalStack = [];

    /* Experimental!
    vscode.languages.registerHoverProvider('pyz80', {
        provideHover(document, position, token) {
            // Experimental!
            const details = [
                ["EX AF,AF'", '', '08', '4'],
                ["EX DE,HL'", '', 'EB', '4'],
                ["EXX", '', 'D9', '4'],
                ["XOR r", 'xor [bcdehla]', '10101111 (??|??|??|??|??|??|AF)', '4'],
                ["PUSH qq", 'push (af|bc|de|hl)', '11qq0101 (BC=C5, DE=D5, HL=E5, AF=F5)', '11'],
                ["POP qq", 'pop (af|bc|de|hl)', '11qq0001 (C1|D1|E1|F1)', '10']
            ];

            let line = vscode.window.activeTextEditor.document.lineAt(position.line).text;
            line = line.replace(/^\w+:?/, '');
            line = line.replace(/;.*$/, '');
            line = line.replace(/\s+/g, ' ');
            line = line.trim();

            for (let i = 0; i < details.length; ++i) {
                if (line.match(new RegExp('^' + (details[i][1] || details[i][0]) + '$', "i"))) {
                    let md = new vscode.MarkdownString();
                    md.isTrusted = true;
                    md.appendCodeblock(details[i][0] + "\n\n", "pyz80");
                    md.appendMarkdown("Timing: " + details[i][3] + "T\n\n");
                    md.appendMarkdown("Opcode: " + details[i][2] + "\n\n");
                    return new vscode.Hover(md);
                }
            }

            return null;
        }
    });
    */

    context.subscriptions.push(vscode.commands.registerCommand('pyz80.build', () => {
        let config = vscode.workspace.getConfiguration('pyz80');
        let filePath = vscode.window.activeTextEditor.document.fileName.toString();
        let mapPath = filePath.replace(/\.[^.]+$/, '') + ".map";
        let pythonPath = config.python || "${config:python.pythonPath}" || "python";
        let pyz80Path = config.path || context.asAbsolutePath('lib/pyz80.py');
        let samdosPath = context.asAbsolutePath('lib/samdos2');
        let cmd = pythonPath + ' ' +
            '"' + pyz80Path + '"' + ' ' +
            '-I ' + '"' + samdosPath + '"' + ' ' +
            '--mapfile=' + '"' + mapPath + '"' + ' ' +
            '"' + filePath + '"';
        getTerminal().sendText(cmd);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('pyz80.run', () => {
        let config = vscode.workspace.getConfiguration('pyz80');
        let filePath = vscode.window.activeTextEditor.document.fileName.toString();
        let diskPath = filePath.replace(/\.[^.]+$/, '') + ".dsk";
        let simcoupePath = config.simcoupe || "simcoupe";
        let cmd = simcoupePath + ' ' +
            '"' + diskPath + '"';
        getTerminal().sendText(cmd);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('pyz80.trinity', () => {
        let config = vscode.workspace.getConfiguration('pyz80');
        let filePath = vscode.window.activeTextEditor.document.fileName.toString();
        let diskPath = filePath.replace(/\.[^.]+$/, '') + '.dsk';
        let samdiskPath = config.samdisk || 'samdisk';
        let cmd = samdiskPath + ' ' +
            '"' + diskPath + '"' + ' ' +
            '"' + 'trinity:' + '"';
        getTerminal().sendText(cmd);
    }));

    function getTerminal() {
        if (terminalStack.length === 0) {
            terminalStack.push(vscode.window.createTerminal(`pyz80 #${terminalStack.length + 1}`));
        }
        let term = terminalStack[terminalStack.length - 1];
        term.show(true);
        return term;
    }

    if ('onDidCloseTerminal' in vscode.window) {
        vscode.window.onDidCloseTerminal((terminal) => {
            terminalStack.pop();
        });
    }
    if ('onDidOpenTerminal' in vscode.window) {
        vscode.window.onDidOpenTerminal((terminal) => {
            terminalStack.length + 1;
        });
    }
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;
