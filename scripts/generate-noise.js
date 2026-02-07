/**
 * Generate noise.png texture for background effects
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZE = 200;
const noiseData = Buffer.alloc(SIZE * SIZE * 4);

// Generate random noise pattern
for (let i = 0; i < SIZE * SIZE; i++) {
  const offset = i * 4;
  const value = Math.floor(Math.random() * 256);
  // RGBA values - grayscale noise with varying opacity
  noiseData[offset] = value;     // R
  noiseData[offset + 1] = value; // G
  noiseData[offset + 2] = value; // B
  noiseData[offset + 3] = Math.floor(Math.random() * 100); // A (low opacity)
}

sharp(noiseData, {
  raw: {
    width: SIZE,
    height: SIZE,
    channels: 4
  }
})
  .png()
  .toFile(path.join(__dirname, '../public/noise.png'))
  .then(() => {
    console.log('✅ noise.png generated successfully in public/');
  })
  .catch(err => {
    console.error('Error generating noise.png:', err);
    process.exit(1);
  });
