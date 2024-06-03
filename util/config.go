package util

import (
	"time"

	"github.com/spf13/viper"
)

// Config stores all configuration of the application
// The values are read by viper from a config file or enviroment variable
type Config struct {
	DBDriver             string        `mapstructure:"DB_DRIVER"`
	DBSource             string        `mapstructure:"DB_SOURCE"`
	ServerAddress        string        `mapstructure:"SERVER_ADDRESS"`
	TokenSymmetricKey    string        `mapstructure:"TOKEN_SYMMETRIC_KEY"`
	AccessTokenDuration  time.Duration `mapstructure:"ACCESS_TOKEN_DURATION"`
	RefreshTokenDuration time.Duration `mapstructure:"REFRESH_TOKEN_DURATION"`
	SuperpetDeliveryUrl  string        `mapstructure:"SUPERPET_DELIVERY_URL"`
	EmailSenderName      string        `mapstructure:"EMAIL_SENDER_NAME"`
	EmailSenderAddress   string        `mapstructure:"EMAIL_SENDER_ADDRESS"`
	EmailSenderPassword  string        `mapstructure:"EMAIL_SENDER_PASSWORD"`
}

// LoadConfig reads configuration from file or enviroment variables.
func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName("app")
	viper.SetConfigType("env") // json xml etc

	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	err = viper.Unmarshal(&config)
	if err != nil {
		return
	}

	// Convert the ACCESS_TOKEN_DURATION and REFRESH_TOKEN_DURATION
	// environment variables to time.Duration values
	config.AccessTokenDuration = viper.GetDuration("ACCESS_TOKEN_DURATION")
	config.RefreshTokenDuration = viper.GetDuration("REFRESH_TOKEN_DURATION")

	config.EmailSenderName = viper.GetString("EMAIL_SENDER_NAME")
	config.EmailSenderAddress = viper.GetString("EMAIL_SENDER_ADDRESS")
	config.EmailSenderPassword = viper.GetString("EMAIL_SENDER_PASSWORD")

	return
}
