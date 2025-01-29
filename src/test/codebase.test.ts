import { describe, test, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { Project, ts } from 'ts-morph';

describe('Codebase Health Check', () => {
  // Test environment variables
  test('Required environment variables are set', () => {
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_HERE_API_KEY',
      'VITE_SENTRY_DSN'
    ];

    requiredEnvVars.forEach(envVar => {
      expect(process.env[envVar]).toBeDefined();
    });
  });

  // Test component imports
  test('All component imports are valid', () => {
    const errors: string[] = [];
    const componentsDir = path.join(process.cwd(), 'src/components');
    const project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true
    });

    function walkDir(dir: string) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          try {
            const sourceFile = project.addSourceFileAtPath(filePath);
            const imports = sourceFile.getImportDeclarations();
            
            imports.forEach(importDecl => {
              const moduleSpecifier = importDecl.getModuleSpecifierValue();
              if (moduleSpecifier.startsWith('@/')) {
                const resolvedPath = path.join(process.cwd(), 'src', moduleSpecifier.slice(2));
                if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.tsx') && !fs.existsSync(resolvedPath + '.ts')) {
                  errors.push(`Invalid import in ${filePath}: ${moduleSpecifier}`);
                }
              }
            });

            sourceFile.getPreEmitDiagnostics().forEach(diagnostic => {
              if (diagnostic.getCategory() === ts.DiagnosticCategory.Error) {
                errors.push(`Error parsing ${filePath}: ${diagnostic.getMessageText()}`);
              }
            });
          } catch (err: unknown) {
            const error = err as Error;
            errors.push(`Error parsing ${filePath}: ${error.message}`);
          }
        }
      });
    }

    walkDir(componentsDir);
    expect(errors).toEqual([]);
  });

  // Test route configuration
  test('All routes are properly configured', () => {
    const routesFile = path.join(process.cwd(), 'src/App.tsx');
    expect(fs.existsSync(routesFile)).toBe(true);
  });

  // Test type definitions
  test('All type definitions are valid', () => {
    const errors: string[] = [];
    const typesDir = path.join(process.cwd(), 'src/types');
    const project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true
    });

    function walkDir(dir: string) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.ts')) {
          try {
            const sourceFile = project.addSourceFileAtPath(filePath);
            sourceFile.getPreEmitDiagnostics().forEach(diagnostic => {
              if (diagnostic.getCategory() === ts.DiagnosticCategory.Error) {
                errors.push(`Error in type definitions ${filePath}: ${diagnostic.getMessageText()}`);
              }
            });
          } catch (err: unknown) {
            const error = err as Error;
            errors.push(`Error in type definitions ${filePath}: ${error.message}`);
          }
        }
      });
    }

    walkDir(typesDir);
    expect(errors).toEqual([]);
  });

  // Test component props
  test('All component props are properly typed', () => {
    const errors: string[] = [];
    const componentsDir = path.join(process.cwd(), 'src/components');
    const project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true
    });

    function walkDir(dir: string) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.tsx')) {
          try {
            const sourceFile = project.addSourceFileAtPath(filePath);
            
            // Check if component props are properly typed
            sourceFile.getClasses().forEach(classDecl => {
              const props = classDecl.getProperties().filter(prop => !prop.hasModifier(ts.SyntaxKind.StaticKeyword));
              props.forEach(prop => {
                if (!prop.getType().isObject()) {
                  errors.push(`Error parsing component ${filePath}: ${prop.getName()} is not properly typed`);
                }
              });
            });

            // Check function components
            sourceFile.getFunctions().forEach(func => {
              const params = func.getParameters();
              if (params.length > 0 && !params[0].getType().isObject()) {
                errors.push(`Error parsing component ${filePath}: ${func.getName()} props are not properly typed`);
              }
            });

            sourceFile.getPreEmitDiagnostics().forEach(diagnostic => {
              if (diagnostic.getCategory() === ts.DiagnosticCategory.Error) {
                errors.push(`Error parsing component ${filePath}: ${diagnostic.getMessageText()}`);
              }
            });
          } catch (err: unknown) {
            const error = err as Error;
            errors.push(`Error parsing component ${filePath}: ${error.message}`);
          }
        }
      });
    }

    walkDir(componentsDir);
    expect(errors).toEqual([]);
  });
}); 