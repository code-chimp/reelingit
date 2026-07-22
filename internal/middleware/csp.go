// Package middleware provides reusable HTTP handler wrappers for concerns
// that apply across routes.
package middleware

import (
	"net/http"
	"strings"
)

// ContentSecurityPolicy sets the application's Content-Security-Policy
// response header before serving next. The policy permits same-origin assets
// and API calls, Google-hosted fonts, TMDB images, and YouTube embeds while
// prohibiting plugins, cross-origin form submissions, and framing by other
// sites.
func ContentSecurityPolicy(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		policy := strings.Join([]string{
			"default-src 'self';",
			"script-src 'self';",
			"style-src 'self' https://fonts.googleapis.com;",
			"font-src 'self' https://fonts.gstatic.com;",
			"img-src 'self' https://image.tmdb.org;",
			"frame-src https://www.youtube.com;",
			"connect-src 'self';",
			"object-src 'none';",
			"base-uri 'self';",
			"form-action 'self';",
			"frame-ancestors 'none'",
		}, " ")
		w.Header().Set("Content-Security-Policy", policy)
		next.ServeHTTP(w, r)
	})
}
