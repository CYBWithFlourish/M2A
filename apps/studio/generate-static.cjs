const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'dist', 'client');
const assetsDir = path.join(clientDir, 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error('Assets directory not found. Run build first.');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
const cssFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

if (!jsFile) {
  console.error('No index JS bundle found in assets.');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>M2A — Build Automations. Generate Verifiable Data.</title>
  <meta name="description" content="Build automations on the Sui stack and its protocols. Every node remembers. Every run generates verifiable data." />
  <link rel="icon" type="image/png" href="/M2ALightLogo.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  ${cssFile ? `<link rel="stylesheet" crossorigin href="/assets/${cssFile}" />` : ''}
  <script type="module" crossorigin src="/assets/${jsFile}"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

fs.writeFileSync(path.join(clientDir, 'index.html'), html);
console.log(`Generated index.html with ${jsFile}${cssFile ? ' and ' + cssFile : ''}`);
