# 🎮 Color Flow - Puzzle Game

A fun, addictive color-connecting puzzle game that works on all devices and can be monetized easily.

🎯 **[Play Live Demo](https://your-project.vercel.app)**

## Features

✨ **Gameplay**
- Connect matching colors to fill the grid
- Progressively harder levels
- Hint system with rewards
- Offline play support (PWA)
- Mobile-optimized touch controls

💰 **Monetization Ready**
- Google AdSense integration
- Rewarded video ads for hints
- Support/tip jar button
- Premium themes (coming soon)
- Non-intrusive ad placement

📱 **Technical**
- Pure HTML/CSS/JavaScript (no build tools needed)
- Works offline with Service Worker
- Responsive design for all devices
- Fast loading (< 50KB total)
- PWA installable

## Quick Start

1. **Fork/Clone this repo**
2. **Deploy to Vercel:**
   - Connect your GitHub repo
   - Framework: Other
   - Build Command: (empty)
   - Output Directory: .
3. **Start monetizing:**
   - Add your AdSense ID in index.html
   - Add your Ko-fi/PayPal link
   - Share your game!

## File Structure

```
├── index.html       # Main game file
├── manifest.json    # PWA manifest
├── sw.js           # Service worker for offline
├── vercel.json     # Vercel configuration
└── README.md       # This file
```

## Monetization Setup

### Option 1: Google AdSense
1. Sign up at [Google AdSense](https://adsense.google.com)
2. Add your publisher ID to index.html (line 11)
3. Ads will automatically appear

### Option 2: Tip Jar
1. Sign up at [Ko-fi](https://ko-fi.com) or [Buy Me a Coffee](https://buymeacoffee.com)
2. Update the support link in index.html (line 686)

### Option 3: Rewarded Ads (Coming Soon)
- Integration guide in monetization-guide.md

## Customization

### Change Colors
Edit the color schemes in index.html (line 506):
```javascript
this.colorSchemes = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    // Add your own color sets here
];
```

### Adjust Difficulty
Modify the grid size and number of colors (line 547):
```javascript
const numColors = Math.min(3 + Math.floor(this.level / 5), 5);
const gridSize = Math.min(6 + Math.floor(this.level / 10), 10);
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import on [Vercel](https://vercel.com)
3. Deploy with settings above

### Netlify
1. Drop files in [Netlify Drop](https://app.netlify.com/drop)
2. Done!

### GitHub Pages
1. Enable Pages in repo settings
2. Select main branch
3. Visit your-username.github.io/repo-name

## Support

If this helped you, consider:
- ⭐ Starring this repo
- ☕ [Buying me a coffee](https://ko-fi.com/yourname)
- 🎮 Sharing the game with friends

## License

MIT - Use freely for any purpose!

---

Made with ❤️ for indie game developers who just want to ship and earn!