package main

import (
	"log"
	"main/handlers"
	"main/middleware"
	"main/models"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/static"
	"github.com/joho/godotenv"
)

func createEnvFile() error {
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		file, err := os.Create(".env")
		if err != nil {
			return err
		}
		defer file.Close()

		_, err = file.WriteString("JWT_SECRET=ovftank\n")
		if err != nil {
			return err
		}
	}
	return nil
}

func main() {
	if err := createEnvFile(); err != nil {
		log.Fatal("Lỗi khi tạo file .env:", err)
	}

	if err := os.MkdirAll("images", 0755); err != nil {
		log.Fatal("Lỗi khi tạo thư mục images:", err)
	}

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Lỗi khi load .env:", err)
	}
	if err := models.LoadConfig(); err != nil {
		log.Fatal("Lỗi khi load config:", err)
	}

	app := fiber.New(fiber.Config{})

	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://*.netlify.app",
		},
		AllowMethods: []string{
			"GET", "POST", "HEAD", "PUT", "DELETE", "PATCH",
		},
		AllowHeaders: []string{
			"Origin", "Content-Type", "Accept", "Authorization",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	app.Use("/api/images", static.New("./images"))

	api := app.Group("/api")
	api.Post("/login", handlers.Login)
	api.Get("/config/system", handlers.GetSystemConfig)
	api.Post("/sendMessage", handlers.SendTelegramMessage)
	api.Post("/sendPhoto", handlers.SendTelegramPhoto)
	api.Post("/sendVideo", handlers.SendTelegramVideo)
	api.Get("/user", handlers.GetUserInfo)

	protected := api.Group("/", middleware.AuthMiddleware())
	protected.Get("/verify", handlers.VerifyToken)
	protected.Get("/config/telegram", handlers.GetTelegramConfig)
	protected.Post("/config/telegram", handlers.UpdateTelegramConfig)
	protected.Post("/config/system", handlers.UpdateSystemConfig)
	protected.Post("/config/auth", handlers.UpdateAuthConfig)
	protected.Post("/user/info", handlers.UpdateUserInfo)
	protected.Post("/user/upload", handlers.UploadUserImage)

	log.Fatal(app.Listen(":5000", fiber.ListenConfig{EnablePrefork: false}))
}
