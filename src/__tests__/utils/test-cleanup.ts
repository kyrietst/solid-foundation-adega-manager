/**
 * @fileoverview Test Cleanup and Maintenance Utilities
 * FASE 8: DOCUMENTAÇÃO E MANUTENIBILIDADE - Subtarefa 8.3.1
 * 
 * @author Adega Manager Testing Team
 * @version 2.0.0
 */

import { vi } from 'vitest'
import fs from 'fs'
import path from 'path'

// ========================================
// OBSOLETE TEST DETECTION
// ========================================

interface TestFileAnalysis {
  filePath: string
  lastModified: Date
  testCount: number
  isObsolete: boolean
  reasons: string[]
}

/**
 * Analyze test files for obsolete patterns
 */
export const analyzeTestFiles = async (testDir: string = 'src'): Promise<TestFileAnalysis[]> => {
  const testFiles = await findTestFiles(testDir)
  const analyses: TestFileAnalysis[] = []

  for (const filePath of testFiles) {
    const content = fs.readFileSync(filePath, 'utf8')
    const stats = fs.statSync(filePath)
    
    const analysis: TestFileAnalysis = {
      filePath,
      lastModified: stats.mtime,
      testCount: countTests(content),
      isObsolete: false,
      reasons: []
    }

    // Check for obsolete patterns
    if (hasObsoletePatterns(content)) {
      analysis.isObsolete = true
      analysis.reasons.push(...getObsoleteReasons(content))
    }

    // Check if file hasn't been modified in 6+ months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    if (stats.mtime < sixMonthsAgo) {
      analysis.isObsolete = true
      analysis.reasons.push('No modifications in 6+ months')
    }

    analyses.push(analysis)
  }

  return analyses
}

/**
 * Find all test files recursively
 */
const findTestFiles = async (dir: string): Promise<string[]> => {
  const testFiles: string[] = []
  
  const walk = (currentDir: string) => {
    const files = fs.readdirSync(currentDir)
    
    for (const file of files) {
      const filePath = path.join(currentDir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walk(filePath)
      } else if (file.match(/\.(test|spec)\.(ts|tsx)$/)) {
        testFiles.push(filePath)
      }
    }
  }
  
  walk(dir)
  return testFiles
}

/**
 * Count test cases in file
 */
