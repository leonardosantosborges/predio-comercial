const floors = readFloors();
const floorList = document.querySelector("#floor-list");
const buildingFloors = document.querySelector("#building-floors");
const selectedDetail = document.querySelector("#selected-detail");
const searchInput = document.querySelector("#search-input");
const typeFilter = document.querySelector("#type-filter");
const visibilityFilter = document.querySelector("#visibility-filter");
const resultCount = document.querySelector("#result-count");
const resultsTitle = document.querySelector("#results-title");
const summaryOpen = document.querySelector("#summary-open");
const summaryHidden = document.querySelector("#summary-hidden");
const clearFloorFilter = document.querySelector("#clear-floor-filter");

let selectedFloor = null;

function floorStatus(floor) {
  if (!floor.entries.length) return "empty";
  if (floor.entries.some((entry) => entry.status === "public")) return "public";
  return "hidden";
}

function statusLabel(status) {
  const labels = {
    public: "Público",
    hidden: "Ocupado oculto",
    empty: "Sem cadastro",
  };

  return labels[status] || status;
}

function categoryTone(category, status) {
  if (status === "hidden") return "private";
  if (status === "empty") return "muted";
  const normalized = category.toLowerCase();
  if (["cafeteria", "restaurante"].includes(normalized)) return "food";
  if (normalized === "loja") return "shop";
  if (normalized === "saúde") return "health";
  return "service";
}

function publicName(entry) {
  if (entry.status === "hidden") return "Ocupado";
  return entry.name || "Sem nome";
}

function allEntries() {
  return floors.flatMap((floor) => {
    if (!floor.entries.length) {
      return [
        {
          floor: floor.floor,
          id: `empty-${floor.floor}`,
          name: "",
          category: "Sem cadastro",
          description: "",
          image: "",
          status: "empty",
          featured: false,
        },
      ];
    }

    return floor.entries.map((entry) => ({
      ...entry,
      floor: floor.floor,
    }));
  });
}

function setupTypeFilter() {
  const categories = [
    ...new Set(
      floors.flatMap((floor) => floor.entries.map((entry) => entry.category)).filter(Boolean),
    ),
  ].sort();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    typeFilter.appendChild(option);
  });
}

function renderBuilding() {
  buildingFloors.innerHTML = "";

  floors.forEach((floor) => {
    const button = document.createElement("button");
    const status = floorStatus(floor);
    const publicCount = floor.entries.filter((entry) => entry.status === "public").length;
    const hiddenCount = floor.entries.filter((entry) => entry.status === "hidden").length;
    const firstPublic = floor.entries.find((entry) => entry.status === "public");
    const firstEntry = firstPublic || floor.entries[0];

    button.type = "button";
    button.className = "public-floor-row";
    button.dataset.status = status;
    button.setAttribute(
      "aria-label",
      `Andar ${floor.floor}: ${publicCount} visíveis, ${hiddenCount} ocultos`,
    );

    if (selectedFloor === floor.floor) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      selectedFloor = selectedFloor === floor.floor ? null : floor.floor;
      render();
    });

    const number = document.createElement("span");
    number.className = `public-floor-number tone-${categoryTone(firstEntry?.category || "", status)}`;
    number.textContent = floor.floor;

    if (status === "hidden") {
      number.textContent = "";
    }

    const info = document.createElement("span");
    info.className = "public-floor-info";

    const name = document.createElement("strong");
    name.textContent =
      status === "empty"
        ? `Andar ${floor.floor}`
        : status === "hidden"
          ? `Andar ${floor.floor} • Ocupado`
          : publicName(firstEntry);

    const description = document.createElement("small");
    description.textContent =
      status === "empty"
        ? "Sem cadastro"
        : status === "hidden"
          ? "Empresa não divulgada"
          : `${floor.entries.length} item${floor.entries.length === 1 ? "" : "s"} neste andar`;

    info.append(name, description);

    const badge = document.createElement("span");
    badge.className = `public-badge tone-${categoryTone(firstEntry?.category || "", status)}`;
    badge.textContent =
      status === "empty" ? "Vazio" : status === "hidden" ? "Privado" : firstEntry.category;

    button.append(number, info, badge);
    buildingFloors.appendChild(button);
  });
}

