"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function activate(context) {
    console.log('Moroccan Sound Effect extension is now active!');
    const soundProvider = new SoundPlayerProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('moroccan-sound-player', soundProvider));
    // Register command to manually activate
    context.subscriptions.push(vscode.commands.registerCommand('moroccan.activatePlayer', () => {
        vscode.commands.executeCommand('moroccan-sound-player.focus');
    }));
    // Try to auto-activate the player view after a short delay
    setTimeout(() => {
        vscode.commands.executeCommand('moroccan-sound-player.focus').then(() => {
            console.log('Moroccan Sound Engine initialization triggered.');
        });
    }, 2000);
    const playSound = (soundFileName) => {
        const config = vscode.workspace.getConfiguration('moroccan');
        if (!config.get('enabled', true)) {
            return;
        }
        if (!soundProvider.isReady()) {
            console.log('Sound Engine not ready, attempting to re-initialize...');
            vscode.commands.executeCommand('moroccan-sound-player.focus');
            setTimeout(() => soundProvider.playSound(soundFileName), 1000);
        }
        else {
            soundProvider.playSound(soundFileName);
        }
    };
    // Terminal Success/Failure Sound
    const terminalListener = vscode.window.onDidEndTerminalShellExecution ? vscode.window.onDidEndTerminalShellExecution((event) => __awaiter(this, void 0, void 0, function* () {
        const exitCode = event.exitCode;
        const config = vscode.workspace.getConfiguration('moroccan');
        if (exitCode === 0) {
            if (config.get('playOnSuccess', true)) {
                console.log('Command succeeded. Playing success sound...');
                playSound('rahaa.mp3');
            }
        }
        else if (exitCode !== undefined) {
            if (config.get('playOnFailure', true)) {
                console.log(`Command failed with exit code ${exitCode}. Playing failure sound...`);
                playSound('failure.mp3');
            }
        }
    })) : undefined;
    if (terminalListener) {
        context.subscriptions.push(terminalListener);
    }
    // Manual Trigger Command
    context.subscriptions.push(vscode.commands.registerCommand('moroccan.playSound', (soundName = 'rahaa.mp3') => {
        playSound(soundName);
    }));
}
class SoundPlayerProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
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
        console.log('Webview view resolved.');
    }
    isReady() {
        return !!this._view;
    }
    playSound(soundFileName) {
        if (this._view) {
            // Use path.join and vscode.Uri.file for cross-platform compatibility
            const soundFileOnDisk = vscode.Uri.file(path.join(this._extensionUri.fsPath, 'assets', soundFileName));
            const soundUri = this._view.webview.asWebviewUri(soundFileOnDisk).toString();
            this._view.webview.postMessage({ command: 'play', uri: soundUri });
        }
        else {
            console.error('Sound player view not ready yet.');
        }
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sound Player</title>
    <style>
        body { padding: 10px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; }
        .container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin-top: -20px; }
        .icon { font-size: 40px; margin-bottom: 10px; }
        .title { font-size: 14px; font-weight: 600; margin-bottom: 5px; }
        .description { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 20px; }
        button { 
            background: var(--vscode-button-background); 
            color: var(--vscode-button-foreground); 
            border: none; 
            padding: 8px 16px; 
            cursor: pointer; 
            border-radius: 2px;
            font-size: 13px;
            font-weight: 500;
        }
        button:hover { background: var(--vscode-button-hoverBackground); }
        .status { color: var(--vscode-descriptionForeground); font-size: 11px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔊</div>
        <div class="title">Moroccan Sound Engine</div>
        <div class="description">Enable audio playback for terminal events.</div>
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
            // Unlocks audio context
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
function deactivate() { }
//# sourceMappingURL=extension.js.map