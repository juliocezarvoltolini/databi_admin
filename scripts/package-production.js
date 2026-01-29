const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, '.build');

console.log('📦 Preparando estrutura de build para produção...\n');

// Limpar diretório .build se existir
if (fs.existsSync(BUILD_DIR)) {
  console.log('🗑️  Removendo .build anterior...');
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}

// Criar estrutura de diretórios
console.log('📁 Criando estrutura de diretórios...');
fs.mkdirSync(BUILD_DIR, { recursive: true });
fs.mkdirSync(path.join(BUILD_DIR, '.next'), { recursive: true });

// Função para copiar diretório recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Aviso: ${src} não encontrado, pulando...`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copiar .next/standalone
const standaloneDir = path.join(ROOT_DIR, '.next', 'standalone');
if (fs.existsSync(standaloneDir)) {
  console.log('📂 Copiando .next/standalone...');
  copyDir(standaloneDir, BUILD_DIR);
} else {
  console.error('❌ Erro: .next/standalone não encontrado!');
  console.error('   Execute "npm run build" primeiro.');
  process.exit(1);
}

// Copiar .next/static
const staticDir = path.join(ROOT_DIR, '.next', 'static');
if (fs.existsSync(staticDir)) {
  console.log('📂 Copiando .next/static...');
  const destStaticDir = path.join(BUILD_DIR, '.next', 'static');
  copyDir(staticDir, destStaticDir);
} else {
  console.warn('⚠️  Aviso: .next/static não encontrado, pulando...');
}

// Copiar public
const publicDir = path.join(ROOT_DIR, 'public');
if (fs.existsSync(publicDir)) {
  console.log('📂 Copiando public...');
  const destPublicDir = path.join(BUILD_DIR, 'public');
  copyDir(publicDir, destPublicDir);
} else {
  console.warn('⚠️  Aviso: public não encontrado, pulando...');
}


console.log('\n✅ Build para produção preparado com sucesso!');
console.log(`📍 Localização: ${BUILD_DIR}`);
console.log('\n📋 Estrutura criada:');
console.log('   .build/');
console.log('   ├── .next/');
console.log('   │   ├── standalone/  (conteúdo copiado aqui)');
console.log('   │   └── static/');
console.log('   ├── public/');
console.log('\n🚀 Agora copie a pasta .build para o servidor de produção');
