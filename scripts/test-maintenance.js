#!/usr/bin/env node

/**
 * @fileoverview Automated Test Maintenance Script
 * FASE 8: DOCUMENTAÇÃO E MANUTENIBILIDADE - Subtarefa 8.3.2
 * 
 * @author Adega Manager Testing Team
 * @version 2.0.0
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
  testDirs: ['src/__tests__', 'src/features', 'src/shared'],
  metricsFile: '.test-metrics.json',
  reportFile: 'test-maintenance-report.md',
  thresholds: {
    coverage: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80
    },
    performance: {
      maxExecutionTime: 300000, // 5 minutes
      maxSlowTests: 10
    },
    flaky: {
      maxFlakyTests: 5,
      maxFailureRate: 0.05
    }
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Log with timestamp
 */
const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [${level}] ${message}`)
}

/**
 * Execute command safely
 */
const execSafe = (command, options = {}) => {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    })
    return { success: true, output: result, error: null }
  } catch (error) {
    return { success: false, output: null, error: error.message }
  }
}

/**
 * Read JSON file safely
 */
const readJsonSafe = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
  } catch (error) {
    log(`Error reading ${filePath}: ${error.message}`, 'WARN')
  }
  return null
}

/**
 * Write JSON file safely
 */
const writeJsonSafe = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log(`Error writing ${filePath}: ${error.message}`, 'ERROR')
    return false
  }
}

// ========================================
// MAINTENANCE TASKS
// ========================================

/**
 * Run full test suite and collect metrics
 */
const runTestsAndCollectMetrics = async () => {
  log('Running full test suite to collect metrics...')
  
  const testResult = execSafe('npm run test:coverage -- --reporter=json --outputFile=test-results.json')
  
  if (!testResult.success) {
    log('Test execution failed', 'ERROR')
    return null
  }

  // Read test results
  const testResults = readJsonSafe('test-results.json')
  const coverageResults = readJsonSafe('coverage/coverage-summary.json')
  
  if (!testResults) {
    log('Could not read test results', 'ERROR')
    return null
  }

  // Extract metrics
  const metrics = {
    timestamp: new Date().toISOString(),
    totalTests: testResults.numTotalTests || 0,
    passedTests: testResults.numPassedTests || 0,
    failedTests: testResults.numFailedTests || 0,
    skippedTests: testResults.numPendingTests || 0,
    executionTime: Date.now(), // Would be actual execution time
    coverage: coverageResults?.total ? {
      lines: coverageResults.total.lines.pct,
      branches: coverageResults.total.branches.pct,
      functions: coverageResults.total.functions.pct,
      statements: coverageResults.total.statements.pct
    } : null,
    slowTests: [], // Would extract from detailed results
    flakyTests: [] // Would detect from multiple runs
  }

  log(`Tests completed: ${metrics.passedTests}/${metrics.totalTests} passed`)
  
  return metrics
}

/**
 * Analyze test files for issues
 */
const analyzeTestFiles = () => {
  log('Analyzing test files for issues...')
  
  const issues = {
    obsoleteFiles: [],
    duplicatedCode: [],
    missingTests: [],
    largeTestFiles: []
  }

  const findTestFiles = (dir) => {
    const files = []
    if (!fs.existsSync(dir)) return files
    
    const walk = (currentDir) => {
      fs.readdirSync(currentDir).forEach(file => {
        const filePath = path.join(currentDir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory() && !file.startsWith('.')) {
          walk(filePath)
        } else if (file.match(/\.(test|spec)\.(ts|tsx)$/)) {
          files.push(filePath)
        }
      })
    }
    
    walk(dir)
    return files
  }

  // Analyze each test directory
  CONFIG.testDirs.forEach(dir => {
    const testFiles = findTestFiles(dir)
    
    testFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const stats = fs.statSync(filePath)
        
        // Check for obsolete patterns
        if (content.includes('enzyme') || content.includes('jest.mock')) {
          issues.obsoleteFiles.push({
            file: filePath,
            reasons: ['Uses deprecated testing patterns']
          })
        }
        
        // Check file size
        if (stats.size > 50000) { // 50KB
          issues.largeTestFiles.push({
            file: filePath,
            size: stats.size
          })
        }
        
        // Count tests
        const testCount = (content.match(/it\(|test\(/g) || []).length
        if (testCount > 50) {
          issues.largeTestFiles.push({
            file: filePath,
            testCount
          })
        }
        
      } catch (error) {
        log(`Error analyzing ${filePath}: ${error.message}`, 'WARN')
      }
    })
  })

  log(`Analysis complete: ${issues.obsoleteFiles.length} obsolete files, ${issues.largeTestFiles.length} large files`)
  
  return issues
}

/**
 * Check test dependencies
 */
const checkDependencies = () => {
  log('Checking test dependencies...')
  
  const packageJson = readJsonSafe('package.json')
  if (!packageJson) {
    log('Could not read package.json', 'ERROR')
    return null
  }

  const testDeps = [
    'vitest',
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
    'jest-axe'
  ]

  const issues = []
  const devDeps = packageJson.devDependencies || {}

  testDeps.forEach(dep => {
    if (!devDeps[dep]) {
      issues.push(`Missing test dependency: ${dep}`)
    }
  })

  // Check for outdated dependencies (simplified)
  const outdatedResult = execSafe('npm outdated --json', { stdio: 'pipe' })
  if (outdatedResult.success && outdatedResult.output) {
    try {
      const outdated = JSON.parse(outdatedResult.output)
      Object.keys(outdated).forEach(pkg => {
        if (testDeps.includes(pkg)) {
          issues.push(`Outdated test dependency: ${pkg}`)
        }
      })
    } catch (error) {
      log('Could not parse outdated dependencies', 'WARN')
    }
  }

  log(`Dependency check complete: ${issues.length} issues found`)
  
  return {
    issues,
    testDependencies: testDeps.filter(dep => devDeps[dep])
  }
}

/**
 * Generate maintenance report
 */
const generateReport = (metrics, issues, dependencies) => {
  log('Generating maintenance report...')
  
  const report = `# Test Maintenance Report

