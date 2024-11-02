# pyz80 extension for Visual Studio Code

## Features

Z80 assembly syntax colouring, plus a wrapper around Andrew Collier's pyz80 assembler for the SAM Coupé.

For convenient use with small projects the extension includes:

* the latest pyz80 from my [GitHub page](https://github.com/simonowen/pyz80).
* **F10** shortcut to assemble Z80 source code to a SAM disk image.
* **Ctrl-F10** shortcut to assemble and run the disk image in SimCoupe.
* **Ctrl-Shift-F10** shortcut to assemble and send to a networked SAM Coupé.
* SAMDOS v2 added as the first file in the generated disk image to make it bootable.
* generation of a symbol map file compatible with the SimCoupe v1.1+ debugger.

## Additional Requirements

* [Python](https://www.python.org/downloads/) version v3.6 or later to run the pyz80 assembler.
* [SimCoupe](https://simonowen.com/simcoupe) v1.1 or later to run and debug code with symbols.
* [SAMdisk](https://github.com/simonowen/samdisk/releases/tag/20220725) v4 or later to send code to a networked SAM running TrinLoad.

If these programs are not already in your path you will need to set the appropriate configuration settings.

## Tips

Some settings are better overridden in the workspace settings rather than the user settings. This gives per-project control over settings such as mainsource, prebuild, postbuild, etc. Any settings that expect paths can also use just a filename relative to the workspace, improving code portability. You don't _have_ to use a workspace and can continue to open and assemble stand-alone source files but there are many benefits.

If your project is spread across multiple source files it may help to configure the main source file name in the settings, ensuring it is assembled even if it's not the active source file in the editor. The default behaviour is to assemble the active source file, which may be one of the include files.

The prebuild and postbuild settings can be useful to prepare graphics data, package the output disk image, etc. Each setting is a shell command including arguments, so take care to add double quotes where appropriate. More complex projects may still prefer the flexibility provided by Visual Studio Code build tasks, as detailed below.

There is _BASENAME_ keyword substitution applied to the extraopts, prebuild and postbuild options. Any use is replaced by the basename of the main source module. For example, if your source file is called _myfile.asm_, any instances of _BASENAME_ will be replaced by _myfile_. This can help manage different file types related to the main files, including generating additional output files from the assembler.

## Custom Build Tasks

Some build environments require more control than this extension can provide. You may want to use a custom Makefile under Linux and macOS, and make.bat under Windows, with some settings passed through on the command-line.

The following tasks.json configuration allows this to be used from Visual Studio Code:

```json
{
    "version": "2.0.0",
    "options": {
        "env": {
            "PYZ80": "${config:pyz80.path}",
            "PYTHON": "${config:pyz80.python}",
            "SIMCOUPE": "${config:pyz80.simcoupe}",
            "SAMDISK": "${config:pyz80.samdisk}"
        }
    },
    "tasks": [
        {
            "label": "Build",
            "type": "shell",
            "command": "make",
            "windows": {
                "command": "./make"
            },
            "args": [],
            "problemMatcher": [
                "$pyz80"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        },
        {
            "label": "Build and SimCoupe",
            "type": "shell",
            "command": "make",
            "windows": {
                "command": "./make"
            },
            "args": [
                "run"
            ],
            "problemMatcher": [
                "$pyz80"
            ]
        },
        {
            "label": "Build and TrinLoad",
            "type": "shell",
            "command": "make",
            "windows": {
                "command": "./make"
            },
            "args": [
                "net"
            ],
            "problemMatcher": [
                "$pyz80"
            ]
        }
    ]
}
```

These build tasks can then be bound to keyboard shortcuts in keybindings.json:

```json
[
    { "key": "f5", "command": "workbench.action.tasks.runTask", "args": "Build and SimCoupe", "when": "editorLangId == pyz80" },
    { "key": "ctrl-f5", "command": "workbench.action.tasks.runTask", "args": "Build and TrinLoad", "when": "editorLangId == pyz80" }
]
```

You'll still need to provide the guts of the Makefile/make.bat process, of course!

## License

The pyz80 assembler and SAMDOS2 binary are distributed under the terms of the GNU General Public License version 2.  
The rest of the Visual Studio Code extension is distributed under the MIT License.

## Links

[Extension Source Code](https://github.com/simonowen/vscode-pyz80)  
[Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=simonowen.pyz80)  
