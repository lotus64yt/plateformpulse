package api

import (
	"plateformpulse/internal/api/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func StartApi(db *gorm.DB) *gin.Engine {
	router := gin.Default()
	router.Use(gin.Logger())
	router.Use(cors.Default())

	api := router.Group("/api")
	{
		api.Use(func(c *gin.Context) {
			c.Next()
		})

		for _, route := range routes.ApiRoutes {
			api.Handle(route.Method, route.Path, func(c *gin.Context) {
				route.Handler(c, db)
			})
		}
	}

	router.Run(":4088")

	return router
}
