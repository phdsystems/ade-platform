export interface ScaffoldOptions {
  language: string;
  framework: string;
  service: string;
  domain: string;
  output: string;
  preview: boolean;
  git: boolean;
  install: boolean;
  registry: string;
}

export interface ScaffoldResult {
  path: string;
  structure: string[];
  files: Record<string, string>;
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}