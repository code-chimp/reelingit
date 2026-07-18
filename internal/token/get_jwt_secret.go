package token

import (
	"os"

	"code-chimp.com/reelingit/internal/logger"
)

// GetJWTSecret returns the HMAC signing secret from the JWT_SECRET
// environment variable, logging which source was used. If JWT_SECRET is
// unset, it falls back to a hardcoded development secret — this must not be
// relied upon in production.
func GetJWTSecret(logger logger.Logger) string {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default-secret-for-dev"
		logger.Info("JWT_SECRET not set, using default development secret")
	} else {
		logger.Info("Using JWT_SECRET from environment")
	}
	return jwtSecret
}