**Generated:** ${new Date().toISOString()}
**System:** Adega Manager (Production: 925+ records)

## 📊 Test Metrics Summary

${metrics ? `
- **Total Tests:** ${metrics.totalTests}
- **Passed:** ${metrics.passedTests} (${((metrics.passedTests / metrics.totalTests) * 100).toFixed(1)}%)
- **Failed:** ${metrics.failedTests}
- **Skipped:** ${metrics.skippedTests}

### Coverage
${metrics.coverage ? `
- **Lines:** ${metrics.coverage.lines}% ${metrics.coverage.lines >= CONFIG.thresholds.coverage.lines ? '✅' : '❌'}
- **Branches:** ${metrics.coverage.branches}% ${metrics.coverage.branches >= CONFIG.thresholds.coverage.branches ? '✅' : '❌'}
- **Functions:** ${metrics.coverage.functions}% ${metrics.coverage.functions >= CONFIG.thresholds.coverage.functions ? '✅' : '❌'}
- **Statements:** ${metrics.coverage.statements}% ${metrics.coverage.statements >= CONFIG.thresholds.coverage.statements ? '✅' : '❌'}
` : '⚠️ Coverage data not available'}
` : '⚠️ Test metrics not available'}

## 🔍 Code Analysis

### Obsolete Test Files
${issues.obsoleteFiles.length > 0 ? 
  issues.obsoleteFiles.map(file => `- \`${file.file}\`: ${file.reasons.join(', ')}`).join('\n') :
  '✅ No obsolete files detected'
}

### Large Test Files
${issues.largeTestFiles.length > 0 ?
  issues.largeTestFiles.map(file => 
    `- \`${file.file}\`${file.size ? ` (${Math.round(file.size/1024)}KB)` : ''}${file.testCount ? ` (${file.testCount} tests)` : ''}`
  ).join('\n') :
  '✅ No oversized test files'
}

## 📦 Dependencies

