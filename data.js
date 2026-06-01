const STORAGE_KEY = "predio-comercial-floors";

function createEntry({
  name = "",
  category = "Outro",
  description = "",
  image = "",
  status = "public",
  featured = false,
} = {}) {
  return {
    id: crypto.randomUUID(),
    name,
    category,
    description,
    image,
    status,
    featured,
  };
}

const DEFAULT_FLOORS = Array.from({ length: 29 }, (_, index) => {
  const floor = index + 1;
  const samples = {
    1: [
      createEntry({
        name: "Recepção e Informações",
        category: "Serviço",
        description: "Recepção principal, orientação de visitantes e controle de acesso.",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
        featured: true,
      }),
      createEntry({
        name: "Galeria de Conveniência",
        category: "Loja",
        description: "Pequenas lojas e serviços rápidos para visitantes e usuários do prédio.",
      }),
    ],
    3: [
      createEntry({
        name: "Café Central",
        category: "Cafeteria",
        description: "Cafés, lanches rápidos e mesas para pequenas reuniões.",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80",
        featured: true,
      }),
      createEntry({
        name: "Café Expresso",
        category: "Cafeteria",
        description: "Balcão rápido para retirada de bebidas e itens prontos.",
      }),
    ],
    5: [
      createEntry({
        name: "Loja Express",
        category: "Loja",
        description: "Conveniência, presentes corporativos e itens de uso diário.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
      }),
    ],
    8: [
      createEntry({
        category: "Empresa",
        status: "hidden",
      }),
    ],
    12: [
      createEntry({
        name: "Clínica Bem-Estar",
        category: "Saúde",
        description: "Consultórios com atendimento agendado e sala de espera.",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
      }),
    ],
    17: [
      createEntry({
        category: "Empresa",
        status: "hidden",
      }),
    ],
    21: [
      createEntry({
        name: "Restaurante Vista",
        category: "Restaurante",
        description: "Almoço executivo, pratos rápidos e vista panorâmica.",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
        featured: true,
      }),
    ],
  };

  return {
    floor,
    entries: samples[floor] || [],
  };
});

function normalizeEntry(entry) {
  return {
    id: entry.id || crypto.randomUUID(),
    name: entry.name || "",
    category: entry.category || "Outro",
    description: entry.description || "",
    image: entry.image || "",
    status: entry.status === "hidden" ? "hidden" : "public",
    featured: Boolean(entry.featured),
  };
}

function normalizeFloor(saved, fallback) {
  if (!saved) return fallback;

  if (Array.isArray(saved.entries)) {
    return {
      floor: fallback.floor,
      entries: saved.entries.map(normalizeEntry),
    };
  }

  if (saved.status === "empty") {
    return {
      floor: fallback.floor,
      entries: [],
    };
  }

  return {
    floor: fallback.floor,
    entries: [
      normalizeEntry({
        name: saved.name,
        category: saved.category,
        description: saved.description,
        image: saved.image,
        status: saved.status,
        featured: saved.featured,
      }),
    ],
  };
}

function readFloors() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FLOORS));
    return DEFAULT_FLOORS;
  }

  try {
    const parsed = JSON.parse(stored);
    const normalized = DEFAULT_FLOORS.map((fallback) => {
      const saved = parsed.find((item) => item.floor === fallback.floor);
      return normalizeFloor(saved, fallback);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FLOORS));
    return DEFAULT_FLOORS;
  }
}

function saveFloors(floors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(floors));
}

function resetFloors() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FLOORS));
  return DEFAULT_FLOORS;
}
