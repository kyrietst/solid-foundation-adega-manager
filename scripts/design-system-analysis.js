#!/usr/bin/env node

/**
 * Design System Performance Analysis
 *
 * Analyzes bundle size impact, design token usage, and performance metrics
 * for the Adega Manager design system transformation.
 *
 * PHASE 4 - Design System Transformation
 * Created: 2025-09-16
 * Purpose: Performance monitoring and bundle analysis
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  // Directories to analyze
  srcDir: path.join(projectRoot, 'src'),
  distDir: path.join(projectRoot, 'dist'),

  // File patterns
  patterns: {
    typescript: ['**/*.tsx', '**/*.ts'],
    styles: ['**/*.css', '**/*.scss'],
    ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*']
  },

  // Design token patterns for detection
  tokenPatterns: {
    colors: /(?:bg-|text-|border-)(accent-gold-\d+|primary-(?:black|yellow)|gray-\d+|accent-(?:blue|green|red|purple|orange)|chart-\d+)/g,
    dimensions: /(?:w-|h-|max-w-|max-h-|min-w-|min-h-)(col-\w+|modal-\w+|content-\w+|dialog-\w+)/g,
    hardcodedColors: /#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g,
    hardcodedSizes: /\b\d+px\b|\b\d+vh\b|\b\d+vw\b/g
  },

  // Performance thresholds
  thresholds: {
    bundleSize: 2 * 1024 * 1024, // 2MB
    cssSize: 300 * 1024, // 300KB
    tokenCoverage: 95, // 95%
    maxHardcodedValues: 10
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Recursively find files matching patterns
 */
function findFiles(dir, patterns) {
  const files = [];

  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip ignored directories
        const relativePath = path.relative(projectRoot, fullPath);
        if (!CONFIG.patterns.ignore.some(pattern =>
          relativePath.includes(pattern.replace('**/', '').replace('/**', '')))) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        // Check if file matches any pattern
        const relativePath = path.relative(dir, fullPath);
        if (patterns.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
          return regex.test(relativePath);
        })) {
          files.push(fullPath);
        }
      }
    }
  }

  walkDir(dir);
  return files;
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate percentage
 */
function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Analyze design token usage across the codebase
 */
