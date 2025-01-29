import * as fs from 'fs';
import * as path from 'path';
import { parse as parseTypeScript } from '@typescript-eslint/parser';
import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
});

// Initialize counters for reporting
let totalIssues = 0;
let fixedIssues = 0;

// Helper function to log issues
function logIssue(type: string, file: string, message: string, fixed: boolean = false) {
  console.log(`[${fixed ? 'FIXED' : 'FOUND'}] ${type} in ${file}: ${message}`);
  totalIssues++;
  if (fixed) fixedIssues++;
}

// Fix missing imports
function fixMissingImports() {
  console.log('\nChecking for missing imports...');
  const sourceFiles = project.getSourceFiles();

  sourceFiles.forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    const imports = sourceFile.getImportDeclarations();

    imports.forEach(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier.startsWith('@/') || moduleSpecifier.startsWith('./') || moduleSpecifier.startsWith('../')) {
        try {
          const resolvedPath = path.resolve(path.dirname(filePath), moduleSpecifier.replace('@/', '../'));
          if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.tsx') && !fs.existsSync(resolvedPath + '.ts')) {
            logIssue('Missing Import', filePath, `Cannot resolve ${moduleSpecifier}`);
          }
        } catch (error) {
          logIssue('Import Error', filePath, error.message);
        }
      }
    });
  });
}

// Fix missing prop types
function fixMissingPropTypes() {
  console.log('\nChecking for missing prop types...');
  const sourceFiles = project.getSourceFiles('**/*.tsx');

  sourceFiles.forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    const functions = sourceFile.getFunctions();

    functions.forEach(func => {
      const params = func.getParameters();
      params.forEach(param => {
        if (!param.getTypeNode()) {
          logIssue('Missing Prop Types', filePath, `Parameter ${param.getName()} has no type annotation`);
          // Add 'any' type as a temporary fix
          param.setType('any');
          logIssue('Missing Prop Types', filePath, `Added temporary 'any' type to ${param.getName()}`, true);
        }
      });
    });
  });
}

// Fix incorrect exports
function fixIncorrectExports() {
  console.log('\nChecking for incorrect exports...');
  const sourceFiles = project.getSourceFiles();

  sourceFiles.forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    const exports = sourceFile.getExportDeclarations();

    exports.forEach(exportDecl => {
      const namedExports = exportDecl.getNamedExports();
      namedExports.forEach(namedExport => {
        const name = namedExport.getName();
        const symbol = sourceFile.getLocal(name);
        if (!symbol) {
          logIssue('Invalid Export', filePath, `Export '${name}' not found in module`);
        }
      });
    });
  });
}

// Fix missing environment variables
function checkEnvironmentVariables() {
  console.log('\nChecking environment variables...');
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_HERE_API_KEY'
  ];

  const envFile = path.resolve(__dirname, '../.env');
  const envExample = path.resolve(__dirname, '../.env.example');

  if (!fs.existsSync(envFile)) {
    logIssue('Environment', '.env', 'Missing .env file');
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envFile);
      logIssue('Environment', '.env', 'Created from .env.example', true);
    }
  }

  const envContent = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf-8') : '';
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key] = line.split('=');
    if (key) acc.push(key.trim());
    return acc;
  }, [] as string[]);

  requiredEnvVars.forEach(envVar => {
    if (!envVars.includes(envVar)) {
      logIssue('Environment', '.env', `Missing required environment variable: ${envVar}`);
    }
  });
}

// Fix route configuration
function fixRouteConfiguration() {
  console.log('\nChecking route configuration...');
  const routerFile = project.getSourceFileOrThrow('src/router.tsx');
  const routes = new Set<string>();

  // Extract routes
  routerFile.getDescendantsOfKind(project.ts.SyntaxKind.JsxElement).forEach(jsxElement => {
    if (jsxElement.getFirstChildByKind(project.ts.SyntaxKind.JsxOpeningElement)?.getTagNameNode().getText() === 'Route') {
      const pathAttr = jsxElement.getFirstChildByKind(project.ts.SyntaxKind.JsxOpeningElement)
        ?.getAttribute('path')
        ?.getFirstChildByKind(project.ts.SyntaxKind.StringLiteral)
        ?.getText()
        .slice(1, -1);

      if (pathAttr) {
        routes.add(pathAttr);
      }
    }
  });

  // Check for corresponding page components
  routes.forEach(route => {
    const componentName = route === '/' ? 'Index' : route.split('/').pop()!.charAt(0).toUpperCase() + route.split('/').pop()!.slice(1);
    const pageFile = path.resolve(__dirname, `../src/pages/${componentName}.tsx`);
    
    if (!fs.existsSync(pageFile)) {
      logIssue('Route Configuration', 'router.tsx', `Missing page component for route ${route}: ${componentName}.tsx`);
    }
  });
}

// Main function to run all fixes
async function main() {
  console.log('Starting codebase health check and fixes...\n');

  fixMissingImports();
  fixMissingPropTypes();
  fixIncorrectExports();
  checkEnvironmentVariables();
  fixRouteConfiguration();

  // Save all changes
  await project.save();

  console.log(`\nHealth check complete!`);
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`Issues automatically fixed: ${fixedIssues}`);
  console.log(`Remaining issues to fix manually: ${totalIssues - fixedIssues}`);
}

main().catch(console.error); 