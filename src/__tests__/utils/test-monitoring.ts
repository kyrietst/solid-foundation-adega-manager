/**
 * @fileoverview Test Monitoring and Metrics System
 * FASE 8: DOCUMENTAÇÃO E MANUTENIBILIDADE - Subtarefa 8.3.2
 * 
 * @author Adega Manager Testing Team
 * @version 2.0.0
 */

import fs from 'fs'
import path from 'path'

// ========================================
// TEST METRICS COLLECTION
// ========================================

interface TestMetrics {
  timestamp: string
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  executionTime: number
  coverage: {
    lines: number
    branches: number
    functions: number
    statements: number
  }
  slowTests: Array<{
    name: string
    duration: number
  }>
  flakyTests: string[]
}

interface TestTrend {
  date: string
  metrics: TestMetrics
}

/**
 * Test Metrics Collector
 */
export class TestMetricsCollector {
  private metricsFile: string
  private trends: TestTrend[]

  constructor(metricsFile = '.test-metrics.json') {
    this.metricsFile = metricsFile
    this.trends = this.loadExistingMetrics()
  }

  /**
   * Load existing metrics from file
   */
  private loadExistingMetrics(): TestTrend[] {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.warn('Could not load existing metrics:', error)
    }
    return []
  }

  /**
   * Save metrics to file
   */
  private saveMetrics() {
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(this.trends, null, 2))
    } catch (error) {
      console.error('Could not save metrics:', error)
    }
  }

  /**
   * Record new test metrics
   */
  recordMetrics(metrics: TestMetrics) {
    const trend: TestTrend = {
      date: new Date().toISOString().split('T')[0],
      metrics
    }

    // Remove existing entry for today if exists
    this.trends = this.trends.filter(t => t.date !== trend.date)
    
    // Add new entry
    this.trends.push(trend)
    
    // Keep only last 30 days
    this.trends = this.trends
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30)
    
    this.saveMetrics()
  }

  /**
   * Get metrics trends
   */
  getTrends(): TestTrend[] {
    return [...this.trends].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): TestMetrics | null {
    if (this.trends.length === 0) return null
    
    const latest = this.trends.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
    
    return latest.metrics
  }

  /**
   * Analyze performance trends
   */
  analyzePerformanceTrends() {
    if (this.trends.length < 7) {
      return { status: 'insufficient_data', message: 'Need at least 7 days of data' }
    }

    const recent = this.trends.slice(-7) // Last 7 days
    const older = this.trends.slice(-14, -7) // Previous 7 days
    
    const recentAvgTime = recent.reduce((sum, t) => sum + t.metrics.executionTime, 0) / recent.length
    const olderAvgTime = older.length > 0 ? 
      older.reduce((sum, t) => sum + t.metrics.executionTime, 0) / older.length : 
      recentAvgTime

    const performanceChange = ((recentAvgTime - olderAvgTime) / olderAvgTime) * 100

    return {
      status: 'analyzed',
      recentAvgTime,
      olderAvgTime,
      performanceChange,
      trend: performanceChange > 10 ? 'degrading' : 
             performanceChange < -10 ? 'improving' : 'stable'
    }
  }

  /**
   * Detect flaky tests over time
   */
  detectFlakyTests(): { flakyTests: string[], confidence: number } {
    const testFailures = new Map<string, { total: number, failures: number }>()
    
    this.trends.forEach(trend => {
      trend.metrics.flakyTests.forEach(testName => {
        const current = testFailures.get(testName) || { total: 0, failures: 0 }
        testFailures.set(testName, {
          total: current.total + 1,
          failures: current.failures + 1
        })
      })
    })

    const flakyTests = Array.from(testFailures.entries())
      .filter(([_, stats]) => {
        const failureRate = stats.failures / stats.total
        return failureRate > 0.1 && stats.total >= 3 // More than 10% failure rate with at least 3 occurrences
      })
      .map(([testName]) => testName)

    const confidence = flakyTests.length > 0 ? 
      Math.min(95, Math.max(50, (this.trends.length / 30) * 100)) : 100

    return { flakyTests, confidence }
  }
}

// ========================================
// ALERT SYSTEM
// ========================================

interface AlertRule {
  name: string
  condition: (metrics: TestMetrics, trends: TestTrend[]) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
}

interface Alert {
  rule: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  metrics: TestMetrics
}

/**
 * Test Alert System
 */
export class TestAlertSystem {
  private rules: AlertRule[]
  private alerts: Alert[]

  constructor() {
    this.rules = this.getDefaultRules()
    this.alerts = []
  }