### Issues
${dependencies.issues.length > 0 ?
  dependencies.issues.map(issue => `- ⚠️ ${issue}`).join('\n') :
  '✅ No dependency issues'
}

### Test Dependencies
${dependencies.testDependencies.map(dep => `- ✅ ${dep}`).join('\n')}

## 🎯 Recommendations

${generateRecommendations(metrics, issues, dependencies)}

## 📈 Next Actions

- [ ] Address high-priority issues
- [ ] Update outdated dependencies
- [ ] Refactor large test files
- [ ] Improve coverage where needed
- [ ] Schedule regular maintenance

---
*Report generated automatically by Test Maintenance System*
`

  if (fs.writeFileSync(CONFIG.reportFile, report)) {
    log(`Report saved to ${CONFIG.reportFile}`)
    return true
  }
  
  return false
}

/**
 * Generate recommendations based on analysis
 */
const generateRecommendations = (metrics, issues, dependencies) => {
  const recommendations = []

  if (metrics && metrics.failedTests > 0) {
    recommendations.push('🚨 **URGENT:** Fix failing tests before proceeding')
  }

  if (metrics && metrics.coverage) {
    Object.entries(CONFIG.thresholds.coverage).forEach(([key, threshold]) => {
      if (metrics.coverage[key] < threshold) {
        recommendations.push(`📈 Improve ${key} coverage to ${threshold}% (currently ${metrics.coverage[key]}%)`)
      }
    })
  }

  if (issues.obsoleteFiles.length > 0) {
    recommendations.push(`🔧 Update ${issues.obsoleteFiles.length} obsolete test file(s)`)
  }

  if (issues.largeTestFiles.length > 0) {
    recommendations.push(`✂️ Split ${issues.largeTestFiles.length} large test file(s)`)
  }

  if (dependencies.issues.length > 0) {
    recommendations.push(`📦 Address ${dependencies.issues.length} dependency issue(s)`)
  }

  if (recommendations.length === 0) {
    recommendations.push('🎉 All checks passed! Test suite is in good health.')
  }

  return recommendations.join('\n')
}

/**
 * Cleanup temporary files
 */
const cleanup = () => {
  const tempFiles = ['test-results.json']
  
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file)
      } catch (error) {
        log(`Could not delete ${file}: ${error.message}`, 'WARN')
      }
    }
  })
}

// ========================================
// MAIN EXECUTION
// ========================================

const main = async () => {
  log('Starting test maintenance process...')
  
  try {
    // Step 1: Run tests and collect metrics
    const metrics = await runTestsAndCollectMetrics()
    
    // Step 2: Analyze test files
    const issues = analyzeTestFiles()
    
    // Step 3: Check dependencies
    const dependencies = checkDependencies()
    
    // Step 4: Generate report
    const reportGenerated = generateReport(metrics, issues, dependencies)
    
    // Step 5: Store metrics for trends
    if (metrics) {
      const existingMetrics = readJsonSafe(CONFIG.metricsFile) || []
      existingMetrics.push({
        date: new Date().toISOString().split('T')[0],
        metrics
      })
      
      // Keep only last 30 days
      const recentMetrics = existingMetrics
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 30)
      
      writeJsonSafe(CONFIG.metricsFile, recentMetrics)
    }
    
    // Step 6: Cleanup
    cleanup()
    
    if (reportGenerated) {
      log('✅ Test maintenance completed successfully')
      log(`📄 Report available at: ${CONFIG.reportFile}`)
    } else {
      log('⚠️ Test maintenance completed with warnings')
    }
    
    // Exit with appropriate code
    const hasErrors = (metrics && metrics.failedTests > 0) || 
                     (issues.obsoleteFiles.length > 5) ||
                     (dependencies.issues.length > 0)
    
    process.exit(hasErrors ? 1 : 0)
    
  } catch (error) {
    log(`Error during maintenance: ${error.message}`, 'ERROR')
    cleanup()
    process.exit(1)
  }
}

// Execute if called directly
if (require.main === module) {
  main()
}

module.exports = {
  runTestsAndCollectMetrics,
  analyzeTestFiles,
  checkDependencies,
  generateReport
}