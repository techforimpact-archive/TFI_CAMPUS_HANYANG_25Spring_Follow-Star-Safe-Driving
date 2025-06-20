// scripts/update-images.js - 수정된 버전 (onClick 속성 지원)
const fs = require('fs');
const path = require('path');

const CRITICAL_IMAGES = [
  'background.png',
  'star_character.png',
  'title.png',
  'team_name.png',
  'start_button.png'
];

const HIGH_PRIORITY_IMAGES = [
  'scenario1.png',
  'game_character_grandfather.png',
  'game_character_grandmother.png',
  'home_button.png',
  'back_button.png',
  'next_button.png',
  'confirm_button.png',
  'motorcycle.png',
  'success_circle.png',
  'danger_warning.png'
];

function getPriority(imagePath) {
  const filename = path.basename(imagePath);
  if (CRITICAL_IMAGES.includes(filename)) return 'critical';
  if (HIGH_PRIORITY_IMAGES.includes(filename)) return 'high';
  return 'normal';
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // import 문 추가 체크
  const hasEnhancedImport = content.includes('EnhancedOptimizedImage');
  
  // img 태그 찾기 및 변환
  const imgRegex = /<img\s+([^>]*)\s*\/?>/g;
  let matches = [];
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    matches.push(match);
  }
  
  if (matches.length > 0 && !hasEnhancedImport) {
    // import 문 추가
    const importMatch = content.match(/^(import.*from.*;\n)+/m);
    if (importMatch) {
      const importSection = importMatch[0];
      const newImport = "import EnhancedOptimizedImage from '../../components/ui/EnhancedOptimizedImage';\n";
      content = content.replace(importSection, importSection + newImport);
      modified = true;
    }
  }
  
  // img 태그들을 역순으로 처리 (인덱스 변경 방지)
  matches.reverse().forEach(match => {
    const fullMatch = match[0];
    const attributes = match[1];
    
    // src 속성 추출
    const srcMatch = attributes.match(/src=["']([^"']+)["']/);
    if (!srcMatch) return;
    
    const src = srcMatch[1];
    if (!src.startsWith('/assets/images/')) return;
    
    // alt 속성 추출
    const altMatch = attributes.match(/alt=["']([^"']+)["']/);
    const alt = altMatch ? altMatch[1] : '이미지';
    
    // className 속성 추출
    const classMatch = attributes.match(/className=["']([^"']+)["']/);
    const className = classMatch ? classMatch[1] : '';
    
    // style 속성 추출
    const styleMatch = attributes.match(/style=\{([^}]+)\}/);
    const style = styleMatch ? styleMatch[1] : '';
    
    // onClick 속성 추출 (수정: 중괄호 처리)
    const onClickMatch = attributes.match(/onClick=\{([^}]+)\}/);
    const onClick = onClickMatch ? onClickMatch[1] : '';
    
    // priority 결정
    const priority = getPriority(src);
    
    // EnhancedOptimizedImage로 변환
    let replacement = `<EnhancedOptimizedImage
  src="${src}"
  alt="${alt}"
  priority="${priority}"`;
    
    if (className) {
      replacement += `\n  className="${className}"`;
    }
    
    if (style) {
      replacement += `\n  style={${style}}`;
    }
    
    // onClick 속성 추가 (수정)
    if (onClick) {
      replacement += `\n  onClick={${onClick}}`;
    }
    
    replacement += '\n/>';
    
    content = content.replace(fullMatch, replacement);
    modified = true;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

// src/pages 디렉토리 처리
const pagesDir = path.join(__dirname, '../src/pages');
if (fs.existsSync(pagesDir)) {
  console.log('이미지 태그 변환을 시작합니다...');
  processDirectory(pagesDir);
  console.log('변환 완료!');
} else {
  console.error('src/pages 디렉토리를 찾을 수 없습니다.');
}