  /**
   * Default alert rules
   */
  private getDefaultRules(): AlertRule[] {
    return [
      {
        name: 'test_failure_rate',
        condition: (metrics) => {
          const failureRate = metrics.failedTests / metrics.totalTests
          return failureRate > 0.05 // More than 5% failure rate
        },
        severity: 'high',
        message: 'Test failure rate exceeded 5%'
      },
      {
        name: 'execution_time_spike',
        condition: (metrics, trends) => {
          if (trends.length < 7) return false
          const recent = trends.slice(-7)
          const avgTime = recent.reduce((sum, t) => sum + t.metrics.executionTime, 0) / recent.length
          return metrics.executionTime > avgTime * 1.5 // 50% slower than average
        },
        severity: 'medium',
        message: 'Test execution time significantly increased'
      },
      {
        name: 'coverage_drop',
        condition: (metrics, trends) => {
          if (trends.length === 0) return false
          const lastMetrics = trends[trends.length - 1].metrics
          return metrics.coverage.lines < lastMetrics.coverage.lines - 5 // 5% drop in coverage
        },
        severity: 'high',
        message: 'Code coverage dropped significantly'
      },
      {
        name: 'flaky_tests_detected',
        condition: (metrics) => metrics.flakyTests.length > 0,
        severity: 'medium',
        message: 'Flaky tests detected'
      },
      {
        name: 'slow_tests_increase',
        condition: (metrics) => metrics.slowTests.length > 10,
        severity: 'low',
        message: 'Number of slow tests increased'
      },
      {
        name: 'critical_failure_rate',
        condition: (metrics) => {
          const failureRate = metrics.failedTests / metrics.totalTests
          return failureRate > 0.20 // More than 20% failure rate
        },
        severity: 'critical',
        message: 'CRITICAL: Test failure rate exceeded 20%'
      }
    ]
  }

  /**
   * Check alerts for given metrics
   */
  checkAlerts(metrics: TestMetrics, trends: TestTrend[]): Alert[] {
    const newAlerts: Alert[] = []

    this.rules.forEach(rule => {
      if (rule.condition(metrics, trends)) {
        const alert: Alert = {
          rule: rule.name,
          severity: rule.severity,
          message: rule.message,
          timestamp: new Date().toISOString(),
          metrics
        }
        newAlerts.push(alert)
      }
    })

    this.alerts.push(...newAlerts)
    return newAlerts
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(hours = 24): Alert[] {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)
    
    return this.alerts.filter(alert => 
      new Date(alert.timestamp) > cutoff
    )
  }

  /**
   * Get alert summary
   */
  getAlertSummary() {
    const recent = this.getRecentAlerts()
    const bySeverity = {
      critical: recent.filter(a => a.severity === 'critical').length,
      high: recent.filter(a => a.severity === 'high').length,
      medium: recent.filter(a => a.severity === 'medium').length,
      low: recent.filter(a => a.severity === 'low').length
    }

    return {
      total: recent.length,
      bySeverity,
      mostRecent: recent.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0] || null
    }
  }
}

// ========================================
// DEPENDENCY MONITOR
// ========================================

interface DependencyUpdate {
  name: string
  current: string
  latest: string
  type: 'major' | 'minor' | 'patch'
  security: boolean
}

/**
 * Test Dependency Monitor
 */
export class TestDependencyMonitor {
  private packageJsonPath: string

  constructor(packageJsonPath = 'package.json') {
    this.packageJsonPath = packageJsonPath
  }

  /**
   * Check for outdated test dependencies
   */
  async checkOutdatedDependencies(): Promise<DependencyUpdate[]> {
    // This would integrate with npm outdated or similar tool
    // For now, returning mock structure
    return [
      {
        name: '@testing-library/react',
        current: '13.4.0',
        latest: '14.0.0',
        type: 'major',
        security: false
      },
      {
        name: 'vitest',
        current: '0.34.6',
        latest: '1.0.0',
        type: 'major',
        security: false
      }
    ]
  }

  /**
   * Check for security vulnerabilities in test dependencies
   */
  async checkSecurityVulnerabilities() {
    // This would integrate with npm audit
    return {
      vulnerabilities: 0,
      packages: 0,
      severity: {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0
      }
    }
  }

