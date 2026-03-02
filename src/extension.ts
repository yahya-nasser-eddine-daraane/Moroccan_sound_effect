import * as vscode from 'vscode';
import * as path from 'path';
const player = require('sound-play');

export function activate(context: vscode.ExtensionContext) {
    console.log('Antigravity Sound Effects is now active!');

    const playSound = (soundFileName: string) => {
        const soundPath = path.join(context.extensionPath, 'assets', soundFileName);
        player.play(soundPath).catch((err: any) => {
            console.error(`Error playing sound: ${err}`);
        });
    };

    // 1. Keystroke Sound
    let keystrokeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        // Only play if there's a change (typing)
        if (event.contentChanges.length > 0) {
            playSound('type.mp3');
        }
    });

    // 2. Save Sound
    let saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
        playSound('save.mp3');
    });

    // 3. Antigravity Trigger Command
    let playCommand = vscode.commands.registerCommand('antigravity.playSound', (soundName: string = 'notify.mp3') => {
        playSound(soundName);
    });

    context.subscriptions.push(keystrokeListener, saveListener, playCommand);
}

export function deactivate() {}
