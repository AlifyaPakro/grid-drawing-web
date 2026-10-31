export interface SampleImage {
  id: string;
  title: string;
  category: string;
  description: string;
  aspectRatio: string;
  width: number;
  height: number;
  dataUrl: string;
}

// Crisp, artistic reference SVGs encoded as data URLs
function createSvgDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
}

const STATUE_STUDY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#3a3734"/>
      <stop offset="100%" stop-color="#141312"/>
    </radialGradient>
    <linearGradient id="marbleLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf7"/>
      <stop offset="45%" stop-color="#ded8cf"/>
      <stop offset="85%" stop-color="#9d9588"/>
      <stop offset="100%" stop-color="#4a453d"/>
    </linearGradient>
    <linearGradient id="marbleShade" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#736c61"/>
      <stop offset="100%" stop-color="#2c2823"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  
  <!-- Pedestal -->
  <path d="M 220 850 L 580 850 L 610 930 L 190 930 Z" fill="#2c2925" filter="url(#shadow)"/>
  <rect x="250" y="810" width="300" height="40" fill="#3a3530"/>

  <!-- Torso & Shoulders -->
  <path d="M 230 780 C 230 680, 270 590, 310 550 C 330 530, 470 530, 490 550 C 530 590, 570 680, 570 780 C 570 820, 510 820, 400 820 C 290 820, 230 820, 230 780 Z" fill="url(#marbleLight)" filter="url(#shadow)"/>
  
  <!-- Drapery Chiton folds -->
  <path d="M 280 620 Q 350 720 330 820 Q 370 750 390 640 Q 420 740 450 820 Q 480 730 510 650" fill="none" stroke="#686055" stroke-width="9" stroke-linecap="round"/>
  <path d="M 310 660 Q 370 780 360 820" fill="none" stroke="#48423a" stroke-width="6"/>

  <!-- Neck -->
  <path d="M 350 430 L 350 560 C 370 575, 430 575, 450 560 L 450 430 Z" fill="url(#marbleLight)"/>
  <path d="M 400 440 C 430 470, 440 520, 450 560 L 410 560 C 400 510, 390 470, 380 440 Z" fill="url(#marbleShade)" opacity="0.5"/>

  <!-- Head & Jaw -->
  <path d="M 320 310 C 310 400, 340 480, 400 480 C 460 480, 490 400, 480 310 C 480 230, 460 170, 400 170 C 340 170, 320 230, 320 310 Z" fill="url(#marbleLight)" filter="url(#shadow)"/>
  
  <!-- Classical Facial Features (Sculptural Shadows) -->
  <!-- Nose ridge and shadow -->
  <path d="M 395 270 L 390 350 L 405 355 L 405 345 Z" fill="#6d655a"/>
  <path d="M 385 352 Q 400 360 415 352" stroke="#4d463d" stroke-width="4" fill="none"/>
  <!-- Eyes -->
  <path d="M 345 285 Q 365 275 385 285 Q 365 295 345 285 Z" fill="#585047"/>
  <path d="M 415 285 Q 435 275 455 285 Q 435 295 415 285 Z" fill="#756c62"/>
  <path d="M 340 270 Q 365 260 390 272" stroke="#4a423a" stroke-width="5" fill="none"/>
  <path d="M 410 272 Q 435 260 460 270" stroke="#4a423a" stroke-width="5" fill="none"/>
  <!-- Lips -->
  <path d="M 380 395 Q 400 390 420 395 Q 400 412 380 395 Z" fill="#5c534a"/>
  <path d="M 382 410 Q 400 422 418 410" stroke="#494139" stroke-width="4" fill="none"/>

  <!-- Classical Curly Hair Volumes -->
  <circle cx="330" cy="210" r="35" fill="#ded7cd"/>
  <circle cx="370" cy="180" r="40" fill="#f0ebe2"/>
  <circle cx="430" cy="180" r="38" fill="#ded7cd"/>
  <circle cx="470" cy="210" r="35" fill="#b8afa2"/>
  <circle cx="310" cy="260" r="32" fill="#9e9587"/>
  <circle cx="490" cy="260" r="32" fill="#7d7467"/>
  <path d="M 300 220 Q 340 190 380 200 Q 420 190 460 210 Q 500 230 490 280" fill="none" stroke="#544c42" stroke-width="6"/>

  <text x="400" y="975" fill="#888175" font-family="sans-serif" font-size="16" letter-spacing="4" text-anchor="middle">CLASSICAL BUST • TONAL REFERENCE</text>
