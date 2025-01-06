package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")

	filePathRoot := os.Getenv("FILEPATH_ROOT")
	if filePathRoot == "" {
		log.Fatal("FILEPATH_ROOT env variable not set")
	}

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT env variable not set")
	}

	mux := http.NewServeMux()
	appHandler := http.FileServer(http.Dir(filePathRoot))
	mux.Handle("/", appHandler)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	log.Printf("Serving on: http://localhost:%s/app/\n", port)
	log.Fatal(srv.ListenAndServe())
}
