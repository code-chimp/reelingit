package token

import (
	"time"

	"code-chimp.com/reelingit/internal/logger"
	"code-chimp.com/reelingit/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

// CreateJWT builds and signs an HS256 JWT carrying user's id, email, and
// name, expiring 72 hours from now. The token is signed with the secret from
// GetJWTSecret. On signing failure it logs the error and returns an empty
// string rather than an error, so callers should treat "" as failure.
func CreateJWT(user models.User, logger logger.Logger) string {
	jwtSecret := GetJWTSecret(logger)

	// Create a JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
		"exp":   time.Now().Add(time.Hour * 72).Unix(), // Token expires in 72 hours
	})

	// Sign the token with the secret
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		logger.Error("Failed to sign JWT", err)
		return ""
	}

	return tokenString
}
