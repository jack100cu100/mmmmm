package handlers

import (
	"main/models"
	"path/filepath"

	"github.com/gofiber/fiber/v3"
)

const (
	userImagesDir = "dist"
)

func GetUserInfo(c fiber.Ctx) error {
	fullName, coverImage, avatarImage := models.GetUserInfo()
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"full_name":    fullName,
			"cover_image":  coverImage,
			"avatar_image": avatarImage,
		},
	})
}

func UploadUserImage(c fiber.Ctx) error {
	imageType := c.Query("type")
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Không tìm thấy file",
		})
	}

	if err := c.SaveFile(file, filepath.Join(userImagesDir, file.Filename)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Lỗi khi lưu file",
		})
	}

	imagePath := "/" + file.Filename

	var err2 error
	if imageType == "cover" {
		err2 = models.UpdateUserImages(imagePath, "")
	} else if imageType == "avatar" {
		err2 = models.UpdateUserImages("", imagePath)
	}

	if err2 != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Lỗi khi cập nhật đường dẫn ảnh",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tải lên ảnh thành công",
		"data": fiber.Map{
			"image_url": imagePath,
		},
	})
}

func UpdateUserInfo(c fiber.Ctx) error {
	var req struct {
		FullName string `json:"full_name"`
	}

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Dữ liệu không hợp lệ",
		})
	}

	if err := models.UpdateUserInfo(req.FullName); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Lỗi khi cập nhật thông tin",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đã cập nhật thông tin thành công",
	})
}
