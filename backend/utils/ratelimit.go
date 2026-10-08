package utils

import (
	"sync"

	"golang.org/x/time/rate"
)

var (
	limiters = make(map[string]*rate.Limiter)
	mu       sync.Mutex
)

func GetLimiter(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	limiter, exists := limiters[ip]
	if !exists {
		limiter = rate.NewLimiter(rate.Limit(0.1), 1)
		limiters[ip] = limiter
	}

	return limiter
}