</svg>`;

const STILL_LIFE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 750" width="1000" height="750">
  <defs>
    <radialGradient id="slBg" cx="45%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#2d2824"/>
      <stop offset="60%" stop-color="#191614"/>
      <stop offset="100%" stop-color="#0a0908"/>
    </radialGradient>
    <linearGradient id="tableTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5a4128"/>
      <stop offset="50%" stop-color="#3c2a1a"/>
      <stop offset="100%" stop-color="#23180e"/>
    </linearGradient>
    <radialGradient id="appleGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ff735c"/>
      <stop offset="40%" stop-color="#d62218"/>
      <stop offset="85%" stop-color="#6e0d08"/>
      <stop offset="100%" stop-color="#290503"/>
    </radialGradient>
    <radialGradient id="pearGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffea78"/>
      <stop offset="50%" stop-color="#b8aa2a"/>
      <stop offset="85%" stop-color="#696313"/>
      <stop offset="100%" stop-color="#2b2907"/>
    </radialGradient>
    <radialGradient id="ceramicGrad" cx="30%" cy="25%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#e0dcd3"/>
      <stop offset="70%" stop-color="#8c8577"/>
      <stop offset="100%" stop-color="#36322b"/>
    </radialGradient>
  </defs>
  <rect width="1000" height="750" fill="url(#slBg)"/>

  <!-- Wooden Table Surface -->
  <polygon points="0,520 1000,520 1000,750 0,750" fill="url(#tableTop)"/>
  <line x1="0" y1="520" x2="1000" y2="520" stroke="#7d5d3b" stroke-width="3"/>
  <rect x="0" y="523" width="1000" height="15" fill="#1b120a" opacity="0.8"/>

  <!-- Cast Shadows -->
  <ellipse cx="620" cy="560" rx="190" ry="40" fill="#0c0805" opacity="0.75"/>
  <ellipse cx="360" cy="580" rx="130" ry="35" fill="#0c0805" opacity="0.8"/>
  <ellipse cx="230" cy="620" rx="90" ry="25" fill="#0c0805" opacity="0.85"/>

  <!-- Ceramic Pitcher / Vase -->
  <path d="M 580 240 Q 640 240 650 280 Q 670 360 720 460 Q 740 520 680 550 Q 560 560 520 520 Q 480 450 540 340 Q 550 280 580 240 Z" fill="url(#ceramicGrad)"/>
  <!-- Pitcher Neck & Handle -->
  <ellipse cx="600" cy="240" rx="35" ry="12" fill="#524c43"/>
  <path d="M 650 290 Q 730 330 710 430 Q 690 460 670 430" fill="none" stroke="#ded8cc" stroke-width="22" stroke-linecap="round"/>
  <path d="M 650 290 Q 730 330 710 430 Q 690 460 670 430" fill="none" stroke="#474138" stroke-width="12" stroke-linecap="round"/>

  <!-- White Ceramic Bowl -->
  <ellipse cx="360" cy="530" rx="140" ry="65" fill="#d9d4cb"/>
  <ellipse cx="360" cy="520" rx="136" ry="50" fill="#8c867b"/>
  <path d="M 224 525 Q 360 660 496 525 Z" fill="url(#ceramicGrad)"/>

  <!-- Pear inside bowl -->
  <path d="M 330 420 C 310 440 290 490 320 530 C 350 560 410 550 420 500 C 430 460 380 430 360 410 Z" fill="url(#pearGrad)"/>
  <path d="M 345 410 Q 340 380 325 370" fill="none" stroke="#4a3b1a" stroke-width="4"/>

  <!-- Glossy Red Apple in foreground -->
  <circle cx="230" cy="590" r="65" fill="url(#appleGrad)"/>
  <ellipse cx="210" cy="560" rx="16" ry="10" fill="#ffffff" opacity="0.6" transform="rotate(-25 210 560)"/>
  <path d="M 230 530 Q 235 500 250 490" fill="none" stroke="#3b1f0c" stroke-width="4"/>
  <path d="M 236 505 Q 260 495 270 515 Q 250 520 236 505 Z" fill="#4d7023"/>

  <text x="500" y="725" fill="#75624e" font-family="sans-serif" font-size="15" letter-spacing="3" text-anchor="middle">STILL LIFE • CHIAROSCURO STUDY</text>
</svg>`;

