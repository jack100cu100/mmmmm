package handlers

import (
	"fmt"
	"io"
	"main/models"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v3"
)

const (
	msgTelegramConfigMissing = "Thiếu cấu hình Telegram"
	msgTelegramSendError     = "Lỗi khi gửi tin nhắn"
	msgTelegramSendSuccess   = "Đã gửi tin nhắn thành công"
	msgReadFileError         = "Lỗi khi đọc file"
	msgPhotoNotFound         = "Không tìm thấy file ảnh"
	msgPhotoSizeExceeded     = "Kích thước file quá lớn (tối đa 10MB)"
	msgInvalidPhotoFile      = "File không phải là ảnh"
	msgVideoNotFound         = "Không tìm thấy file video"
	msgVideoSizeExceeded     = "Kích thước file quá lớn (tối đa 50MB)"
	msgInvalidVideoFile      = "File không phải là video hỗ trợ (mp4 hoặc webm)"
)

type SendMessageRequest struct {
	Text         string  `json:"text"`
	ParseMode    *string `json:"parse_mode,omitempty"`
	OldMessageID *int    `json:"old_message_id,omitempty"`
}

type SendPhotoRequest struct {
	PhotoURL string `json:"photo_url"`
	Caption  string `json:"caption"`
}

type MessageResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	MessageID int    `json:"message_id,omitempty"`
}

func SendTelegramMessage(c fiber.Ctx) error {
	var req SendMessageRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(MessageResponse{
			Success: false,
			Message: msgInvalidData,
		})
	}

	messageID, err := models.SendTelegramMessage(req.Text, req.ParseMode, req.OldMessageID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(MessageResponse{
			Success: false,
			Message: msgTelegramSendError,
		})
	}

	return c.JSON(MessageResponse{
		Success:   true,
		Message:   msgTelegramSendSuccess,
		MessageID: messageID,
	})
}

func SendTelegramPhoto(c fiber.Ctx) error {
	file, err := c.FormFile("photo")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(MessageResponse{
			Success: false,
			Message: msgPhotoNotFound,
		})
	}

	var messageID *int
	if id := c.FormValue("message_id"); id != "" {
		if val, err := strconv.Atoi(id); err == nil {
			messageID = &val
		}
	}

	if file.Size > 10*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(MessageResponse{
			Success: false,
			Message: msgPhotoSizeExceeded,
		})
	}
	contentType := file.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return c.Status(fiber.StatusBadRequest).JSON(MessageResponse{
			Success: false,
			Message: msgInvalidPhotoFile,
		})
	}
	fileContent, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(MessageResponse{
			Success: false,
			Message: msgReadFileError,
		})
	}
	defer fileContent.Close()
	fileData, err := io.ReadAll(fileContent)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(MessageResponse{
			Success: false,
			Message: msgReadFileError,
		})
	}
	respMessageID, err := models.SendTelegramPhoto(fileData, messageID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(MessageResponse{
			Success: false,
			Message: msgTelegramSendError,
		})
	}

	return c.JSON(MessageResponse{
		Success:   true,
		Message:   msgTelegramSendSuccess,
		MessageID: respMessageID,
	})
}

func SendTelegramVideo(c fiber.Ctx) error {
	file, err := c.FormFile("video")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(MessageResponse{
			Success: false,
			Message: msgVideoNotFound,
		})
	}

	fmt.Printf("File size before processing: %d bytes\n", file.Size)

	fileContent, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(MessageResponse{
			Success: false,
			Message: msgReadFileError,
		})
	}
	defer fileContent.Close()

	fileData, err := io.ReadAll(fileContent)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(MessageResponse{
			Success: false,
			Message: msgReadFileError,
		})
	}

	fmt.Printf("File data length after reading: %d bytes\n", len(fileData))

	if len(fileData) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(MessageResponse{
			Success: false,
			Message: "File video rỗng",
		})
	}

	var messageID *int
	if id := c.FormValue("message_id"); id != "" {
		if val, err := strconv.Atoi(id); err == nil {
			messageID = &val
		}
	}

	if file.Size > 50*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(MessageResponse{
			Success: false,
			Message: msgVideoSizeExceeded,
		})
	}
	contentType := file.Header.Get("Content-Type")
	if contentType != "video/mp4" && contentType != "video/webm" {
		return c.Status(fiber.StatusBadRequest).JSON(MessageResponse{
			Success: false,
			Message: msgInvalidVideoFile,
		})
	}
	respMessageID, err := models.SendTelegramVideo(fileData, messageID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(MessageResponse{
			Success: false,
			Message: msgTelegramSendError,
		})
	}

	return c.JSON(MessageResponse{
		Success:   true,
		Message:   msgTelegramSendSuccess,
		MessageID: respMessageID,
	})
}
