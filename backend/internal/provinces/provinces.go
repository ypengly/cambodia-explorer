// Package provinces loads the shared province metadata (single source of truth: frontend/src/data/provinces.json).
package provinces

import (
	"encoding/json"
	"os"
	"strings"
)

type Province struct {
	ID      string   `json:"id"`
	EN      string   `json:"en"`
	KM      string   `json:"km"`
	Type    string   `json:"type"`
	Coastal bool     `json:"coastal"`
	Aliases []string `json:"aliases"`
}

func Load(path string) ([]Province, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var out []Province
	return out, json.Unmarshal(b, &out)
}

func Search(list []Province, q string) []Province {
	q = strings.ToLower(strings.TrimSpace(q))
	if q == "" {
		return list
	}
	var out []Province
	for _, p := range list {
		for _, v := range append([]string{p.EN, p.KM}, p.Aliases...) {
			if strings.Contains(strings.ToLower(v), q) {
				out = append(out, p)
				break
			}
		}
	}
	return out
}
