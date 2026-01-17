const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for Expo
const sizes = {
  'icon.png': 1024,
  'adaptive-icon.png': 1024,
  'favicon.png': 48,
  'splash-icon.png': 200,
};

// Colors matching the app theme
const BACKGROUND_COLOR = '#1a1a1a';
const PRIMARY_COLOR = '#FF6B35'; // Orange accent
const TEXT_COLOR = '#FFFFFF';

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background with rounded corners effect (for main icon)
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, size, size);

  // Add subtle gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'rgba(255, 107, 53, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 107, 53, 0.05)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw calendar icon shape
  const padding = size * 0.15;
  const calendarWidth = size - (padding * 2);
  const calendarHeight = calendarWidth * 0.85;
  const calendarX = padding;
  const calendarY = padding + (size - calendarHeight - padding * 2) / 2;
  const cornerRadius = size * 0.08;

  // Calendar body
  ctx.fillStyle = '#2a2a2a';
  roundRect(ctx, calendarX, calendarY + size * 0.08, calendarWidth, calendarHeight - size * 0.08, cornerRadius);
  ctx.fill();

  // Calendar header (orange bar)
  ctx.fillStyle = PRIMARY_COLOR;
  roundRectTop(ctx, calendarX, calendarY + size * 0.08, calendarWidth, size * 0.12, cornerRadius);
  ctx.fill();

  // Calendar rings/hooks
  const ringWidth = size * 0.03;
  const ringHeight = size * 0.08;
  const ringY = calendarY;
  ctx.fillStyle = '#666666';

  // Left ring
  roundRect(ctx, calendarX + calendarWidth * 0.25 - ringWidth/2, ringY, ringWidth, ringHeight, ringWidth/2);
  ctx.fill();

  // Right ring
  roundRect(ctx, calendarX + calendarWidth * 0.75 - ringWidth/2, ringY, ringWidth, ringHeight, ringWidth/2);
  ctx.fill();

  // Draw "SC" text
  const fontSize = size * 0.28;
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText('SC', size / 2, calendarY + calendarHeight * 0.6);

  // Small calendar dots to represent days
  const dotSize = size * 0.025;
  const dotSpacing = size * 0.06;
  const dotsStartX = size / 2 - dotSpacing * 1.5;
  const dotsY = calendarY + calendarHeight * 0.85;

  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 1 ? PRIMARY_COLOR : '#555555';
    ctx.beginPath();
    ctx.arc(dotsStartX + i * dotSpacing, dotsY, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'assets', filename);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${filename} (${size}x${size})`);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function roundRectTop(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Generate all icons
console.log('Generating app icons...\n');
Object.entries(sizes).forEach(([filename, size]) => {
  generateIcon(size, filename);
});
console.log('\nDone! Icons saved to assets/');
