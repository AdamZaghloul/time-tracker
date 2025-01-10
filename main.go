package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type Client struct {
	db *sql.DB
}

type apiConfig struct {
	filePathRoot string
	port         string
	db           *Client
}

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

	dbString := os.Getenv("DB_STRING")
	if port == "" {
		log.Fatal("DB_STRING env variable not set")
	}

	db, err := sql.Open("postgres", dbString)
	if err != nil {
		log.Fatal("Unable to connect to database")
	}

	dbClient := Client{db}

	mux := http.NewServeMux()
	appHandler := http.FileServer(http.Dir(filePathRoot))
	mux.Handle("/", appHandler)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	cfg := apiConfig{
		filePathRoot: filePathRoot,
		port:         port,
		db:           &dbClient,
	}

	log.Printf("Serving on: http://localhost:%s\n", port)
	log.Fatal(srv.ListenAndServe())
}