const URBAN_SKETCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1b2430"/>
      <stop offset="50%" stop-color="#2a3b4c"/>
      <stop offset="100%" stop-color="#465e75"/>
    </linearGradient>
    <linearGradient id="wallSun" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e3cb98"/>
      <stop offset="100%" stop-color="#c4a56a"/>
    </linearGradient>
    <linearGradient id="wallShade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#63584c"/>
      <stop offset="100%" stop-color="#3d352d"/>
    </linearGradient>
  </defs>
  <rect width="900" height="900" fill="url(#skyGrad)"/>

  <!-- Perspective Vanishing Lines & Ground -->
  <polygon points="0,600 900,600 900,900 0,900" fill="#2d333b"/>
  <polygon points="250,900 450,600 500,600 700,900" fill="#3b434e"/>

  <!-- Cathedral / Historic Tower in 2-point perspective -->
  <!-- Left Facade in light -->
  <polygon points="220,720 450,690 450,220 220,320" fill="url(#wallSun)"/>
  <!-- Right Facade in shadow -->
  <polygon points="450,690 700,710 700,280 450,220" fill="url(#wallShade)"/>

  <!-- Spire / Clock Tower -->
  <polygon points="390,220 450,80 510,220" fill="#2b231c"/>
  <line x1="450" y1="80" x2="450" y2="40" stroke="#e0c279" stroke-width="4"/>
  <circle cx="450" cy="40" r="5" fill="#e0c279"/>

  <!-- Archways & Windows (great for grid scaling) -->
  <path d="M 280 420 Q 320 370 360 420 L 360 520 L 280 520 Z" fill="#241d17"/>
  <path d="M 280 560 Q 320 510 360 560 L 360 660 L 280 660 Z" fill="#241d17"/>
  <path d="M 520 430 Q 560 380 600 430 L 600 520 L 520 520 Z" fill="#171411"/>
  <path d="M 520 570 Q 560 520 600 570 L 600 660 L 520 660 Z" fill="#171411"/>

  <!-- Rose Window / Clock dial -->
  <circle cx="450" cy="280" r="42" fill="#1f1a16" stroke="#c9ab6d" stroke-width="5"/>
  <circle cx="450" cy="280" r="16" fill="#e8d5a7"/>

  <!-- Foreground Street Lamp -->
  <line x1="160" y1="840" x2="160" y2="580" stroke="#111417" stroke-width="8"/>
  <circle cx="160" cy="570" r="18" fill="#ffe082" opacity="0.9"/>
  <circle cx="160" cy="570" r="35" fill="#ffe082" opacity="0.2"/>

  <text x="450" y="870" fill="#a0b3c6" font-family="sans-serif" font-size="15" letter-spacing="4" text-anchor="middle">URBAN ARCHITECTURE • 2-POINT PERSPECTIVE</text>
