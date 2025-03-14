package handlers

import (
	"main/models"

	"github.com/gofiber/fiber/v3"
)

const (
	msgInvalidData           = "Dữ liệu không hợp lệ"
	msgUpdateConfigError     = "Lỗi khi cập nhật cấu hình"
	msgUpdateTelegramSuccess = "Đã cập nhật cấu hình telegram"
	msgUpdateSystemSuccess   = "Đã cập nhật cấu hình hệ thống"
	msgUpdateAuthError       = "Lỗi khi cập nhật thông tin đăng nhập"
	msgUpdateAuthSuccess     = "Đã cập nhật thông tin đăng nhập"
)

func GetTelegramConfig(c fiber.Ctx) error {
	token, chatID := models.GetTelegramConfig()
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"token":   token,
			"chat_id": chatID,
		},
	})
}
func UpdateTelegramConfig(c fiber.Ctx) error {
	var req struct {
		Token  string `json:"token"`
		ChatID string `json:"chat_id"`
	}

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": msgInvalidData,
		})
	}

	if err := models.UpdateTelegramConfig(req.Token, req.ChatID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": msgUpdateConfigError,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": msgUpdateTelegramSuccess,
	})
}
func GetSystemConfig(c fiber.Ctx) error {
	config := models.GetSystemConfig()
	return c.JSON(fiber.Map{
		"success": true,
		"data":    config,
	})
}
func UpdateSystemConfig(c fiber.Ctx) error {
	var req models.SystemConfigUpdate

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": msgInvalidData,
		})
	}

	if err := models.UpdateSystemConfig(req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": msgUpdateConfigError,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": msgUpdateSystemSuccess,
	})
}
func UpdateAuthConfig(c fiber.Ctx) error {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": msgInvalidData,
		})
	}

	if err := models.UpdateAuthConfig(req.Username, req.Password); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": msgUpdateAuthError,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": msgUpdateAuthSuccess,
	})
}
