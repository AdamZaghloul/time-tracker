package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/AdamZaghloul/time-tracker/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Client struct {
	db *sql.DB
}

type apiConfig struct {
	filePathRoot string
	port         string
	db           database.Queries
	jwtSecret    string
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
	if dbString == "" {
		log.Fatal("DB_STRING env variable not set")
	}

	db, err := sql.Open("postgres", dbString)
	if err != nil {
		log.Fatal("Unable to connect to database")
	}

	defer db.Close()

	//Test DB Connection
	err = db.Ping()
	if err != nil {
		log.Fatal("Unable to ping database")
	}

	dbQueries := database.New(db)

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET env variable not set")
	}

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
		db:           *dbQueries,
		jwtSecret:    jwtSecret,
	}

	mux.Handle("POST /api/users", http.HandlerFunc(cfg.handlerUserCreate))

	log.Printf("Serving on: http://localhost:%s\n", port)
	log.Fatal(srv.ListenAndServe())
}
