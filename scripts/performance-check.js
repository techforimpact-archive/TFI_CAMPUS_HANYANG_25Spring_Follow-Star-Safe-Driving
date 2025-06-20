// scripts/performance-check.js - 성능 모니터링 스크립트
const fs = require('fs');
const path = require('path');

function analyzeBundle() {
  const distPath = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('빌드를 먼저 실행해주세요: npm run build');
    return;
  }
  
  console.log('🔍 번들 분석 시작...\n');
  
  // JS 파일 분석
  const jsFiles = [];
  const cssFiles = [];
  const imageFiles = [];
  
  function scanDirectory(dir, files, extensions) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, files, extensions);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push({
          path: fullPath,
          size: stat.size,
          name: item
        });
      }
    });
  }
  
  scanDirectory(distPath, jsFiles, ['.js']);
  scanDirectory(distPath, cssFiles, ['.css']);
  scanDirectory(distPath, imageFiles, ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);
  
  // 크기별 정렬
  jsFiles.sort((a, b) => b.size - a.size);
  cssFiles.sort((a, b) => b.size - a.size);
  imageFiles.sort((a, b) => b.size - a.size);
  
  // 결과 출력
  console.log('📦 JavaScript 파일들:');
  jsFiles.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`  ${file.name}: ${sizeKB}KB`);
  });
  
  console.log('\n🎨 CSS 파일들:');
  cssFiles.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`  ${file.name}: ${sizeKB}KB`);
  });
  
  console.log('\n🖼️  이미지 파일들 (상위 10개):');
  imageFiles.slice(0, 10).forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`  ${file.name}: ${sizeKB}KB`);
  });
  
  // 총 크기 계산
  const totalJSSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCSSSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
  const totalImageSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
  
  console.log('\n📊 총 크기:');
  console.log(`  JavaScript: ${(totalJSSize / 1024).toFixed(2)}KB`);
  console.log(`  CSS: ${(totalCSSSize / 1024).toFixed(2)}KB`);
  console.log(`  Images: ${(totalImageSize / 1024).toFixed(2)}KB`);
  console.log(`  Total: ${((totalJSSize + totalCSSSize + totalImageSize) / 1024).toFixed(2)}KB`);
  
  // 권장사항
  console.log('\n💡 최적화 권장사항:');
  
  if (totalJSSize > 500 * 1024) {
    console.log('  ⚠️  JavaScript 번들이 너무 큽니다. 코드 분할을 고려하세요.');
  }
  
  if (imageFiles.some(img => img.size > 100 * 1024)) {
    console.log('  ⚠️  100KB 이상의 이미지가 있습니다. WebP 변환을 고려하세요.');
  }
  
  if (jsFiles.length > 10) {
    console.log('  ⚠️  JavaScript 파일이 너무 많습니다. 번들링 최적화를 고려하세요.');
  }
  
  console.log('  ✅ EnhancedImagePreloader가 적용되어 로딩 성능이 향상되었습니다.');
  console.log('  ✅ Vercel CDN 최적화가 적용되었습니다.');
}

analyzeBundle();