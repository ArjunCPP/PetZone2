const fs = require('fs');
const path = require('path');

const outputTxtPath = '/Users/apple/.gemini/antigravity/brain/91482f1c-f0dd-426a-92cd-4e72e605304c/.system_generated/steps/10/output.txt';
const assetsBaseDir = '/Users/apple/Desktop/WebSite/PetZone/Src/Assets';

async function main() {
  const content = fs.readFileSync(outputTxtPath, 'utf8');
  const jsonStr = content.substring(content.indexOf('{'));
  const data = JSON.parse(jsonStr);
  const screens = data.screens || [];

  for (const screen of screens) {
    const screenTitle = screen.title.replace(/[^a-zA-Z0-9]/g, '_');
    const screenDir = path.join(assetsBaseDir, screenTitle);
    
    if (!fs.existsSync(screenDir)) {
      fs.mkdirSync(screenDir, { recursive: true });
    }

    console.log(`Processing screen: ${screen.title}`);
    
    if (screen.screenshot && screen.screenshot.downloadUrl) {
      await downloadFile(screen.screenshot.downloadUrl, path.join(screenDir, 'screenshot.jpg'));
    }

    if (screen.htmlCode && screen.htmlCode.downloadUrl) {
      try {
        const htmlRes = await fetch(screen.htmlCode.downloadUrl);
        const html = await htmlRes.text();
        
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        let imgCount = 1;
        while ((match = imgRegex.exec(html)) !== null) {
          const imgUrl = match[1];
          if (imgUrl.startsWith('http')) {
            console.log(` Downloading image for ${screen.title}`);
            const imgTag = match[0];
            const altMatch = imgTag.match(/alt="([^">]+)"/);
            let filename = `image_${imgCount}.jpg`;
            if (altMatch && altMatch[1]) {
              // Try to make a safe short filename from alt text
              filename = altMatch[1].substring(0, 30).trim().replace(/[^a-zA-Z0-9]/g, '_') + '.jpg';
            }
            await downloadFile(imgUrl, path.join(screenDir, filename));
            imgCount++;
          }
        }
      } catch (err) {
        console.error(`Failed to process HTML for ${screen.title}:`, err);
      }
    }
  }
  console.log('Finished downloading assets.');
}

async function downloadFile(url, dest) {
  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(arrayBuffer));
  } catch(e) {
    console.error(`Failed to download ${url}`, e);
  }
}

main().catch(console.error);
