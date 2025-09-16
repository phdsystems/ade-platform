package main

import (
    "fmt"
    "log"
    "os"
    "runtime"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cache"
    "github.com/gofiber/fiber/v2/middleware/compress"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/helmet"
    "github.com/gofiber/fiber/v2/middleware/limiter"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/monitor"
    "github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
    // Set GOMAXPROCS for optimal performance
    runtime.GOMAXPROCS(runtime.NumCPU())

    app := fiber.New(fiber.Config{
        AppName: "{{ServiceName}} v1.0.0",
        Prefork: true, // Enable prefork for better performance
        ServerHeader: "{{ServiceName}}",
        DisableStartupMessage: false,
    })

    // Middleware stack for production
    app.Use(recover.New())
    app.Use(helmet.New())
    app.Use(compress.New(compress.Config{
        Level: compress.LevelBestSpeed,
    }))
    app.Use(logger.New(logger.Config{
        Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
    }))
    app.Use(cors.New())
    app.Use(limiter.New(limiter.Config{
        Max:        100,
        Expiration: 1 * time.Minute,
    }))
    app.Use(cache.New(cache.Config{
        Expiration:   1 * time.Minute,
        CacheControl: true,
    }))

    // Metrics endpoint
    app.Get("/metrics", monitor.New(monitor.Config{Title: "{{ServiceName}} Metrics"}))

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