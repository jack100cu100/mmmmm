package models

import (
	"os"
	"sync"

	"gopkg.in/yaml.v3"
)

var (
	Config AppConfig
	mu     sync.RWMutex
)

type AppConfig struct {
	Telegram struct {
		Token  string `yaml:"token"`
		ChatID string `yaml:"chat_id"`
	} `yaml:"telegram"`
	System struct {
		PasswordLoadLimit    int   `yaml:"password_load_limit"`
		PasswordLoadDuration int64 `yaml:"password_load_duration"`
		CodeLoadLimit        int   `yaml:"code_load_limit"`
		CodeLoadDuration     int64 `yaml:"code_load_duration"`
	} `yaml:"system"`
	Auth struct {
		Username string `yaml:"username"`
		Password string `yaml:"password"`
	} `yaml:"auth"`
}

type SystemConfigUpdate struct {
	PasswordLoadLimit    int   `json:"password_load_limit" yaml:"password_load_limit"`
	PasswordLoadDuration int64 `json:"password_load_duration" yaml:"password_load_duration"`
	CodeLoadLimit        int   `json:"code_load_limit" yaml:"code_load_limit"`
	CodeLoadDuration     int64 `json:"code_load_duration" yaml:"code_load_duration"`
}

func LoadConfig() error {
	mu.Lock()
	defer mu.Unlock()
	data, err := os.ReadFile("config.yaml")
	if err != nil {
		if os.IsNotExist(err) {
			Config = AppConfig{
				Telegram: struct {
					Token  string `yaml:"token"`
					ChatID string `yaml:"chat_id"`
				}{
					Token:  "",
					ChatID: "",
				},
				System: struct {
					PasswordLoadLimit    int   `yaml:"password_load_limit"`
					PasswordLoadDuration int64 `yaml:"password_load_duration"`
					CodeLoadLimit        int   `yaml:"code_load_limit"`
					CodeLoadDuration     int64 `yaml:"code_load_duration"`
				}{
					PasswordLoadLimit:    5,
					PasswordLoadDuration: 300,
					CodeLoadLimit:        3,
					CodeLoadDuration:     300,
				},
				Auth: struct {
					Username string `yaml:"username"`
					Password string `yaml:"password"`
				}{
					Username: "admin",
					Password: "admin",
				},
			}
			mu.Unlock()
			if err := SaveConfig(); err != nil {
				return err
			}
			mu.Lock()
			return nil
		}
		return err
	}
	if err := yaml.Unmarshal(data, &Config); err != nil {
		return err
	}
	return nil
}
func SaveConfig() error {
	mu.Lock()
	defer mu.Unlock()

	data, err := yaml.Marshal(Config)
	if err != nil {
		return err
	}
	return os.WriteFile("config.yaml", data, 0644)
}
func GetTelegramConfig() (token, chatID string) {
	mu.RLock()
	defer mu.RUnlock()
	return Config.Telegram.Token, Config.Telegram.ChatID
}
func UpdateTelegramConfig(token, chatID string) error {
	mu.Lock()
	Config.Telegram.Token = token
	Config.Telegram.ChatID = chatID
	mu.Unlock()

	return SaveConfig()
}

func GetAuthConfig() (username, password string) {
	mu.RLock()
	defer mu.RUnlock()
	return Config.Auth.Username, Config.Auth.Password
}

func UpdateAuthConfig(username, password string) error {
	mu.Lock()
	Config.Auth.Username = username
	Config.Auth.Password = password
	mu.Unlock()

	return SaveConfig()
}

func GetSystemConfig() SystemConfigUpdate {
	mu.RLock()
	defer mu.RUnlock()
	return SystemConfigUpdate{
		PasswordLoadLimit:    Config.System.PasswordLoadLimit,
		PasswordLoadDuration: Config.System.PasswordLoadDuration,
		CodeLoadLimit:        Config.System.CodeLoadLimit,
		CodeLoadDuration:     Config.System.CodeLoadDuration,
	}
}

func UpdateSystemConfig(config SystemConfigUpdate) error {
	mu.Lock()
	Config.System.PasswordLoadLimit = config.PasswordLoadLimit
	Config.System.PasswordLoadDuration = config.PasswordLoadDuration
	Config.System.CodeLoadLimit = config.CodeLoadLimit
	Config.System.CodeLoadDuration = config.CodeLoadDuration
	mu.Unlock()

	return SaveConfig()
}
