# Project Structure

## Repository Structure

```
ade-platform/
├── cli/                    # Core CLI tool
│   ├── src/               # TypeScript source code
│   │   ├── commands/      # CLI commands (scaffold, validate)
│   │   ├── core/          # Core logic (scaffolder, validator, registry)
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── templates/         # Service templates
│   │   ├── fastapi/       # Python FastAPI templates
│   │   ├── express/       # Node.js Express templates
│   │   └── fiber/         # Go Fiber templates
│   ├── config/            # Configuration files
│   │   └── stack-registry.json  # Language/framework definitions
│   ├── tests/             # Unit tests
│   ├── dist/              # Compiled JavaScript (generated)
│   └── package.json       # CLI package configuration
│
├── vscode-extension/      # VSCode extension
│   ├── src/              # Extension source code
│   │   ├── extension.ts  # Main extension entry
│   │   └── preview.ts    # Preview panel implementation
│   ├── out/              # Compiled output (generated)
│   ├── tests/            # Extension tests
│   └── package.json      # Extension manifest
│
├── docs/                  # Documentation
│   ├── api/              # API reference
│   ├── guides/           # User guides
│   ├── development/      # Developer documentation
│   └── README.md         # Documentation index
│
├── .github/              # GitHub configuration
│   └── workflows/        # CI/CD workflows
│
├── scripts/              # Utility scripts
├── .husky/               # Git hooks
└── package.json          # Root package configuration
```

## Generated Project Structure

When you scaffold a new service, it creates:

```
<domain>/
└── <service>/
    ├── src/                # Source code
    │   ├── app/           # Application code
    │   ├── config/        # Configuration
    │   ├── middleware/    # Middleware
    │   └── routes/        # Route definitions
    │
    ├── tests/              # Test files
    │   ├── unit/          # Unit tests
    │   ├── integration/   # Integration tests
    │   └── e2e/           # End-to-end tests
    │
    ├── docs/               # Documentation
    │   ├── api/           # API documentation
    │   ├── guides/        # User guides
    │   └── README.md      # Service readme
    │
    ├── deploy/             # Deployment files
    │   ├── Dockerfile     # Container definition
    │   ├── docker-compose.yml
    │   ├── k8s/           # Kubernetes manifests
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   └── configmap.yaml
    │   └── scripts/       # Deployment scripts
    │
    ├── .github/            # GitHub Actions (if git enabled)
    │   └── workflows/
    │       ├── ci.yml     # CI pipeline
    │       └── cd.yml     # CD pipeline
    │
    ├── config/             # Configuration files
    │   ├── default.json   # Default config
    │   ├── production.json
    │   └── development.json
    │
    ├── .env.example        # Environment template
    ├── .gitignore         # Git ignore rules
    ├── .dockerignore      # Docker ignore rules
    ├── Makefile           # Common commands
    ├── README.md          # Service documentation
    └── [Language specific files]
```

## Language-Specific Files

### Python (FastAPI)

```
├── requirements.txt       # Python dependencies
├── pyproject.toml        # Modern Python configuration
├── setup.py              # Package setup
├── .python-version       # Python version
├── pytest.ini            # Pytest configuration
├── .ruff.toml            # Ruff linter config
└── src/
    └── app/
        ├── __init__.py
        ├── main.py       # FastAPI application
        ├── models.py     # Data models
        ├── schemas.py    # Pydantic schemas
        └── database.py   # Database connection
```

### Node.js (Express)

```
├── package.json          # Node dependencies
├── pnpm-lock.yaml       # Lock file
├── tsconfig.json        # TypeScript config (if TS)
├── .npmrc               # npm configuration
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── jest.config.js       # Jest configuration
└── src/
    ├── index.mjs        # Express application
    ├── routes/          # Route handlers
    ├── middleware/      # Express middleware
    └── controllers/     # Business logic
```

### Go (Fiber)

```
├── go.mod               # Go modules
├── go.sum               # Dependency checksums
├── .golangci.yml        # Linter configuration
├── cmd/
│   └── <service>/
│       └── main.go     # Entry point
├── internal/            # Private packages
│   ├── handler/        # HTTP handlers
│   ├── service/        # Business logic
│   └── repository/     # Data access
└── pkg/                 # Public packages
    ├── models/         # Data models
    └── utils/          # Utilities
```

## File Descriptions

### Root Files

| File | Purpose |
|------|---------|
| `.env.example` | Template for environment variables |
| `.gitignore` | Files to exclude from git |
| `.dockerignore` | Files to exclude from Docker build |
| `Makefile` | Common development commands |
| `README.md` | Service documentation |

### Configuration Files

| File | Purpose |
|------|---------|
| `stack-registry.json` | Language and framework definitions |
| `tsconfig.json` | TypeScript compiler options |
| `jest.config.js` | Jest test configuration |
| `pytest.ini` | Pytest configuration |

### Docker Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build |
| `docker-compose.yml` | Local development stack |
| `docker-compose.prod.yml` | Production stack |

### CI/CD Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Continuous integration |
| `.github/workflows/cd.yml` | Continuous deployment |
| `.github/workflows/release.yml` | Release automation |

## Directory Conventions

### Required Directories

These directories are required by ADE conventions:

- `src/` - Source code
- `tests/` - Test files
- `docs/` - Documentation
- `deploy/` - Deployment configurations

### Optional Directories

Additional directories that may be created:

- `scripts/` - Utility scripts
- `migrations/` - Database migrations
- `public/` - Static files
- `assets/` - Asset files
- `config/` - Configuration files

### Forbidden Root Directories

These directories should not be at project root:

- `lib/` - Use `src/` instead
- `test/` - Use `tests/` (plural)
- `bin/` - Use `scripts/` or `cmd/`

## Naming Conventions

### Services

- Lowercase with hyphens: `user-api`, `payment-service`
- Descriptive and specific
- Include type suffix: `-api`, `-service`, `-worker`

### Domains

- Lowercase with hyphens: `identity`, `finance`, `inventory`
- Business-focused naming
- Singular form preferred

### Files

- **TypeScript/JavaScript**: camelCase (`userService.ts`)
- **Python**: snake_case (`user_service.py`)
- **Go**: lowercase (`userservice.go`)
- **Config files**: kebab-case (`stack-registry.json`)

### Environment Variables

- UPPERCASE with underscores: `DATABASE_URL`, `API_KEY`
- Prefixed by service: `USER_API_PORT`

## Best Practices

1. **Keep domains isolated** - No cross-domain imports
2. **Follow the structure** - Don't deviate from conventions
3. **Document everything** - Update README for each service
4. **Test thoroughly** - Maintain test coverage
5. **Use the Makefile** - Standardize common commands