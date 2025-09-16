# Multi-stage build for minimal image size
FROM golang:1.22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make gcc musl-dev

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build with optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -extldflags '-static'" \
    -a -installsuffix cgo \
    -o service ./cmd/{{serviceName}}

# Use distroless for minimal attack surface
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /

# Copy binary from builder
COPY --from=builder /app/service /service

# Use non-root user (included in distroless)
USER nonroot:nonroot

ENV PORT={{port}}
EXPOSE {{port}}

ENTRYPOINT ["/service"]