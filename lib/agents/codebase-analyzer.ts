/**
 * Agent Codebase Understanding
 * 
 * Maps architecture, identifies offline capabilities, retry logic points
 */

import * as fs from 'fs';
import * as path from 'path';

export interface CodebaseAnalysis {
  offline_capable: {
    file: string;
    line: number;
    capability: string;
  }[];
  api_endpoints: {
    file: string;
    endpoint: string;
    graceful_failure: boolean;
    retry_logic: boolean;
  }[];
  retry_insertion_points: {
    file: string;
    line: number;
    reason: string;
    suggested_implementation: string;
  }[];
}

export class CodebaseAnalyzer {
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  async analyzeCodebase(): Promise<CodebaseAnalysis> {
    const analysis: CodebaseAnalysis = {
      offline_capable: [],
      api_endpoints: [],
      retry_insertion_points: []
    };

    // Scan for offline capabilities
    await this.scanOfflineCapabilities(analysis);
    
    // Scan API endpoints
    await this.scanAPIEndpoints(analysis);
    
    // Identify retry insertion points
    await this.identifyRetryPoints(analysis);

    return analysis;
  }

  private async scanOfflineCapabilities(analysis: CodebaseAnalysis): Promise<void> {
    const patterns = [
      { pattern: /localStorage\./g, capability: 'localStorage' },
      { pattern: /sessionStorage\./g, capability: 'sessionStorage' },
      { pattern: /indexedDB/i, capability: 'IndexedDB' },
      { pattern: /serviceWorker/i, capability: 'Service Worker' },
      { pattern: /cache\./g, capability: 'Cache API' }
    ];

    await this.scanFiles(patterns, (file, line, match) => {
      analysis.offline_capable.push({
        file,
        line,
        capability: match.capability
      });
    });
  }

  private async scanAPIEndpoints(analysis: CodebaseAnalysis): Promise<void> {
    const apiDir = path.join(this.workspaceRoot, 'app/api');
    if (!fs.existsSync(apiDir)) return;

    const files = this.getAllFiles(apiDir);
    
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(this.workspaceRoot, file);
      
      // Extract endpoint paths
      const routeMatch = relativePath.match(/api\/(.+?)(?:\/route)?\.tsx?$/);
      if (routeMatch) {
        const endpoint = `/${routeMatch[1]}`;
        const hasTryCatch = /try\s*\{/.test(content);
        const hasRetry = /retry|exponential|backoff/i.test(content);
        
        analysis.api_endpoints.push({
          file: relativePath,
          endpoint,
          graceful_failure: hasTryCatch,
          retry_logic: hasRetry
        });
      }
    }
  }

  private async identifyRetryPoints(analysis: CodebaseAnalysis): Promise<void> {
    const apiDir = path.join(this.workspaceRoot, 'app/api');
    if (!fs.existsSync(apiDir)) return;

    const files = this.getAllFiles(apiDir);
    
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(this.workspaceRoot, file);
      
      // Find fetch calls without retry
      const fetchRegex = /fetch\(/g;
      let match;
      let lineNumber = 1;
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        if (fetchRegex.test(lines[i]) && !/retry|exponential|backoff/i.test(content.substring(0, content.indexOf(lines[i])))) {
          analysis.retry_insertion_points.push({
            file: relativePath,
            line: i + 1,
            reason: 'Fetch call without retry logic',
            suggested_implementation: `Add exponential backoff: retry 3x with delays [1s, 2s, 4s]`
          });
        }
      }
    }
  }

  private async scanFiles(
    patterns: { pattern: RegExp; capability: string }[],
    callback: (file: string, line: number, match: { capability: string }) => void
  ): Promise<void> {
    const srcDir = path.join(this.workspaceRoot, 'app');
    if (!fs.existsSync(srcDir)) return;

    const files = this.getAllFiles(srcDir);
    
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js') && !file.endsWith('.jsx')) continue;
      
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(this.workspaceRoot, file);
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of patterns) {
          if (pattern.pattern.test(lines[i])) {
            callback(relativePath, i + 1, { capability: pattern.capability });
          }
        }
      }
    }
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...this.getAllFiles(fullPath));
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip if can't read
    }
    
    return files;
  }

  generateMarkdownReport(analysis: CodebaseAnalysis): string {
    let markdown = '# Codebase Analysis Report\n\n';
    
    markdown += '## Offline Capabilities\n\n';
    if (analysis.offline_capable.length === 0) {
      markdown += '❌ No offline capabilities found\n\n';
    } else {
      markdown += '| File | Line | Capability |\n';
      markdown += '|------|------|------------|\n';
      analysis.offline_capable.forEach(item => {
        markdown += `| \`${item.file}\` | ${item.line} | ${item.capability} |\n`;
      });
      markdown += '\n';
    }
    
    markdown += '## API Endpoints\n\n';
    markdown += '| Endpoint | File | Graceful Failure | Retry Logic |\n';
    markdown += '|----------|------|------------------|-------------|\n';
    analysis.api_endpoints.forEach(endpoint => {
      markdown += `| ${endpoint.endpoint} | \`${endpoint.file}\` | ${endpoint.graceful_failure ? '✅' : '❌'} | ${endpoint.retry_logic ? '✅' : '❌'} |\n`;
    });
    markdown += '\n';
    
    markdown += '## Retry Logic Insertion Points\n\n';
    if (analysis.retry_insertion_points.length === 0) {
      markdown += '✅ All fetch calls have retry logic\n\n';
    } else {
      markdown += '| File | Line | Reason | Suggested Implementation |\n';
      markdown += '|------|------|--------|------------------------|\n';
      analysis.retry_insertion_points.forEach(point => {
        markdown += `| \`${point.file}\` | ${point.line} | ${point.reason} | ${point.suggested_implementation} |\n`;
      });
      markdown += '\n';
    }
    
    return markdown;
  }
}

