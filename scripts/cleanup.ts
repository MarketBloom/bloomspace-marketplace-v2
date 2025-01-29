import fs from 'fs';
import path from 'path';

const DEPRECATED_PATHS = [
  'src/components/become-florist',
  'src/components/old-dashboard',
  'src/components/florist-card',
  'src/components/cart',
  'src/components/product',
  'src/components/product-detail',
  'src/components/filters',
  'src/components/home-filters',
  'src/components/mobile',
  'src/hooks/deprecated',
  'src/pages/old',
  // Add paths to clean up
];

const KEEP_PATTERNS = [
  /\.tsx?$/,           // TypeScript files
  /\.scss$/,          // Styles
  /\.test\.[jt]sx?$/, // Tests
  /\.stories\.[jt]sx?$/, // Storybook stories
];

function shouldKeepFile(filename: string): boolean {
  return KEEP_PATTERNS.some(pattern => pattern.test(filename));
}

function cleanup() {
  DEPRECATED_PATHS.forEach(dirPath => {
    if (fs.existsSync(dirPath)) {
      console.log(`Cleaning up ${dirPath}...`);
      
      // Check for any files we want to keep before deletion
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (shouldKeepFile(file)) {
          console.log(`Found important file: ${fullPath}`);
          // You might want to move these files somewhere else
          // fs.renameSync(fullPath, newPath);
        }
      });
      
      // Delete deprecated directory
      fs.rmdirSync(dirPath, { recursive: true });
      console.log(`Removed ${dirPath}`);
    }
  });
}

// Run cleanup
cleanup(); 