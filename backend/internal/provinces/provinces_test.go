package provinces

import "testing"

func TestDataset(t *testing.T) {
	l, err := Load("../../../frontend/src/data/provinces.json")
	if err != nil {
		t.Fatal(err)
	}
	if len(l) != 25 {
		t.Fatalf("want 25, got %d", len(l))
	}
	seen, caps := map[string]bool{}, 0
	for _, p := range l {
		if seen[p.ID] {
			t.Fatalf("duplicate %s", p.ID)
		}
		seen[p.ID] = true
		if p.Type == "capital" {
			caps++
		}
	}
	if caps != 1 || !seen["kep"] || !seen["pailin"] || !seen["tboung-khmum"] {
		t.Fatal("capital count or required units wrong")
	}
}

func TestSearchKhmer(t *testing.T) {
	l, _ := Load("../../../frontend/src/data/provinces.json")
	if r := Search(l, "សៀមរាប"); len(r) != 1 || r[0].ID != "siem-reap" {
		t.Fatalf("got %v", r)
	}
}
