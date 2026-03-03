# Moroccan Sound Effect

This VS Code extension plays Moroccan sound effects whenever a command succeeds or fails in your integrated terminal.

## Features

- **Auditory Feedback**: Hear immediately when a command succeeds or returns an error.
- **Moroccan Sounds**: Features `rahaa.mp3` for success and `failure.mp3` for errors.
- **Cross-Platform**: Built on VS Code's Webview Engine for robust, cross-platform playback.
- **Customizable**: Enable/disable specific sounds in VS Code settings.

## Getting Started

1. Install the extension.
2. In the Explorer sidebar, find the **Moroccan Sound Engine** panel.
3. Click the **"Click to Enable Audio"** button (required by modern browsers/VS Code to allow playback).
4. Run commands in your terminal:
   - Success plays `rahaa.mp3` 🔊
   - Failure plays `failure.mp3` 🔊

## Settings

- `moroccan.enabled`: Global toggle for sound effects.
- `moroccan.playOnSuccess`: Toggle sound for successful commands.
- `moroccan.playOnFailure`: Toggle sound for failed commands.

## Requirements

- **VS Code 1.80.0** or later.
- **Shell Integration**: Must be enabled in your terminal (enabled by default in modern VS Code).
