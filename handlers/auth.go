package handlers

import (
	"main/models"
	"os"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

const (
	msgInvalidLoginData   = "Dữ liệu không hợp lệ"
	msgInvalidCredentials = "Tài khoản hoặc mật khẩu không chính xác"
	msgTokenError         = "Lỗi tạo token"
	msgLoginSuccess       = "Đăng nhập thành công"
	msgVerifySuccess      = "Token hợp lệ"
)

func Login(c fiber.Ctx) error {
	var req LoginRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": msgInvalidLoginData,
		})
	}
	if req.Username != models.Config.Auth.Username || req.Password != models.Config.Auth.Password {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": msgInvalidCredentials,
		})
	}
	claims := Claims{
		Username: req.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   req.Username,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": msgTokenError,
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": msgLoginSuccess,
		"data": fiber.Map{
			"token": tokenString,
			"type":  "Bearer",
		},
	})
}

func VerifyToken(c fiber.Ctx) error {
	username := c.Locals("username")

	return c.JSON(fiber.Map{
		"success": true,
		"message": msgVerifySuccess,
		"data": fiber.Map{
			"username": username,
		},
	})
}