function analyzeTokenUsage() {
  console.log('🔍 Analyzing design token usage...');

  const files = findFiles(CONFIG.srcDir, CONFIG.patterns.typescript);
  const stats = {
    totalFiles: files.length,
    filesWithTokens: 0,
    totalTokens: 0,
    tokenTypes: {
      colors: 0,
      dimensions: 0
    },
    hardcodedValues: {
      colors: 0,
      sizes: 0
    },
    violations: []
  };

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(CONFIG.srcDir, file);

      // Count design tokens
      const colorTokens = content.match(CONFIG.tokenPatterns.colors) || [];
      const dimensionTokens = content.match(CONFIG.tokenPatterns.dimensions) || [];
      const hardcodedColors = content.match(CONFIG.tokenPatterns.hardcodedColors) || [];
      const hardcodedSizes = content.match(CONFIG.tokenPatterns.hardcodedSizes) || [];

      const totalTokensInFile = colorTokens.length + dimensionTokens.length;
      const totalHardcodedInFile = hardcodedColors.length + hardcodedSizes.length;

      if (totalTokensInFile > 0) {
        stats.filesWithTokens++;
      }

      stats.totalTokens += totalTokensInFile;
      stats.tokenTypes.colors += colorTokens.length;
      stats.tokenTypes.dimensions += dimensionTokens.length;
      stats.hardcodedValues.colors += hardcodedColors.length;
      stats.hardcodedValues.sizes += hardcodedSizes.length;

      // Track violations
      if (totalHardcodedInFile > 0) {
        stats.violations.push({
          file: relativePath,
          hardcodedColors: hardcodedColors.length,
          hardcodedSizes: hardcodedSizes.length,
          tokenUsage: totalTokensInFile,
          examples: {
            colors: hardcodedColors.slice(0, 3),
            sizes: hardcodedSizes.slice(0, 3)
          }
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not analyze ${file}: ${error.message}`);
    }
  }

  // Calculate coverage
  const totalHardcoded = stats.hardcodedValues.colors + stats.hardcodedValues.sizes;
  const totalValues = stats.totalTokens + totalHardcoded;
  const coverage = totalValues > 0 ? calculatePercentage(stats.totalTokens, totalValues) : 100;

  return {
    ...stats,
    coverage,
    totalHardcoded
  };
}

/**
 * Analyze bundle size and performance metrics
 */
function analyzeBundleSize() {
  console.log('📦 Analyzing bundle size...');

  const stats = {
    dist: {
      exists: fs.existsSync(CONFIG.distDir),
      totalSize: 0,
      files: []
    },
    css: {
      totalSize: 0,
      files: []
    },
    js: {
      totalSize: 0,
      files: []
    },
    assets: {
      totalSize: 0,
      files: []
    }
  };

  if (!stats.dist.exists) {
    console.warn('⚠️  Dist directory not found. Run `npm run build` first.');
    return stats;
  }

  // Analyze dist directory
  function analyzeDistDir(dir, prefix = '') {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        analyzeDistDir(fullPath, `${prefix}${item}/`);
      } else {
        const size = stat.size;
        const relativePath = `${prefix}${item}`;

        stats.dist.totalSize += size;
        stats.dist.files.push({ path: relativePath, size });

        // Categorize by file type
        if (item.endsWith('.css')) {
          stats.css.totalSize += size;
          stats.css.files.push({ path: relativePath, size });
        } else if (item.endsWith('.js') || item.endsWith('.mjs')) {
          stats.js.totalSize += size;
          stats.js.files.push({ path: relativePath, size });
        } else {
          stats.assets.totalSize += size;
          stats.assets.files.push({ path: relativePath, size });
        }
      }
    }
  }

  analyzeDistDir(CONFIG.distDir);

  // Sort files by size
  stats.dist.files.sort((a, b) => b.size - a.size);
  stats.css.files.sort((a, b) => b.size - a.size);
  stats.js.files.sort((a, b) => b.size - a.size);

  return stats;
}

/**
 * Analyze code quality and violations
 */
function analyzeCodeQuality() {
  console.log('🔍 Analyzing code quality...');

  try {
    // Run ESLint analysis
    const eslintCommand = 'npx eslint src/ --format=json --quiet';
    const eslintOutput = execSync(eslintCommand, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
    });

    const eslintResults = JSON.parse(eslintOutput);

    const stats = {
      totalFiles: eslintResults.length,
      filesWithErrors: 0,
      filesWithWarnings: 0,
      totalErrors: 0,
      totalWarnings: 0,
      designSystemViolations: {
        hardcodedColors: 0,
        arbitraryValues: 0,
        sizeTokens: 0,
        semanticColors: 0
      },
      topViolations: []
    };

    for (const result of eslintResults) {
      if (result.errorCount > 0) stats.filesWithErrors++;
      if (result.warningCount > 0) stats.filesWithWarnings++;

      stats.totalErrors += result.errorCount;
      stats.totalWarnings += result.warningCount;

      // Analyze design system specific violations
      for (const message of result.messages) {
        if (message.ruleId?.startsWith('adega/')) {
          switch (message.ruleId) {
            case 'adega/no-hardcoded-colors':
              stats.designSystemViolations.hardcodedColors++;
              break;
            case 'adega/no-arbitrary-values':
              stats.designSystemViolations.arbitraryValues++;
              break;
            case 'adega/require-size-tokens':
              stats.designSystemViolations.sizeTokens++;
              break;
            case 'adega/prefer-semantic-colors':
              stats.designSystemViolations.semanticColors++;
              break;
          }

          stats.topViolations.push({
            file: result.filePath.replace(CONFIG.srcDir + '/', ''),
            rule: message.ruleId,
            message: message.message,
            line: message.line,
            severity: message.severity === 2 ? 'error' : 'warning'
          });
        }
      }
    }

    // Sort violations by severity and frequency
    stats.topViolations.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === 'error' ? -1 : 1;
      }
      return a.rule.localeCompare(b.rule);
    });

    return stats;
  } catch (error) {
    console.warn('⚠️  Could not run ESLint analysis:', error.message);
    return {
      totalFiles: 0,
      filesWithErrors: 0,
      filesWithWarnings: 0,
      totalErrors: 0,
      totalWarnings: 0,
      designSystemViolations: {
        hardcodedColors: 0,
        arbitraryValues: 0,
        sizeTokens: 0,
        semanticColors: 0
      },
      topViolations: []
    };
  }
}

/**
 * Generate performance report
 */
function generateReport(tokenStats, bundleStats, qualityStats) {
  const report = {
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    phase: 'Phase 4 - Final',
    summary: {
      tokenCoverage: tokenStats.coverage,
      bundleSize: bundleStats.dist.totalSize,
      cssSize: bundleStats.css.totalSize,
      totalViolations: qualityStats.totalErrors + qualityStats.totalWarnings,
      designSystemCompliance: qualityStats.designSystemViolations
    },
    detailed: {
      tokens: tokenStats,
      bundle: bundleStats,
      quality: qualityStats
    },
    recommendations: [],
    status: 'UNKNOWN'
  };

  // Generate recommendations based on analysis
  if (tokenStats.coverage < CONFIG.thresholds.tokenCoverage) {
    report.recommendations.push({
      type: 'warning',
      category: 'Design Tokens',
      message: `Token coverage is ${tokenStats.coverage}%, below threshold of ${CONFIG.thresholds.tokenCoverage}%`,
      action: 'Review violations and migrate hardcoded values to design tokens'
    });
  }

  if (bundleStats.dist.totalSize > CONFIG.thresholds.bundleSize) {
    report.recommendations.push({
      type: 'warning',
      category: 'Bundle Size',
      message: `Bundle size is ${formatBytes(bundleStats.dist.totalSize)}, exceeds threshold of ${formatBytes(CONFIG.thresholds.bundleSize)}`,
      action: 'Consider code splitting and tree shaking optimizations'
    });
  }

  if (bundleStats.css.totalSize > CONFIG.thresholds.cssSize) {
    report.recommendations.push({
      type: 'warning',
      category: 'CSS Size',
      message: `CSS size is ${formatBytes(bundleStats.css.totalSize)}, exceeds threshold of ${formatBytes(CONFIG.thresholds.cssSize)}`,
      action: 'Review unused CSS and optimize design token usage'
    });
  }

  if (tokenStats.totalHardcoded > CONFIG.thresholds.maxHardcodedValues) {
    report.recommendations.push({
      type: 'error',
      category: 'Code Quality',
      message: `Found ${tokenStats.totalHardcoded} hardcoded values, exceeds threshold of ${CONFIG.thresholds.maxHardcodedValues}`,
      action: 'Migrate remaining hardcoded values to design tokens'
    });
  }

  // Determine overall status
  const hasErrors = qualityStats.totalErrors > 0 ||
                   tokenStats.totalHardcoded > CONFIG.thresholds.maxHardcodedValues;
  const hasWarnings = qualityStats.totalWarnings > 0 ||
                     report.recommendations.some(r => r.type === 'warning');

  if (hasErrors) {
    report.status = 'NEEDS_ATTENTION';
  } else if (hasWarnings) {
    report.status = 'GOOD_WITH_RECOMMENDATIONS';
  } else {
    report.status = 'EXCELLENT';
  }

  return report;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('🚀 Design System Performance Analysis\n');
  console.log('Phase 4 - Design System Transformation');
  console.log('=====================================\n');

  try {
    // Run all analyses
    const tokenStats = analyzeTokenUsage();
    const bundleStats = analyzeBundleSize();
    const qualityStats = analyzeCodeQuality();

    // Generate comprehensive report
    const report = generateReport(tokenStats, bundleStats, qualityStats);

    // Display summary
    console.log('\n📊 ANALYSIS SUMMARY');
    console.log('===================');
    console.log(`Status: ${report.status}`);
    console.log(`Token Coverage: ${report.summary.tokenCoverage}%`);
    console.log(`Bundle Size: ${formatBytes(report.summary.bundleSize)}`);
    console.log(`CSS Size: ${formatBytes(report.summary.cssSize)}`);
    console.log(`Total Violations: ${report.summary.totalViolations}`);

    // Design system compliance
    console.log('\n🎨 DESIGN SYSTEM COMPLIANCE');
    console.log('============================');
    console.log(`Files Analyzed: ${tokenStats.totalFiles}`);
    console.log(`Files with Tokens: ${tokenStats.filesWithTokens}`);
    console.log(`Total Design Tokens: ${tokenStats.totalTokens}`);
    console.log(`Color Tokens: ${tokenStats.tokenTypes.colors}`);
    console.log(`Dimension Tokens: ${tokenStats.tokenTypes.dimensions}`);
    console.log(`Hardcoded Colors: ${tokenStats.hardcodedValues.colors}`);
    console.log(`Hardcoded Sizes: ${tokenStats.hardcodedValues.sizes}`);

    // Bundle analysis
    if (bundleStats.dist.exists) {
      console.log('\n📦 BUNDLE ANALYSIS');
      console.log('==================');
      console.log(`Total Bundle: ${formatBytes(bundleStats.dist.totalSize)}`);
      console.log(`JavaScript: ${formatBytes(bundleStats.js.totalSize)}`);
      console.log(`CSS: ${formatBytes(bundleStats.css.totalSize)}`);
      console.log(`Assets: ${formatBytes(bundleStats.assets.totalSize)}`);

      // Top largest files
      console.log('\nLargest Files:');
      bundleStats.dist.files.slice(0, 5).forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.path} (${formatBytes(file.size)})`);
      });
    }

    // Code quality
    console.log('\n🔍 CODE QUALITY');
    console.log('================');
    console.log(`Total Errors: ${qualityStats.totalErrors}`);
    console.log(`Total Warnings: ${qualityStats.totalWarnings}`);
    console.log(`Design System Violations:`);
    console.log(`  Hardcoded Colors: ${qualityStats.designSystemViolations.hardcodedColors}`);
    console.log(`  Arbitrary Values: ${qualityStats.designSystemViolations.arbitraryValues}`);
    console.log(`  Size Token Issues: ${qualityStats.designSystemViolations.sizeTokens}`);
    console.log(`  Semantic Color Issues: ${qualityStats.designSystemViolations.semanticColors}`);

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS');
      console.log('==================');
      report.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'error' ? '❌' : '⚠️';
        console.log(`${icon} ${rec.category}: ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
      });
    }

    // Top violations
    if (qualityStats.topViolations.length > 0) {
      console.log('\n🚨 TOP VIOLATIONS');
      console.log('=================');
      qualityStats.topViolations.slice(0, 10).forEach((violation, index) => {
        const icon = violation.severity === 'error' ? '❌' : '⚠️';
        console.log(`${icon} ${violation.file}:${violation.line}`);
        console.log(`   ${violation.rule}: ${violation.message}`);
      });
    }

    // Save detailed report
    const reportPath = path.join(projectRoot, 'design-system-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(report.status === 'EXCELLENT' ? 0 : 1);

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeTokenUsage, analyzeBundleSize, analyzeCodeQuality, generateReport };