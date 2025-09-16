import fs from 'fs-extra';
import path from 'path';

const TEMPLATES_DIR = path.join(import.meta.dirname || process.cwd(), '../../templates');

export async function loadTemplate(templatePath: string): Promise<string> {
  const fullPath = path.join(TEMPLATES_DIR, templatePath);

  if (!await fs.pathExists(fullPath)) {
    // Return a default template if the file doesn't exist
    return getDefaultTemplate(templatePath);
  }

  return await fs.readFile(fullPath, 'utf-8');
}

export async function templateExists(templatePath: string): Promise<boolean> {
  const fullPath = path.join(TEMPLATES_DIR, templatePath);
  return await fs.pathExists(fullPath);
}

function getDefaultTemplate(templatePath: string): string {
  // Provide default templates for common files
  const defaults: Record<string, string> = {
    'fastapi/app/main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="{{ServiceName}} API",
    description="{{Domain}} domain - {{ServiceName}} service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "{{serviceName}}",
        "domain": "{{domain}}",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", {{port}}))
    uvicorn.run(app, host="0.0.0.0", port=port)
`,
    'fastapi/requirements.txt': `fastapi==0.109.2
uvicorn[standard]==0.27.1
pydantic==2.6.1
python-dotenv==1.0.1
`,
    'fastapi/Dockerfile': `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT={{port}}
EXPOSE {{port}}

CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "{{port}}"]
`,
    'express/src/index.mjs': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || {{port}};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    service: '{{serviceName}}',
    domain: '{{domain}}',
    status: 'healthy',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(\`{{ServiceName}} service listening on port \${PORT}\`);
});
`,
    'express/package.json': `{
  "name": "{{serviceName}}",
  "version": "1.0.0",
  "type": "module",
  "description": "{{Domain}} domain - {{ServiceName}} service",
  "main": "src/index.mjs",
  "scripts": {
    "start": "node src/index.mjs",
    "dev": "node --watch src/index.mjs",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.0"
  }
}
`,
    'go-fiber/cmd/serviceName/main.go': `package main

import (
    "fmt"
    "log"
    "os"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
    app := fiber.New(fiber.Config{
        AppName: "{{ServiceName}} v1.0.0",
    })

    app.Use(logger.New())
    app.Use(cors.New())

    app.Get("/", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "service": "{{serviceName}}",
            "domain":  "{{domain}}",
            "status":  "healthy",
            "version": "1.0.0",
        })
    })

    app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "status": "healthy",
        })
    })

    port := os.Getenv("PORT")
    if port == "" {
        port = "{{port}}"
    }

    log.Printf("{{ServiceName}} service starting on port %s", port)
    if err := app.Listen(fmt.Sprintf(":%s", port)); err != nil {
        log.Fatal(err)
    }
}
`
  };

  return defaults[templatePath] || `# {{ServiceName}} - {{Domain}}\n\nTemplate not found: ${templatePath}`;
}