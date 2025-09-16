package main

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