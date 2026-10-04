package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ApiRoute struct {
	Method  string
	Path    string
	Handler func(c *gin.Context, db *gorm.DB)
}

var ApiRoutes = []ApiRoute{}

func Register(route ApiRoute) {
	ApiRoutes = append(ApiRoutes, route)
}
