# Multi-stage build for smaller image
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Use pip-tools for deterministic builds
RUN pip install --no-cache-dir pip-tools

# Copy and compile requirements
COPY requirements.txt .
RUN pip-compile requirements.txt -o requirements.lock && \
    pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.lock

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app

# Copy wheels and install
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.lock .
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

ENV PORT={{port}}
EXPOSE {{port}}

# Use gunicorn with uvicorn workers for production
CMD ["gunicorn", "src.app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:{{port}}"]