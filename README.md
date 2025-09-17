# Python Comment Remover
A powerful and simple VS Code extension to instantly remove comments and docstrings from your Python files and Jupyter Notebook (.ipynb) code cells. Clean up your code for presentation, analysis, or to get rid of unwanted AI-generated comments with a single command.

## Features
This extension provides three distinct commands to give you full control over your code's comments:

🧹 Remove All Comments & Docstrings: A total clean-up. This command strips every # comment and """...""" docstring from the active Python file, leaving only functional code. (Ctrl+Alt+/)

✨ Remove Comments (Keep Docstrings): A surgical removal. This command removes all # comments (both full-line and inline) but intelligently preserves your important function and class docstrings. (Ctrl+Alt+I)

📋 Copy Without Comments & Docstrings: A clipboard-ready command. This cleans the entire file by removing all comments and docstrings and then copies the result directly to your clipboard without modifying the open file. (Ctrl+Alt+C)

    Note: You can now also use these commands on code cells within Jupyter Notebook files (.ipynb) directly from VS Code. 

## Demonstration
Here’s a quick look at the "Remove All" command in action.

Before:

Python

    """
    This module processes customer data.
    It should be removed entirely.
    """

    # Class for processing user data
    class DataProcessor:
    '''This class docstring should also be removed.'''
        def load_data(self, source):
            # Load data from the specified source
            data = source.get() # This is an inline comment
            return data
After:


    class DataProcessor:
        def load_data(self, source):
            data = source.get()
            return data
## Usage
You can access the commands via the command palette (Ctrl+Shift+P), the editor's right-click context menu, or the keyboard shortcuts.

Command	Description	Default Shortcut
Remove All Comments & Docstrings	Removes every comment (#) and docstring ("""...""").	Ctrl+Alt+/

Remove Comments (Keep Docstrings)	Removes only # comments, preserving function docstrings.	Ctrl+Alt+I

Copy Without Comments & Docstrings	Copies the cleaned code to the clipboard.	Ctrl+Alt+C

## Release Notes
### 1.0.0
    Initial release of Python Comment Remover.

    Added "Remove All Comments & Docstrings" command.

    Added "Remove Comments (Keep Docstrings)" command.

    Added "Copy Without Comments & Docstrings" command.
### 1.0.2
    Added .ipynb code cells support based on my friend's Nour recommendation.

## Contributing
Found a bug or have a feature request? Please open an issue on the GitHub repository, or contact me on omar.mujahid.github@gmail.com

## License
This extension is licensed under the MIT License.