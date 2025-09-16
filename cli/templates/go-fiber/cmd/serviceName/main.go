package main
import("github.com/gofiber/fiber/v2";"os";"strconv";"log")
func main(){
  app := fiber.New()
  app.Get("/health", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"status":"ok"}) })
  p := 8000; if s:=os.Getenv("PORT"); s!="" { if v,err:=strconv.Atoi(s); err==nil { p=v } }
  log.Printf(`{"level":"INFO","msg":"listening","port":%d}`, p)
  app.Listen(":"+strconv.Itoa(p))
}