const countTests = (content: string): number => {
  const testMatches = content.match(/it\(|test\(/g)
  return testMatches ? testMatches.length : 0
}

/**
 * Check for obsolete patterns
 */
const hasObsoletePatterns = (content: string): boolean => {
  const obsoletePatterns = [
    // Old testing patterns
    /enzyme/i,
    /mount\(/,
    /shallow\(/,
    
    // Deprecated APIs
    /findDOMNode/,
    /UNSAFE_/,
    
    // Old assertion patterns
    /toMatchSnapshot\(\)/,
    /toBeTruthy\(\).*\.length/,
    
    // Old mock patterns
    /jest\.mock\(/,
    /jest\.fn\(/,
    
    // TODO comments older than 3 months (simplified check)
    /TODO.*\d{4}-\d{2}-\d{2}/
  ]

  return obsoletePatterns.some(pattern => pattern.test(content))
}

/**
 * Get reasons why test is considered obsolete
 */
const getObsoleteReasons = (content: string): string[] => {
  const reasons: string[] = []

  if (/enzyme/i.test(content)) {
    reasons.push('Uses deprecated Enzyme testing library')
  }
  
  if (/jest\.mock\(/.test(content)) {
    reasons.push('Uses Jest mocking instead of Vitest')
  }
  
  if (/toMatchSnapshot\(\)/.test(content)) {
    reasons.push('Uses snapshot testing without justification')
  }
  
  if (/UNSAFE_/.test(content)) {
    reasons.push('Uses deprecated React UNSAFE_ methods')
  }

  return reasons
}

// ========================================
// TEST DUPLICATION DETECTOR
// ========================================

interface DuplicationReport {
  duplicatedSetups: Array<{
    pattern: string
    files: string[]
    occurrences: number
  }>
  duplicatedMocks: Array<{
    mockPattern: string
    files: string[]
    occurrences: number
  }>
  duplicatedAssertions: Array<{
    assertion: string
    files: string[]
    occurrences: number
  }>
}

/**
 * Detect duplicated test code patterns
 */
export const detectDuplication = async (testDir: string = 'src'): Promise<DuplicationReport> => {
  const testFiles = await findTestFiles(testDir)
  const setupPatterns = new Map<string, string[]>()
  const mockPatterns = new Map<string, string[]>()
  const assertionPatterns = new Map<string, string[]>()

  for (const filePath of testFiles) {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Detect setup duplication
    const setups = extractSetupPatterns(content)
    setups.forEach(setup => {
      const existing = setupPatterns.get(setup) || []
      setupPatterns.set(setup, [...existing, filePath])
    })
    
    // Detect mock duplication
    const mocks = extractMockPatterns(content)
    mocks.forEach(mock => {
      const existing = mockPatterns.get(mock) || []
      mockPatterns.set(mock, [...existing, filePath])
    })
    
    // Detect assertion duplication
    const assertions = extractAssertionPatterns(content)
    assertions.forEach(assertion => {
      const existing = assertionPatterns.get(assertion) || []
      assertionPatterns.set(assertion, [...existing, filePath])
    })
  }

  return {
    duplicatedSetups: Array.from(setupPatterns.entries())
      .filter(([_, files]) => files.length > 2)
      .map(([pattern, files]) => ({
        pattern,
        files,
        occurrences: files.length
      })),
    
    duplicatedMocks: Array.from(mockPatterns.entries())
      .filter(([_, files]) => files.length > 2)
      .map(([mockPattern, files]) => ({
        mockPattern,
        files,
        occurrences: files.length
      })),
    
    duplicatedAssertions: Array.from(assertionPatterns.entries())
      .filter(([_, files]) => files.length > 3)
      .map(([assertion, files]) => ({
        assertion,
        files,
        occurrences: files.length
      }))
  }
}

/**
 * Extract setup patterns from test content
 */
const extractSetupPatterns = (content: string): string[] => {
  const patterns: string[] = []
  
  // BeforeEach patterns
  const beforeEachMatches = content.match(/beforeEach\([^}]+}/gs)
  beforeEachMatches?.forEach(match => {
    const normalized = normalizeCode(match)
    patterns.push(normalized)
  })
  
  // Render patterns
  const renderMatches = content.match(/render\([^)]+\)/g)
  renderMatches?.forEach(match => {
    patterns.push(normalizeCode(match))
  })

  return patterns
}

/**
 * Extract mock patterns from test content
 */
const extractMockPatterns = (content: string): string[] => {
  const patterns: string[] = []
  
  // vi.mock patterns
  const mockMatches = content.match(/vi\.mock\([^}]+}/gs)
  mockMatches?.forEach(match => {
    patterns.push(normalizeCode(match))
  })
  
  // Mock implementations
  const mockImplMatches = content.match(/\.mockImplementation\([^}]+}/gs)
  mockImplMatches?.forEach(match => {
    patterns.push(normalizeCode(match))
  })

  return patterns
}

/**
 * Extract assertion patterns from test content
 */
const extractAssertionPatterns = (content: string): string[] => {
  const patterns: string[] = []
  
  // Expect patterns
  const expectMatches = content.match(/expect\([^)]+\)\.[^;]+/g)
  expectMatches?.forEach(match => {
    patterns.push(normalizeCode(match))
  })

  return patterns
}

/**
 * Normalize code for comparison
 */
const normalizeCode = (code: string): string => {
  return code
    .replace(/\s+/g, ' ')
    .replace(/'/g, '"')
    .trim()
}

// ========================================
// TEST PERFORMANCE ANALYZER
// ========================================

interface TestPerformanceReport {
  slowTests: Array<{
    file: string
    testName: string
    averageTime: number
    maxTime: number
  }>
  totalExecutionTime: number
  testCount: number
  averageTestTime: number
}

/**
 * Analyze test performance from execution results
 */
export const analyzeTestPerformance = (testResults: any): TestPerformanceReport => {
  const slowTests: TestPerformanceReport['slowTests'] = []
  let totalTime = 0
  let testCount = 0

  // This would be implemented with actual test execution data
  // For now, providing the structure
  
  return {
    slowTests,
    totalExecutionTime: totalTime,
    testCount,
    averageTestTime: testCount > 0 ? totalTime / testCount : 0
  }
}

// ========================================
// AUTOMATED CLEANUP ACTIONS
// ========================================

/**
 * Generate cleanup report and suggestions
 */
export const generateCleanupReport = async (): Promise<{
  obsoleteFiles: TestFileAnalysis[]
  duplications: DuplicationReport
  recommendations: string[]
}> => {
  const obsoleteFiles = await analyzeTestFiles()
  const duplications = await detectDuplication()
  const recommendations: string[] = []

  // Generate recommendations based on analysis
  if (obsoleteFiles.some(f => f.isObsolete)) {
    recommendations.push('Review and update obsolete test files')
  }
  
  if (duplications.duplicatedSetups.length > 0) {
    recommendations.push('Consolidate duplicated test setup code')
  }
  
  if (duplications.duplicatedMocks.length > 0) {
    recommendations.push('Create reusable mock modules')
  }

  return {
    obsoleteFiles: obsoleteFiles.filter(f => f.isObsolete),
    duplications,
    recommendations
  }
}

/**
 * Execute automated cleanup tasks
 */
export const executeCleanupTasks = async (options: {
  removeObsoleteFiles?: boolean
  updateDeprecatedPatterns?: boolean
  consolidateDuplicates?: boolean
} = {}) => {
  const report = await generateCleanupReport()
  const actions: string[] = []

  if (options.removeObsoleteFiles) {
    // This would actually remove obsolete files (with confirmation)
    actions.push(`Would remove ${report.obsoleteFiles.length} obsolete test files`)
  }

  if (options.updateDeprecatedPatterns) {
    // This would update deprecated patterns
    actions.push('Would update deprecated testing patterns')
  }

  if (options.consolidateDuplicates) {
    // This would consolidate duplicated code
    actions.push('Would consolidate duplicated test code')
  }

  return {
    report,
    plannedActions: actions
  }
}

// ========================================
// TEST MAINTENANCE SCHEDULER
// ========================================

/**
 * Schedule maintenance tasks
 */
export const scheduleMaintenanceTasks = () => {
  return {
    daily: [
      'Run flaky test detection',
      'Check test execution time',
      'Verify coverage thresholds'
    ],
    weekly: [
      'Analyze test duplication',
      'Review obsolete test patterns',
      'Update test dependencies'
    ],
    monthly: [
      'Full cleanup report generation',
      'Test suite performance optimization',
      'Documentation updates'
    ],
    quarterly: [
      'Major test refactoring',
      'Testing strategy review',
      'Tool and framework updates'
    ]
  }
}

export default {
  analyzeTestFiles,
  detectDuplication,
  analyzeTestPerformance,
  generateCleanupReport,
  executeCleanupTasks,
  scheduleMaintenanceTasks
}