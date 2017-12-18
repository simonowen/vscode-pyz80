# pyz80 extension for Visual Studio Code

## Features

Z80 assembly syntax colouring, plus a wrapper around Andrew Collier's [pyz80 assembler](https://sourceforge.net/projects/pyz80/) for the SAM Coupé.

For convenient use with small projects the extension includes:

* an updated pyz80 from my [GitHub page](https://github.com/simonowen/pyz80).
* **F10** shortcut to assemble the current source file to a SAM disk image
* **Ctrl-F10** shortcut to run the latest disk image
* **Ctrl-Shift-F10** shortcut to send the latest disk image to a networked SAM
* SAMDOS v2 added as the first file in the generated disk image
* generation of a symbol map file compatible with the SimCoupe v1.1 debugger

Larger projects may prefer the extra flexibility provided by Visual Studio Code build tasks.  

## Requirements

* [Python](https://www.python.org/downloads/) version v2.x or v3.x to assemble code
* [SimCoupe v1.1](https://github.com/simonowen/simcoupe/releases) or later to run and debug code with symbols
* [SAMdisk v4](https://github.com/simonowen/samdisk) or later to send code to a networked SAM fitted with a [Trinity](https://www.samcoupe.com/hardtrin.htm) ethernet interface

If these programs are not in your path you'll need to set the appropriate configuration variables.

## Custom Build Tasks

My own build environment often requires more control over the build process than single module building provides. In those cases I use a Makefile under Linux and Mac, and make.bat under Windows. A parameter to make controls how the program is built and run.

The following tasks.json configuration allows this to be used from Visual Studio Code:

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
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

## Release Notes

### v1.0.0

Initial release.
