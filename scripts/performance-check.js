#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Performance Check Starting...\n');

// Check bundle size
console.log('📦 Bundle Size Analysis:');
try {
  const buildOutput = execSync('npm run build', { encoding: 'utf8' });
  const bundleSizeMatch = buildOutput.match(
    /First Load JS shared by all[\s\S]*?(\d+\.?\d*)\s*kB/
  );
  if (bundleSizeMatch) {
    const bundleSize = parseFloat(bundleSizeMatch[1]);
    console.log(`   Main bundle size: ${bundleSize} kB`);

    if (bundleSize > 300) {
      console.log('   ⚠️  Bundle size is large (>300kB)');
    } else {
      console.log('   ✅ Bundle size is acceptable');
    }
  }
} catch (error) {
  console.log('   ❌ Build failed:', error.message);
}

// Check TypeScript compilation time
console.log('\n⚡ TypeScript Compilation:');
try {
  const startTime = Date.now();
  execSync('npx tsc --noEmit', { encoding: 'utf8' });
  const endTime = Date.now();
  const compileTime = endTime - startTime;

  console.log(`   Compilation time: ${compileTime}ms`);

  if (compileTime > 5000) {
    console.log('   ⚠️  Compilation is slow (>5s)');
  } else {
    console.log('   ✅ Compilation time is good');
  }
} catch (error) {
  console.log('   ❌ TypeScript errors found');
}

// Check ESLint performance
console.log('\n🔍 ESLint Performance:');
try {
  const startTime = Date.now();
  execSync('npx eslint . --max-warnings 0', { encoding: 'utf8' });
  const endTime = Date.now();
  const lintTime = endTime - startTime;

  console.log(`   Lint time: ${lintTime}ms`);

  if (lintTime > 10000) {
    console.log('   ⚠️  Linting is slow (>10s)');
  } else {
    console.log('   ✅ Linting time is good');
  }
} catch (error) {
  console.log('   ⚠️  ESLint warnings/errors found');
}

// Check file sizes
console.log('\n📁 Large Files Check:');
const checkLargeFiles = (dir, maxSize = 100000) => {
  // 100KB
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      checkLargeFiles(filePath, maxSize);
    } else if (stat.isFile() && stat.size > maxSize) {
      const sizeKB = (stat.size / 1024).toFixed(2);
      console.log(`   ⚠️  ${filePath}: ${sizeKB}KB`);
    }
  });
};

try {
  checkLargeFiles('.');
} catch (error) {
  console.log('   ❌ Error checking file sizes');
}

// Check dependencies
console.log('\n📦 Dependencies Check:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const depCount = Object.keys(packageJson.dependencies || {}).length;
  const devDepCount = Object.keys(packageJson.devDependencies || {}).length;

  console.log(`   Dependencies: ${depCount}`);
  console.log(`   Dev Dependencies: ${devDepCount}`);

  if (depCount > 50) {
    console.log('   ⚠️  High number of dependencies');
  } else {
    console.log('   ✅ Dependencies count is reasonable');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

console.log('\n✅ Performance check completed!');
