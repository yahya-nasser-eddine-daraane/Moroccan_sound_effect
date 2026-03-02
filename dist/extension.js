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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const player = require('sound-play');
function activate(context) {
    console.log('Moroccan Sound Effects is now active!');
    const playSound = (soundFileName) => {
        const soundPath = path.join(context.extensionPath, 'assets', soundFileName);
        player.play(soundPath).catch((err) => {
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
    // 3. Moroccan Trigger Command
    let playCommand = vscode.commands.registerCommand('moroccan.playSound', (soundName = 'rahaa.mp3') => {
        playSound(soundName);
    });
    // 4. Keyboard Shortcut / Command Sound Fallback
    // Since onDidExecuteCommand is not public, we play a sound on common "action" keys
    context.subscriptions.push(vscode.commands.registerCommand('type', (args) => {
        // Intercept typing to play sound, then execute default type command
        playSound('type.mp3');
        return vscode.commands.executeCommand('default:type', args);
    }));
    // 5. Error Sound (Failure)
    let diagnosticListener = vscode.languages.onDidChangeDiagnostics((event) => {
        const uri = event.uris[0];
        if (uri) {
            const diags = vscode.languages.getDiagnostics(uri);
            if (diags.some(d => d.severity === vscode.DiagnosticSeverity.Error)) {
                playSound('failure.mp3');
            }
        }
    });
    // 6. Terminal Success/Failure Sound
    let terminalListener = vscode.window.onDidEndTerminalShellExecution ? vscode.window.onDidEndTerminalShellExecution(event => {
        if (event.exitCode === 0) {
            playSound('rahaa.mp3');
        }
        else {
            playSound('failure.mp3');
        }
    }) : undefined;
    context.subscriptions.push(keystrokeListener, saveListener, playCommand, diagnosticListener);
    if (terminalListener) {
        context.subscriptions.push(terminalListener);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map