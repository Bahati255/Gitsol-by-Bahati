// GitSol: VS Code Extension for GitHub Repository Integration

const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand('gitsol.createAndPushRepo', async function () {
    const folderUri = await vscode.window.showOpenDialog({ canSelectFolders: true, openLabel: 'Select Project Folder' });
    if (!folderUri) return;
    const projectPath = folderUri[0].fsPath;

    const repoName = await vscode.window.showInputBox({ prompt: 'GitHub Repository Name' });
    const githubToken = await vscode.window.showInputBox({ prompt: 'GitHub Token', password: true });

    if (!repoName || !githubToken) {
      vscode.window.showErrorMessage('Repository name and token are required.');
      return;
    }

    try {
      const userResp = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${githubToken}` }
      });

      const username = userResp.data.login;

      const repoResp = await axios.post(
        'https://api.github.com/user/repos',
        { name: repoName },
        { headers: { Authorization: `token ${githubToken}` } }
      );

      const repoUrl = repoResp.data.clone_url;
      const terminal = vscode.window.createTerminal('GitSol');
      terminal.show();
      terminal.sendText(`cd "${projectPath}"`);
      terminal.sendText('git init');
      terminal.sendText('git add .');
      terminal.sendText('git commit -m "Initial commit"');
      terminal.sendText(`git remote add origin ${repoUrl}`);
      terminal.sendText('git branch -M main');
      terminal.sendText('git push -u origin main');

      vscode.window.showInformationMessage(`Repository '${repoName}' created and pushed to GitHub!`);
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};