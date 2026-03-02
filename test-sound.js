const player = require('sound-play');
const path = require('path');

const soundPath = path.join(__dirname, 'assets', 'rahaa.mp3');
console.log('Attempting to play:', soundPath);

player.play(soundPath)
    .then(() => console.log('Playback finished!'))
    .catch((err) => console.error('Error:', err));
