# 📋 CLAUDE.md Update Guide for Agents

## 🎯 Purpose
This guide ensures consistent and accurate updates to the main CLAUDE.md file, maintaining it as the definitive source of truth for the Adega Manager system.

## 🔄 Update Process

### When to Update CLAUDE.md
- ✅ After completing performance analysis (Data Analyst)
- ✅ After implementing architectural changes (Architect) 
- ✅ After major feature additions or modifications
- ✅ When system metrics significantly change
- ✅ After resolving critical bottlenecks

### Who Updates What

#### 📊 **Data Analyst Responsibilities**
**Sections to Update:**
- `Performance Characteristics` - New baseline metrics and bottlenecks
- `Database Current State` - Real volume data and fragmentation analysis
- `Common Workflows` - Identified performance issues and patterns

**Update Guidelines:**
- ✅ Use actual measured data, not estimates
- ✅ Document performance bottlenecks with specific file locations
- ✅ Update record counts with real production numbers
- ✅ Include fragmentation and optimization opportunities

#### 🏗️ **Architect Responsibilities**  
**Sections to Update:**
- `Architecture Overview` - New patterns and optimizations implemented
- `Development Guidelines` - Updated best practices and patterns
- `Directory Structure` - New components, hooks, or organizational changes
- `Build Configuration Details` - Bundle optimizations or build changes
- `Project Status` - Performance improvements and system state

**Update Guidelines:**
- ✅ Document architectural decisions and rationale
- ✅ Update performance characteristics with measured improvements  
- ✅ Add new development patterns and guidelines
- ✅ Maintain backward compatibility information

## 📝 Section-Specific Update Guidelines

### 🔧 Performance Characteristics
```markdown
**Before Update Example:**
- **React Query caching** - Intelligent server state management
- **Real-time updates** - Supabase subscriptions for live data

**After Update Example:**
- **Multi-layer cache strategy** - Browser (1min), Query (5-15min), Database (15-60min)
- **Optimized queries** - COGS calculation improved from 3000ms to 400ms
- **Dashboard performance** - Executive <2s, Analytics <5s load times
```

### 🗄️ Database Current State
```markdown
**Before Update Example:**
- **925+ real records** in active use

**After Update Example:**  
- **1,310+ real records** in active use (activity_logs: 1,310, products: 435)
- **Database fragmentation** identified: profiles table 89% fragmented
- **Critical optimization** needed: COGS queries and COUNT operations
```

### 🏗️ Architecture Overview
```markdown
**Before Update Example:**
- **State Management**: TanStack React Query 5.56.2 - Server state with intelligent caching

**After Update Example:**
- **State Management**: Multi-layer caching strategy implemented
  - **Layer 1**: Browser cache (1-5min) for basic counters
  - **Layer 2**: React Query cache (5-15min) for calculated metrics  
  - **Layer 3**: Database cache (15-60min) for complex reports
```

### 📂 Directory Structure
```markdown
**When adding new dashboard structure:**
├── features/               
│   ├── dashboard/         
│   │   ├── executive/         # NEW: Business owner dashboard
│   │   │   ├── ExecutiveDashboard.tsx
│   │   │   └── useExecutiveData.ts
│   │   ├── analytics/         # NEW: Marketing/Sales dashboard
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   └── useAnalyticsData.ts
```

## ✅ Quality Checklist

### Before Updating CLAUDE.md
- [ ] **Data Verified**: All metrics and numbers are from actual system measurement
- [ ] **Context Preserved**: Existing information maintained unless explicitly superseded
- [ ] **Links Updated**: All file references point to correct locations
- [ ] **Consistency Maintained**: Writing style and format match existing content
- [ ] **Version Control**: Note what changed and why in commit message

### Required Elements in Updates
- [ ] **Specific metrics** (not "improved performance" but "70% faster")
- [ ] **File locations** with line numbers where relevant
- [ ] **Backward compatibility** information when breaking changes made
- [ ] **Implementation dates** for tracking evolution
- [ ] **Performance baselines** for future comparison

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This
```markdown
# Vague updates
- "Performance improved"  
- "System is faster now"
- "Database optimized"
- "Some bottlenecks fixed"
```

### ✅ Do This Instead
```markdown  
# Specific, measurable updates
- "COGS calculation optimized from 3000ms to 400ms (87% improvement)"
- "Dashboard load time reduced from 4-7s to 1-2s for executive users"  
- "Database fragmentation addressed: profiles table from 89% to <10%"
- "Query count reduced from 8-12 to 2-3 per dashboard load (75% reduction)"
```

### ❌ Don't Remove Context
```markdown
# Don't just replace old info
- Removing previous performance metrics
- Deleting architectural decisions without explanation
- Overwriting without noting what changed
```

### ✅ Preserve Historical Context
```markdown
# Keep evolution visible
- **Previous**: Dashboard load time 4-7s (identified as critical bottleneck)
- **Current**: Dashboard load time 1-2s (70% improvement via cache optimization)
- **Architecture Evolution**: Added executive/analytics dashboard separation (v2.1.0)
```

## 📋 Template for Updates

### Header Template
```markdown
<!-- Agent Update - [DATE] -->
<!-- Updated by: [Agent Name] -->  
<!-- Changes: [Brief description] -->
<!-- Performance Impact: [Measured improvement] -->
```

### Section Update Template
```markdown
## [Section Name] (Updated [DATE])

### What Changed
- [Specific change 1 with metrics]
- [Specific change 2 with rationale]

### Previous State  
- [What it was before - for context]

### Current State
- [What it is now - with measurements]

### Impact
- [Measured business/technical impact]
```

## 🔄 Validation Process

### After Making Updates
1. **Read through entire CLAUDE.md** - Ensure consistency across sections
2. **Verify cross-references** - Check all internal links and file references
3. **Confirm accuracy** - All metrics should be from actual measurements
4. **Test with fresh eyes** - Would a new team member understand the current state?

### Commit Message Format
```
📋 Update CLAUDE.md - [Agent] - [Brief description]

- Section: [Section name] - [What changed]  
- Performance: [Measured improvement]
- Files affected: [List relevant files]
- Breaking changes: [Yes/No with details]

Agent: [adega-data-analyst|adega-architect]
Analysis ref: docs/agents/[analysis/architecture]/[filename]
```

## 🎯 Success Indicators

### Good CLAUDE.md Update
- ✅ New team member can understand current system state
- ✅ Performance metrics are measurable and current  
- ✅ Architecture decisions are documented with rationale
- ✅ Development guidelines reflect actual working patterns
- ✅ Historical context preserved while staying current

### Signs Update Needs Improvement
- ❌ Vague or unmeasurable statements
- ❌ Missing file references or broken links
- ❌ Contradicts information in other sections
- ❌ Lacks specific implementation details
- ❌ No performance baselines for comparison

---

**Remember**: CLAUDE.md is the source of truth that enables all agents to work effectively. Keep it accurate, specific, and up-to-date!