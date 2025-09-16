# Multi-stage build for smaller image
FROM python:3.11-slim as builder

WORKDIR /app

# Install uv for ultra-fast Python package management
# uv is 10-100x faster than pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.cargo/bin:${PATH}"

# Copy and install dependencies with uv
COPY requirements.txt .
RUN uv venv /app/venv && \
    . /app/venv/bin/activate && \
    uv pip install -r requirements.txt

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app

# Copy virtual environment from builder
COPY --from=builder --chown=appuser:appuser /app/venv /app/venv

# Set environment to use venv
ENV PATH="/app/venv/bin:${PATH}"
ENV VIRTUAL_ENV=/app/venv

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

ENV PORT={{port}}
EXPOSE {{port}}

# Use gunicorn with uvicorn workers for production
CMD ["gunicorn", "src.app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:{{port}}"]