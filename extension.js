'use strict';
const vscode = require('vscode');

function activate(context) {
    const disk_ext = '.dsk';
    const cmd_prefix = process.platform === 'win32' ? '&' : '';
    const path = require('path');
    let terminal = undefined;

    function replaceKeywords(str) {
        const source = path.parse(getSourceFilePath());
        str = str.replace(/\bBASENAME\b/, source.name);
        return str;
    }

    function getSourceFilePath() {
        const config = vscode.workspace.getConfiguration('pyz80');
        let srcPath = vscode.window.activeTextEditor.document.uri.fsPath;

        if (config.mainfile) {
            const mainfile = path.parse(config.mainfile);
            const curWorkspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(srcPath));
            const baseDir = mainfile.dir || curWorkspace?.uri?.fsPath || path.dirname(srcPath);

            srcPath = path.join(baseDir, mainfile.base);
        }

        return srcPath;
    }

    function getCdCommand() {
        const sourcePath = getSourceFilePath();
        const sourceDir = path.dirname(sourcePath);
        return `cd "${sourceDir}"`;
    }

    function getPrebuildCommand() {
        const config = vscode.workspace.getConfiguration('pyz80');
        return replaceKeywords(config.prebuild);
    }

    function getPostbuildCommand() {
        const config = vscode.workspace.getConfiguration('pyz80');
        return replaceKeywords(config.postbuild);
    }

    function getBuildCommand() {
        const config = vscode.workspace.getConfiguration('pyz80');
        const source = path.parse(getSourceFilePath());
        const mapFile = `${source.name}.map`;
        const samdosPath = config.samdos || context.asAbsolutePath('lib/samdos2');
        const pythonPath = config.python || vscode.workspace.getConfiguration('python')?.defaultInterpreterPath || 'python';
        const pyz80Path = config.path || context.asAbsolutePath('lib/pyz80.py');
        const extraOpts = replaceKeywords(config.extraopts) || '';

        return `"${pythonPath}" "${pyz80Path}" "-I" "${samdosPath}" "--mapfile=${mapFile}" ${extraOpts} "${source.base}"`;
    }

    function getRunCommand() {
        const config = vscode.workspace.getConfiguration('pyz80');
        const source = path.parse(getSourceFilePath());
        const diskFile = `${source.name}${disk_ext}`;
        let cmd = config.simcoupe ? `"${config.simcoupe}"` : 'simcoupe';

        if (process.platform === 'win32') {
            cmd = config.simcoupe ? `"${config.simcoupe}"` : 'Start-Process SimCoupe.exe';
        } else if (process.platform === 'darwin') {
            cmd = config.simcoupe ? `open "${config.simcoupe}"` : `open -a "SimCoupe"`;
        }

        return `${cmd} "${diskFile}"`;
    }

    function getNetCommand() {
        const config = vscode.workspace.getConfiguration('pyz80');
        const source = path.parse(getSourceFilePath());
        const diskFile = `${source.name}${disk_ext}`;
        const samdiskPath = config.samdisk || 'samdisk';

        return `"${samdiskPath}" "${diskFile}" "trinity:"`;
    }

    function autoSaveModified() {
        const config = vscode.workspace.getConfiguration('pyz80');
        if (config.autosave) {
            vscode.workspace.textDocuments.forEach((document) => {
                if (document.isDirty && !document.isUntitled) {
                    document.save();
                }
            });
        }
    }

    function runTerminalCommands(...commands) {
        if (!terminal) {
            // Force PowerShell under Windows in case user has changed default shell to Command Prompt.
            terminal = vscode.window.createTerminal('pyz80', process.platform === 'win32' ? 'powershell.exe' : undefined);
        }
        terminal.show(true);

        let cmd = '';
        for (let i=0; i < commands.length; i++) {
            if (commands[i]) {
                if (cmd.length === 0) {
                    cmd = `${cmd_prefix} ${commands[i]}`;
                } else if (process.platform === 'win32') {
                    cmd += ` ; if ($?) { ${cmd_prefix} ${commands[i]} }`; // Needed for older PowerShell
                } else {
                    cmd += ` && ${commands[i]}`;
                }
            }
        }

        terminal.sendText(cmd);
    }

    vscode.window.onDidCloseTerminal((closedTerminal) => {
        if (closedTerminal === terminal) {
            terminal = null;
        }
    });

    context.subscriptions.push(vscode.commands.registerCommand('pyz80.build', () => {
        autoSaveModified();
        runTerminalCommands(getCdCommand(), getPrebuildCommand(), getBuildCommand(), getPostbuildCommand());
    }));

    context.subscriptions.push(vscode.commands.registerCommand('pyz80.run', () => {
        autoSaveModified();
        runTerminalCommands(getCdCommand(), getPrebuildCommand(), getBuildCommand(), getPostbuildCommand(), getRunCommand());
    }));

    context.subscriptions.push(vscode.commands.registerCommand('pyz80.net', () => {
        autoSaveModified();
        runTerminalCommands(getCdCommand(), getPrebuildCommand(), getBuildCommand(), getPostbuildCommand(), getNetCommand());
    }));
}
exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;
