package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"cambodia-explorer/backend/internal/provinces"
)

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

func main() {
	list, err := provinces.Load(env("PROVINCES_FILE", "../frontend/src/data/provinces.json"))
	if err != nil {
		log.Fatal(err)
	}
	js := func(w http.ResponseWriter, v any) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Cache-Control", "public, max-age=300")
		json.NewEncoder(w).Encode(v)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) { js(w, map[string]any{"ok": true, "units": len(list)}) })
	mux.HandleFunc("GET /api/provinces", func(w http.ResponseWriter, r *http.Request) { js(w, provinces.Search(list, r.URL.Query().Get("q"))) })
	mux.HandleFunc("GET /api/provinces/{id}", func(w http.ResponseWriter, r *http.Request) {
		for _, p := range list {
			if p.ID == r.PathValue("id") {
				js(w, p)
				return
			}
		}
		http.NotFound(w, r)
	})
	mux.HandleFunc("GET /api/geojson", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, env("GEOJSON_FILE", "../frontend/public/data/cambodia-admin1.geojson"))
	})
	addr := ":" + env("PORT", "8080")
	log.Println("listening on", addr)
	log.Fatal(http.ListenAndServe(addr, logging(mux)))
}

func logging(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { log.Println(r.Method, r.URL.Path); h.ServeHTTP(w, r) })
}