  /**
   * Generate dependency health report
   */
  async generateHealthReport() {
    const outdated = await this.checkOutdatedDependencies()
    const security = await this.checkSecurityVulnerabilities()

    return {
      outdatedDependencies: outdated,
      securityStatus: security,
      recommendations: this.generateRecommendations(outdated, security)
    }
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    outdated: DependencyUpdate[], 
    security: any
  ): string[] {
    const recommendations: string[] = []

    if (security.vulnerabilities > 0) {
      recommendations.push('URGENT: Update dependencies with security vulnerabilities')
    }

    const majorUpdates = outdated.filter(d => d.type === 'major')
    if (majorUpdates.length > 0) {
      recommendations.push(`Consider updating ${majorUpdates.length} major version(s)`)
    }

    const minorUpdates = outdated.filter(d => d.type === 'minor')
    if (minorUpdates.length > 5) {
      recommendations.push('Schedule minor dependency updates')
    }

    if (outdated.length > 10) {
      recommendations.push('Many dependencies are outdated - schedule maintenance')
    }

    return recommendations
  }
}

// ========================================
// COMPREHENSIVE MONITORING SYSTEM
// ========================================

/**
 * Main Test Monitoring System
 */
export class TestMonitoringSystem {
  private metricsCollector: TestMetricsCollector
  private alertSystem: TestAlertSystem
  private dependencyMonitor: TestDependencyMonitor

  constructor() {
    this.metricsCollector = new TestMetricsCollector()
    this.alertSystem = new TestAlertSystem()
    this.dependencyMonitor = new TestDependencyMonitor()
  }

  /**
   * Process test run results
   */
  processTestResults(testResults: any) {
    // Convert test results to metrics
    const metrics: TestMetrics = this.convertToMetrics(testResults)
    
    // Record metrics
    this.metricsCollector.recordMetrics(metrics)
    
    // Check for alerts
    const trends = this.metricsCollector.getTrends()
    const alerts = this.alertSystem.checkAlerts(metrics, trends)
    
    return {
      metrics,
      alerts,
      trends: this.metricsCollector.analyzePerformanceTrends(),
      flakyTests: this.metricsCollector.detectFlakyTests()
    }
  }

  /**
   * Convert test results to standardized metrics
   */
  private convertToMetrics(testResults: any): TestMetrics {
    // This would parse actual test results
    // For now, providing mock structure
    return {
      timestamp: new Date().toISOString(),
      totalTests: testResults?.numTotalTests || 0,
      passedTests: testResults?.numPassedTests || 0,
      failedTests: testResults?.numFailedTests || 0,
      skippedTests: testResults?.numPendingTests || 0,
      executionTime: testResults?.testRunTime || 0,
      coverage: {
        lines: 85.5,
        branches: 78.2,
        functions: 90.1,
        statements: 86.3
      },
      slowTests: [],
      flakyTests: []
    }
  }

  /**
   * Generate comprehensive health report
   */
  async generateHealthReport() {
    const latest = this.metricsCollector.getLatestMetrics()
    const trends = this.metricsCollector.analyzePerformanceTrends()
    const alerts = this.alertSystem.getAlertSummary()
    const flakyTests = this.metricsCollector.detectFlakyTests()
    const dependencies = await this.dependencyMonitor.generateHealthReport()

    return {
      timestamp: new Date().toISOString(),
      status: this.calculateOverallHealth(latest, alerts),
      metrics: latest,
      trends,
      alerts,
      flakyTests,
      dependencies,
      recommendations: this.generateRecommendations(latest, alerts, flakyTests)
    }
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(
    metrics: TestMetrics | null, 
    alerts: any
  ): 'healthy' | 'warning' | 'critical' {
    if (!metrics) return 'critical'
    
    if (alerts.bySeverity.critical > 0) return 'critical'
    if (alerts.bySeverity.high > 0 || alerts.bySeverity.medium > 2) return 'warning'
    
    const failureRate = metrics.failedTests / metrics.totalTests
    if (failureRate > 0.10) return 'critical'
    if (failureRate > 0.05) return 'warning'
    
    return 'healthy'
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    metrics: TestMetrics | null,
    alerts: any,
    flakyTests: any
  ): string[] {
    const recommendations: string[] = []

    if (alerts.bySeverity.critical > 0) {
      recommendations.push('URGENT: Address critical alerts immediately')
    }

    if (flakyTests.flakyTests.length > 0) {
      recommendations.push(`Fix ${flakyTests.flakyTests.length} flaky test(s)`)
    }

    if (metrics && metrics.slowTests.length > 5) {
      recommendations.push('Optimize slow-running tests')
    }

    if (alerts.bySeverity.high > 2) {
      recommendations.push('Review and address high-priority alerts')
    }

    return recommendations
  }
}

// ========================================
// EXPORTS
// ========================================

export default {
  TestMetricsCollector,
  TestAlertSystem,
  TestDependencyMonitor,
  TestMonitoringSystem
}