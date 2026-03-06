const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const missing = [
  '/images/golden-dragon.jpg',
  '/images/luna-eclipse.jpg',
  '/images/pro2-archer.jpg',
  '/images/neon-sunset-premium.jpg',
  '/images/dragon-warrior.jpg',
  '/images/luzz-classic-gold.jpg',
  '/images/pro-2-power.jpg',
  '/images/pro-blade-2-twilight.jpg',
  '/images/pro-blade-2-stealth.jpg',
  '/images/luzz-pro-net.jpg',
  '/images/pro-4-inferno-angled.jpg',
  '/images/golden-dragon-classic.jpg',
  '/images/kung-fu-panda-pro-cannon.jpg',
  '/images/luzz-pro-1.jpg',
  '/images/obsidian-marble-classic.jpg',
  '/images/obsidian-marble-flat.jpg',
  '/images/luzz-tote-bag.jpg',
  '/images/luna-eclipse-moonbeam.jpg',
  '/images/pro2-saber-anatomy.jpg',
  '/images/luzz-z-line-gold.jpg'
];

const unused = [
  '/images/golden-dragon-edition.jpg',
  '/images/tornazo-angle.jpg',
  '/images/pro2-saber-tech.jpg',
  '/images/luzz-sunrise-angle.jpg',
  '/images/kung-fu-panda-collab.jpg',
  '/images/golden-dragon-edition-angle.jpg',
  '/images/pro-cannon-tech.jpg',
  '/images/pro-blade-2-fog.jpg',
  '/images/pro-blade-2-angle.jpg',
  '/images/champion-net.jpg',
  '/images/pro-4-inferno-blue-angle.jpg',
  '/images/9_a57752f8-6bbb-4b5d-81c9-383b00ba5d49.jpg',
  '/images/kung-fu-panda-collab-angle.jpg',
  '/images/pro-cannon-face.jpg',
  '/images/pro-cannon-angle.jpg',
  '/images/kung-fu-panda-collab-tech.jpg',
  '/images/luzz-covers-close.jpg',
  '/images/luzz-net-post.jpg',
  '/images/pro2-saber-grip.jpg',
  '/images/pickleball-net.jpg'
];

for (let i = 0; i < missing.length; i++) {
  code = code.replace(new RegExp(missing[i], 'g'), unused[i]);
}

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed image URLs in App.tsx');
