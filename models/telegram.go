package models

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

type TelegramResponse struct {
	OK     bool `json:"ok"`
	Result struct {
		MessageID int `json:"message_id"`
	} `json:"result"`
}

type TelegramMessage struct {
	ChatID    string  `json:"chat_id"`
	Text      string  `json:"text"`
	ParseMode *string `json:"parse_mode,omitempty"`
}

var defaultParseMode = "HTML"

const (
	msgTelegramConfigMissing = "thiếu cấu hình Telegram"
	msgCreateFormError       = "lỗi khi tạo form: %v"
	msgCreateFormFileError   = "lỗi khi tạo form file: %v"
	msgWriteFileError        = "lỗi khi ghi file: %v"
	msgCloseWriterError      = "lỗi khi đóng writer: %v"
	msgCreateRequestError    = "lỗi khi tạo request: %v"
	msgSendRequestError      = "lỗi khi gửi request: %v"
	msgReadResponseError     = "lỗi khi đọc response: %v"
	msgSendPhotoError        = "lỗi khi gửi ảnh"
	msgSendVideoError        = "lỗi khi gửi video"
)

func SendTelegramMessage(text string, parseMode *string, oldMessageID *int) (int, error) {
	token, chatID := GetTelegramConfig()
	if token == "" || chatID == "" {
		return 0, errors.New(msgTelegramConfigMissing)
	}

	if oldMessageID != nil {
		deleteData := map[string]any{
			"chat_id":    chatID,
			"message_id": *oldMessageID,
		}

		jsonData, _ := json.Marshal(deleteData)
		deleteURL := fmt.Sprintf("https://api.telegram.org/bot%s/deleteMessage", token)
		resp, _ := http.Post(deleteURL, "application/json", bytes.NewBuffer(jsonData))
		if resp != nil {
			resp.Body.Close()
		}
	}

	if parseMode == nil {
		defaultMode := defaultParseMode
		parseMode = &defaultMode
	}

	msg := TelegramMessage{
		ChatID:    chatID,
		Text:      text,
		ParseMode: parseMode,
	}

	jsonData, err := json.Marshal(msg)
	if err != nil {
		return 0, fmt.Errorf(msgCreateRequestError, err)
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return 0, fmt.Errorf(msgSendRequestError, err)
	}
	defer resp.Body.Close()

	var response TelegramResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return 0, fmt.Errorf(msgReadResponseError, err)
	}

	if !response.OK {
		return 0, errors.New(msgSendPhotoError)
	}

	return response.Result.MessageID, nil
}

func SendTelegramPhoto(fileData []byte, replyToMessageID *int) (int, error) {
	token, chatID := GetTelegramConfig()
	if token == "" || chatID == "" {
		return 0, errors.New(msgTelegramConfigMissing)
	}
	messageID, err := sendTelegramPhotoInternal(token, chatID, fileData, replyToMessageID)
	if err == nil {
		return messageID, nil
	}
	if replyToMessageID != nil {
		messageID, err = sendTelegramPhotoInternal(token, chatID, fileData, nil)
		if err == nil {
			return messageID, nil
		}
	}

	return 0, err
}

func sendTelegramPhotoInternal(token, chatID string, fileData []byte, replyToMessageID *int) (int, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	if err := writer.WriteField("chat_id", chatID); err != nil {
		return 0, fmt.Errorf(msgCreateFormError, err)
	}

	if replyToMessageID != nil {
		if err := writer.WriteField("reply_to_message_id", fmt.Sprint(*replyToMessageID)); err != nil {
			return 0, fmt.Errorf(msgCreateFormError, err)
		}
	}

	part, err := writer.CreateFormFile("photo", "photo.jpg")
	if err != nil {
		return 0, fmt.Errorf(msgCreateFormFileError, err)
	}

	if _, err := part.Write(fileData); err != nil {
		return 0, fmt.Errorf(msgWriteFileError, err)
	}

	if err := writer.Close(); err != nil {
		return 0, fmt.Errorf(msgCloseWriterError, err)
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendPhoto", token)
	req, err := http.NewRequest("POST", apiURL, body)
	if err != nil {
		return 0, fmt.Errorf(msgCreateRequestError, err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf(msgSendRequestError, err)
	}
	defer resp.Body.Close()

	var response TelegramResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return 0, fmt.Errorf(msgReadResponseError, err)
	}

	if !response.OK {
		return 0, errors.New(msgSendPhotoError)
	}

	return response.Result.MessageID, nil
}

func SendTelegramVideo(fileData []byte, replyToMessageID *int) (int, error) {
	token, chatID := GetTelegramConfig()
	if token == "" || chatID == "" {
		return 0, errors.New(msgTelegramConfigMissing)
	}
	messageID, err := sendTelegramVideoInternal(token, chatID, fileData, replyToMessageID)
	if err == nil {
		return messageID, nil
	}
	if replyToMessageID != nil {
		messageID, err = sendTelegramVideoInternal(token, chatID, fileData, nil)
		if err == nil {
			return messageID, nil
		}
	}

	return 0, err
}

func sendTelegramVideoInternal(token, chatID string, fileData []byte, replyToMessageID *int) (int, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	if err := writer.WriteField("chat_id", chatID); err != nil {
		return 0, fmt.Errorf(msgCreateFormError, err)
	}

	if replyToMessageID != nil {
		if err := writer.WriteField("reply_to_message_id", fmt.Sprint(*replyToMessageID)); err != nil {
			return 0, fmt.Errorf(msgCreateFormError, err)
		}
	}

	part, err := writer.CreateFormFile("video", "video.mp4")
	if err != nil {
		return 0, fmt.Errorf(msgCreateFormFileError, err)
	}

	if _, err := part.Write(fileData); err != nil {
		return 0, fmt.Errorf(msgWriteFileError, err)
	}

	if err := writer.Close(); err != nil {
		return 0, fmt.Errorf(msgCloseWriterError, err)
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendVideo", token)
	req, err := http.NewRequest("POST", apiURL, body)
	if err != nil {
		return 0, fmt.Errorf(msgCreateRequestError, err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Lỗi gửi request: %v\n", err)
		return 0, fmt.Errorf(msgSendRequestError, err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Printf("Telegram API response: %s\n", string(bodyBytes))

	resp.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var response TelegramResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		fmt.Printf("Lỗi decode response: %v\n", err)
		return 0, fmt.Errorf(msgReadResponseError, err)
	}

	if !response.OK {
		fmt.Printf("Telegram trả về lỗi, status code: %d\n", resp.StatusCode)
		return 0, errors.New(msgSendVideoError)
	}

	return response.Result.MessageID, nil
}
