package middleware

import (
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

const (
	msgLoginRequired = "Vui lòng đăng nhập"
	msgTokenExpired  = "Token không hợp lệ hoặc đã hết hạn"
	msgTokenInvalid  = "Token không hợp lệ"
)

func AuthMiddleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": msgLoginRequired,
			})
		}
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			authHeader = authHeader[7:]
		}
		token, err := jwt.ParseWithClaims(authHeader, &Claims{}, func(token *jwt.Token) (any, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": msgTokenExpired,
			})
		}
		if claims, ok := token.Claims.(*Claims); ok && token.Valid {
			c.Locals("username", claims.Username)
			return c.Next()
		}

		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": msgTokenInvalid,
		})
	}
}
