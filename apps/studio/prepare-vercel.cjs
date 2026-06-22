const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'api');
const distServer = path.join(__dirname, 'dist', 'server');

// 1. Copy entire dist/server/ to api/ so relative imports work
if (fs.existsSync(distServer)) {
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
  fs.cpSync(distServer, apiDir, { recursive: true });
  console.log('Copied dist/server/* → api/');
}

// 2. Generate index.html with correct asset hashes
const clientDir = path.join(__dirname, 'dist', 'client');
const assetsDir = path.join(clientDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  const cssFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

  if (jsFile) {
    const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>M2A — Build Automations. Generate Verifiable Data.</title>
  <meta name="description" content="Build automations on the Sui stack and its protocols. Every node remembers. Every run generates verifiable data." />
  <link rel="icon" type="image/png" href="/assets/M2ALightLogo.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  ${cssFile ? `<link rel="stylesheet" crossorigin href="/assets/${cssFile}" />` : ''}
</head>
<body>
  <div id="root"></div>
  <script type="module" crossorigin src="/assets/${jsFile}"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(clientDir, 'index.html'), html);
    console.log(`Generated index.html with ${jsFile}${cssFile ? ' and ' + cssFile : ''}`);
  }
}