function matchesFilters(item) {
  const query = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const visibility = visibilityFilter.value;

  if (selectedFloor && item.floor !== selectedFloor) return false;
  if (type !== "all" && item.category !== type) return false;
  if (visibility !== "all" && item.status !== visibility) return false;

  if (!query) return true;

  const searchable = [
    item.floor,
    item.status === "hidden" ? "ocupado oculto empresa privada" : item.name,
    item.category,
    item.status === "hidden" ? "" : item.description,
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
}

function createDirectoryCard(item) {
  const article = document.createElement("article");
  article.className = "floor-card";
  article.dataset.status = item.status;

  if (item.featured && item.status === "public") {
    article.classList.add("is-featured");
  }

  const body = document.createElement("div");
  body.className = "floor-body";

  const meta = document.createElement("div");
  meta.className = "floor-meta";

  const floorBadge = document.createElement("span");
  floorBadge.textContent = `${item.floor}º andar`;

  const statusBadge = document.createElement("span");
  statusBadge.textContent = statusLabel(item.status);

  meta.append(floorBadge, statusBadge);

  const content = document.createElement("div");
  content.className = "floor-content";

  const title = document.createElement("h3");
  title.textContent = publicName(item);

  const description = document.createElement("p");
  description.textContent =
    item.status === "public"
      ? item.description || "Sem descrição cadastrada."
      : item.status === "hidden"
        ? "Informações não exibidas ao público por solicitação do ocupante."
        : "Nenhum local cadastrado para este andar.";

  const tags = document.createElement("div");
  tags.className = "tags";

  const category = document.createElement("span");
  category.className = `tone-${categoryTone(item.category, item.status)}`;
  category.textContent = item.status === "empty" ? "Sem cadastro" : item.category;
  tags.appendChild(category);

  if (item.featured && item.status === "public") {
    const featured = document.createElement("span");
    featured.textContent = "Destaque";
    tags.appendChild(featured);
  }

  content.append(title, description, tags);
  body.append(meta, content);

  if (item.status === "public" && item.image) {
    const image = document.createElement("img");
    image.className = "floor-thumb";
    image.src = item.image;
    image.alt = item.name;
    body.appendChild(image);
  }

  article.appendChild(body);
  return article;
}

function renderDetail(items) {
  selectedDetail.innerHTML = "";

  const item =
    items.find((entry) => entry.status === "public" && entry.featured) ||
    items.find((entry) => entry.status === "public") ||
    items[0];

  if (!item) return;

  const hero = document.createElement("div");
  hero.className = "detail-hero";

  const floorNumber = document.createElement("div");
  floorNumber.className = "detail-floor-number";
  floorNumber.textContent = item.floor;

  const content = document.createElement("div");

  const tag = document.createElement("p");
  tag.className = "eyebrow";
  tag.textContent = `${item.floor}º andar`;

  const title = document.createElement("h2");
  title.textContent = publicName(item);

  const status = document.createElement("span");
  status.className = `detail-status tone-${categoryTone(item.category, item.status)}`;
  status.textContent = statusLabel(item.status);

  content.append(tag, title, status);
  hero.append(floorNumber, content);

  const body = document.createElement("div");
  body.className = "detail-body";

  const description = document.createElement("p");
  description.textContent =
    item.status === "public"
      ? item.description || "Sem descrição cadastrada."
      : item.status === "hidden"
        ? "Empresa ou ocupante privado. Informações não exibidas ao público."
        : "Nenhum local cadastrado para este andar.";

  const meta = document.createElement("div");
  meta.className = "detail-meta";
  meta.appendChild(makeMetaBlock("Categoria", item.status === "empty" ? "Sem cadastro" : item.category));
  meta.appendChild(makeMetaBlock("Itens no filtro", String(items.length)));
  meta.appendChild(makeMetaBlock("Consulta", selectedFloor ? "Andar selecionado" : "Todos os andares"));

  body.append(description, meta);
  selectedDetail.append(hero, body);
}

function makeMetaBlock(title, value) {
  const block = document.createElement("div");
  block.className = "meta-block";

  const label = document.createElement("span");
  label.textContent = title;

  const text = document.createElement("strong");
  text.textContent = value;

  block.append(label, text);
  return block;
}

function render() {
  const filtered = allEntries().filter(matchesFilters);
  floorList.innerHTML = "";

  renderBuilding();
  renderDetail(filtered);

  filtered.forEach((item) => {
    floorList.appendChild(createDirectoryCard(item));
  });

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nenhum resultado encontrado com esses filtros.";
    floorList.appendChild(empty);
  }

  const publicEntries = floors.flatMap((floor) => floor.entries).filter((entry) => entry.status === "public");
  const hiddenEntries = floors.flatMap((floor) => floor.entries).filter((entry) => entry.status === "hidden");

  resultCount.textContent = `${filtered.length} resultado${filtered.length === 1 ? "" : "s"}`;
  resultsTitle.textContent = selectedFloor ? `Andar ${selectedFloor}` : "Todos os andares";
  summaryOpen.textContent = publicEntries.length;
  summaryHidden.textContent = hiddenEntries.length;
}

setupTypeFilter();
render();

[searchInput, typeFilter, visibilityFilter].forEach((control) => {
  control.addEventListener("input", () => {
    selectedFloor = null;
    render();
  });
});

clearFloorFilter.addEventListener("click", () => {
  selectedFloor = null;
  render();
});