</svg>`;

const WILDLIFE_PORTRAIT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <radialGradient id="natureBg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#1e2c22"/>
      <stop offset="60%" stop-color="#0f1712"/>
      <stop offset="100%" stop-color="#050806"/>
    </radialGradient>
    <radialGradient id="tigerEye" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fff275"/>
      <stop offset="50%" stop-color="#ffb300"/>
      <stop offset="90%" stop-color="#bf360c"/>
    </radialGradient>
    <linearGradient id="tigerFur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff9100"/>
      <stop offset="40%" stop-color="#e65100"/>
      <stop offset="85%" stop-color="#bf360c"/>
      <stop offset="100%" stop-color="#3e1a06"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#natureBg)"/>

  <!-- Tiger Silhouette & Head Mass -->
  <path d="M 260 280 C 200 340 180 500 220 660 C 260 820 400 890 400 890 C 400 890 540 820 580 660 C 620 500 600 340 540 280 C 500 240 460 250 400 250 C 340 250 300 240 260 280 Z" fill="url(#tigerFur)"/>

  <!-- Ears -->
  <path d="M 230 320 C 210 240 270 200 300 240 Z" fill="#2b1406"/>
  <circle cx="260" cy="250" r="18" fill="#fff" opacity="0.8"/>
  <path d="M 570 320 C 590 240 530 200 500 240 Z" fill="#2b1406"/>
  <circle cx="540" cy="250" r="18" fill="#fff" opacity="0.8"/>

  <!-- White Muzzle & Brow patches -->
  <path d="M 330 630 C 300 700 350 780 400 780 C 450 780 500 700 470 630 C 440 600 360 600 330 630 Z" fill="#f5f0e6"/>
  <path d="M 270 420 Q 320 430 350 470 Q 300 470 270 420 Z" fill="#fff" opacity="0.8"/>
  <path d="M 530 420 Q 480 430 450 470 Q 500 470 530 420 Z" fill="#fff" opacity="0.8"/>

  <!-- Glowing Eyes -->
  <ellipse cx="325" cy="480" rx="30" ry="22" fill="url(#tigerEye)"/>
  <ellipse cx="475" cy="480" rx="30" ry="22" fill="url(#tigerEye)"/>
  <ellipse cx="325" cy="480" rx="10" ry="20" fill="#0d0803"/>
  <ellipse cx="475" cy="480" rx="10" ry="20" fill="#0d0803"/>
  <circle cx="318" cy="472" r="5" fill="#fff"/>
  <circle cx="468" cy="472" r="5" fill="#fff"/>

  <!-- Nose & Whiskers -->
  <polygon points="380,620 420,620 400,650" fill="#d87d6f"/>
  <line x1="400" y1="650" x2="400" y2="690" stroke="#1a0f08" stroke-width="5"/>
  <path d="M 360 690 Q 400 710 440 690" stroke="#1a0f08" stroke-width="5" fill="none"/>

  <!-- Iconic Tiger Stripes -->
  <path d="M 400 270 L 400 380" stroke="#140a04" stroke-width="12" stroke-linecap="round"/>
  <path d="M 370 300 L 350 360" stroke="#140a04" stroke-width="9" stroke-linecap="round"/>
  <path d="M 430 300 L 450 360" stroke="#140a04" stroke-width="9" stroke-linecap="round"/>
  <!-- Cheek stripes -->
  <path d="M 220 540 Q 280 540 310 520" stroke="#140a04" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M 230 610 Q 290 600 320 580" stroke="#140a04" stroke-width="12" stroke-linecap="round" fill="none"/>
  <path d="M 580 540 Q 520 540 490 520" stroke="#140a04" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M 570 610 Q 510 600 480 580" stroke="#140a04" stroke-width="12" stroke-linecap="round" fill="none"/>

  <text x="400" y="960" fill="#7fa689" font-family="sans-serif" font-size="16" letter-spacing="4" text-anchor="middle">WILDLIFE PORTRAIT • HIGH-CONTRAST FORM</text>
</svg>`;

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'statue',
    title: 'Classical Sculpture',
    category: 'Portrait & Anatomy',
    description: 'Ideal for studying human proportions, shading planes, and facial features.',
    aspectRatio: '4:5 (Portrait)',
    width: 800,
    height: 1000,
    dataUrl: createSvgDataUrl(STATUE_STUDY),
  },
  {
    id: 'still_life',
    title: 'Fruit & Ceramics',
    category: 'Still Life & Value',
    description: 'Features curved ellipses, spheres, and cast shadows for tone isolation.',
    aspectRatio: '4:3 (Landscape)',
    width: 1000,
    height: 750,
    dataUrl: createSvgDataUrl(STILL_LIFE),
  },
  {
    id: 'architecture',
    title: 'Gothic Tower',
    category: 'Perspective & Line',
    description: 'Perfect for practicing 2-point perspective, arches, and geometric division.',
    aspectRatio: '1:1 (Square)',
    width: 900,
    height: 900,
    dataUrl: createSvgDataUrl(URBAN_SKETCH),
  },
  {
    id: 'wildlife',
    title: 'Tiger Study',
    category: 'Wildlife & Texture',
    description: 'High-contrast organic forms and stripe placement for organic scaling.',
    aspectRatio: '4:5 (Portrait)',
    width: 800,
    height: 1000,
    dataUrl: createSvgDataUrl(WILDLIFE_PORTRAIT),
  },
];
