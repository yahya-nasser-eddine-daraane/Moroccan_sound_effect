import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Moroccan Sound Effect extension is now active!');

    const soundProvider = new SoundPlayerProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('moroccan-sound-player', soundProvider)
    );

    // Register command to manually activate
    context.subscriptions.push(
        vscode.commands.registerCommand('moroccan.activatePlayer', () => {
            vscode.commands.executeCommand('moroccan-sound-player.focus');
        })
    );

    // Attempt to auto-focus the player view so the user sees the "Unlock" button
    const triggerFocus = () => {
        if (!soundProvider.isReady()) {
            vscode.commands.executeCommand('moroccan-sound-player.focus').then(() => {
                console.log('Moroccan Sound Engine focus requested.');
            });
        }
    };

    // Trigger shortly after startup
    setTimeout(triggerFocus, 2000);

    const playSound = (soundFileName: string) => {
        const config = vscode.workspace.getConfiguration('moroccan');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        if (!soundProvider.isReady()) {
            console.log('Sound Engine not ready, attempting to focus view...');
            vscode.commands.executeCommand('moroccan-sound-player.focus');
            // Wait slightly for the view to initialize
            setTimeout(() => {
                if (soundProvider.isReady()) {
                    soundProvider.playSound(soundFileName);
                } else {
                    vscode.window.showWarningMessage('Please open the "Moroccan Sound Engine" view in the explorer to enable sounds.');
                }
            }, 1000);
        } else {
            soundProvider.playSound(soundFileName);
        }
    };

    // Terminal Success/Failure Sound
    const terminalListener = vscode.window.onDidEndTerminalShellExecution ? vscode.window.onDidEndTerminalShellExecution(async (event) => {
        const exitCode = event.exitCode;
        const config = vscode.workspace.getConfiguration('moroccan');

        console.log(`Terminal execution ended with code: ${exitCode}`);

        if (exitCode === 0) {
            if (config.get<boolean>('playOnSuccess', true)) {
                playSound('rahaa.mp3');
            }
        } else if (exitCode !== undefined) {
            if (config.get<boolean>('playOnFailure', true)) {
                playSound('failure.mp3');
            }
        }
    }) : undefined;

    if (terminalListener) {
        context.subscriptions.push(terminalListener);
    }

    // Manual Trigger Command
    context.subscriptions.push(
        vscode.commands.registerCommand('moroccan.playSound', (soundName: string = 'rahaa.mp3') => {
            playSound(soundName);
        })
    );
}

class SoundPlayerProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'log':
                    console.log(`[Webview Log] ${message.text}`);
                    break;
                case 'error':
                    console.error(`[Webview Error] ${message.text}`);
                    break;
            }
        });

        console.log('Moroccan Webview view resolved.');
    }

    public isReady(): boolean {
        return !!this._view;
    }

    public playSound(soundFileName: string) {
        if (this._view) {
            const soundFileOnDisk = vscode.Uri.file(path.join(this._extensionUri.fsPath, 'assets', soundFileName));
            const soundUri = this._view.webview.asWebviewUri(soundFileOnDisk).toString();
            this._view.webview.postMessage({ command: 'play', uri: soundUri });
        } else {
            console.error('Sound player view not ready yet.');
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sound Player</title>
    <style>
        body { 
            padding: 10px; 
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            text-align: center; 
        }
        .container { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 80vh; 
        }
        .icon { font-size: 48px; margin-bottom: 12px; }
        .title { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
        .description { font-size: 12px; margin-bottom: 20px; opacity: 0.8; }
        button { 
            background: var(--vscode-button-background); 
            color: var(--vscode-button-foreground); 
            border: none; 
            padding: 8px 16px; 
            cursor: pointer; 
            border-radius: 2px;
            font-weight: 500;
        }
        button:hover { background: var(--vscode-button-hoverBackground); }
        .status { margin-top: 12px; font-size: 11px; opacity: 0.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔊</div>
        <div class="title">Moroccan Sound Engine</div>
        <div class="description">Required to play sounds in this session.</div>
        <button id="activate-btn">Click to Enable Audio</button>
        <div id="status" class="status">Waiting for interaction...</div>
    </div>
    <audio id="audio-player"></audio>
    <script>
        const vscode = acquireVsCodeApi();
        const audio = document.getElementById('audio-player');
        const btn = document.getElementById('activate-btn');
        const status = document.getElementById('status');

        btn.addEventListener('click', () => {
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                btn.style.display = 'none';
                status.innerText = 'Audio System Enabled ✅';
                vscode.postMessage({ command: 'log', text: 'Audio unlocked.' });
            }).catch(e => {
                vscode.postMessage({ command: 'error', text: 'Unlock failed: ' + e.message });
            });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'play') {
                audio.src = message.uri;
                audio.currentTime = 0;
                audio.play().then(() => {
                    vscode.postMessage({ command: 'log', text: 'Playing: ' + message.uri });
                }).catch(e => {
                    vscode.postMessage({ command: 'error', text: 'Playback failed: ' + e.message });
                });
            }
        });
    </script>
</body>
</html>`;
    }
}

export function deactivate() { }
