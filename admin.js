const ADMIN_PASSWORD = "admin123";

let floors = readFloors();
let currentFloor = 1;
let currentEntryId = null;

const loginCard = document.querySelector("#login-card");
const loginForm = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password-input");
const loginError = document.querySelector("#login-error");
const adminPanel = document.querySelector("#admin-panel");
const adminFloorList = document.querySelector("#admin-floor-list");
const entryForm = document.querySelector("#entry-form");
const editorTitle = document.querySelector("#editor-title");
const entryCount = document.querySelector("#entry-count");
const saveState = document.querySelector("#save-state");
const resetData = document.querySelector("#reset-data");
const clearFloor = document.querySelector("#clear-floor");
const addEntry = document.querySelector("#add-entry");
const deleteEntry = document.querySelector("#delete-entry");
const entryList = document.querySelector("#entry-list");
const preview = document.querySelector("#admin-preview");
const feedbackModal = document.querySelector("#feedback-modal");
const feedbackTitle = document.querySelector("#feedback-title");
const feedbackMessage = document.querySelector("#feedback-message");
const feedbackClose = document.querySelector("#feedback-close");

let feedbackTimer = null;

const inputs = {
  name: document.querySelector("#name-input"),
  category: document.querySelector("#category-input"),
  description: document.querySelector("#description-input"),
  image: document.querySelector("#image-input"),
  status: document.querySelector("#status-input"),
  featured: document.querySelector("#featured-input"),
};

function currentFloorData() {
  return floors.find((item) => item.floor === currentFloor);
}

function currentEntry() {
  return currentFloorData().entries.find((entry) => entry.id === currentEntryId) || null;
}

function floorSummary(floor) {
  const total = floor.entries.length;
  const hidden = floor.entries.filter((entry) => entry.status === "hidden").length;

  if (!total) return "Sem cadastro";
  if (hidden === total) return `${total} oculto${total === 1 ? "" : "s"}`;
  return total === 1 ? "1 item" : `${total} itens`;
}

function publicName(entry) {
  if (!entry) return "Nenhum item selecionado";
  if (entry.status === "hidden") return "Ocupado";
  return entry.name || "Sem nome";
}

function adminName(entry) {
  if (!entry) return "Nenhum item selecionado";
  return entry.name || (entry.status === "hidden" ? "Ocupado oculto" : "Sem nome");
}

function makeBlankEntry() {
  return createEntry({
    name: "",
    category: "Outro",
    description: "",
    image: "",
    status: "public",
    featured: false,
  });
}

function showFeedback(title, message) {
  feedbackTitle.textContent = title;
  feedbackMessage.textContent = message;
  feedbackModal.classList.remove("is-hidden");

  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedbackModal.classList.add("is-hidden");
  }, 2600);
}

function showAdmin() {
  loginCard.classList.add("is-hidden");
  adminPanel.classList.remove("is-hidden");
  ensureSelectedEntry();
  renderAdminList();
  loadEditor();
}

function ensureSelectedEntry() {
  const floor = currentFloorData();

  if (!floor.entries.length) {
    currentEntryId = null;
    return;
  }

  if (!floor.entries.some((entry) => entry.id === currentEntryId)) {
    currentEntryId = floor.entries[0].id;
  }
}

function renderAdminList() {
  adminFloorList.innerHTML = "";

  floors.forEach((floor) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "admin-floor-button";
    button.dataset.status = floor.entries.length ? "public" : "empty";

    if (floor.floor === currentFloor) {
      button.classList.add("is-active");
    }

    const number = document.createElement("strong");
    number.textContent = `${floor.floor}º`;

    const summary = document.createElement("span");
    summary.textContent = floorSummary(floor);

    button.append(number, summary);

    button.addEventListener("click", () => {
      currentFloor = floor.floor;
      currentEntryId = null;
      ensureSelectedEntry();
      renderAdminList();
      loadEditor();
    });

    adminFloorList.appendChild(button);
  });
}

function renderEntryList() {
  const floor = currentFloorData();
  entryList.innerHTML = "";
  entryCount.textContent = floor.entries.length === 1 ? "1 item" : `${floor.entries.length} itens`;

  if (!floor.entries.length) {
    const empty = document.createElement("p");
    empty.className = "entry-empty";
    empty.textContent = "Este andar ainda não possui itens. Clique em Novo item para cadastrar.";
    entryList.appendChild(empty);
    return;
  }

  floor.entries.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "entry-button";
    button.dataset.status = entry.status;

    if (entry.id === currentEntryId) {
      button.classList.add("is-active");
    }

    const title = document.createElement("strong");
    title.textContent = adminName(entry);

    const meta = document.createElement("span");
    meta.textContent = entry.status === "hidden" ? "Privado / oculto" : entry.category;

    button.append(title, meta);

    button.addEventListener("click", () => {
      currentEntryId = entry.id;
      loadEditor();
    });

    entryList.appendChild(button);
  });
}

function loadEditor() {
  const floor = currentFloorData();
  const entry = currentEntry();

  editorTitle.textContent = `Andar ${floor.floor}`;
  renderEntryList();

  const disabled = !entry;
  Object.values(inputs).forEach((input) => {
    input.disabled = disabled;
  });
  deleteEntry.disabled = disabled;

  inputs.name.value = entry?.name || "";
  inputs.category.value = entry?.category || "Outro";
  inputs.description.value = entry?.description || "";
  inputs.image.value = entry?.image || "";
  inputs.status.value = entry?.status || "public";
  inputs.featured.checked = Boolean(entry?.featured);

  renderPreview();
}

function previewEntry() {
  if (!currentEntry()) return null;

  return {
    floor: currentFloor,
    name: inputs.name.value,
    category: inputs.category.value,
    description: inputs.description.value,
    image: inputs.image.value,
    status: inputs.status.value,
    featured: inputs.featured.checked,
  };
}

function renderPreview() {
  const item = previewEntry();
  preview.innerHTML = "";

  if (!item) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Selecione ou crie um item para visualizar como ele aparece para visitantes.";
    preview.appendChild(empty);
    return;
  }

  const card = document.createElement("article");
  card.className = "floor-card";
  card.dataset.status = item.status;

  const body = document.createElement("div");
  body.className = "floor-body";

  const meta = document.createElement("div");
  meta.className = "floor-meta";

  const floorBadge = document.createElement("span");
  floorBadge.textContent = `${item.floor}º andar`;

  const statusBadge = document.createElement("span");
  statusBadge.textContent = item.status === "hidden" ? "Ocupado oculto" : "Público";

  meta.append(floorBadge, statusBadge);

  const content = document.createElement("div");
  content.className = "floor-content";

  const title = document.createElement("h3");
  title.textContent = publicName(item);

  const description = document.createElement("p");
  description.textContent =
    item.status === "public"
      ? item.description || "Sem descrição cadastrada."
      : "Informações não exibidas ao público por solicitação do ocupante.";

  const tags = document.createElement("div");
  tags.className = "tags";

  const category = document.createElement("span");
  category.textContent = item.category;
  tags.appendChild(category);

  content.append(title, description, tags);
  body.append(meta, content);

  if (item.status === "public" && item.image) {
    const image = document.createElement("img");
    image.className = "floor-thumb";
    image.src = item.image;
    image.alt = item.name;
    body.appendChild(image);
  }

  card.appendChild(body);
  preview.appendChild(card);
}

function persistCurrentEntry() {
  floors = floors.map((floor) => {
    if (floor.floor !== currentFloor) return floor;

    return {
      ...floor,
      entries: floor.entries.map((entry) => {
        if (entry.id !== currentEntryId) return entry;

        return {
          ...entry,
          name: inputs.name.value.trim(),
          category: inputs.category.value,
          description: inputs.description.value.trim(),
          image: inputs.image.value.trim(),
          status: inputs.status.value,
          featured: inputs.featured.checked,
        };
      }),
    };
  });

  saveFloors(floors);
  renderAdminList();
  renderEntryList();
  renderPreview();

  saveState.textContent = "Salvo";
  showFeedback("Item salvo", "As alterações deste item já aparecem na consulta pública.");
  setTimeout(() => {
    saveState.textContent = "Pronto";
  }, 1200);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (passwordInput.value !== ADMIN_PASSWORD) {
    loginError.textContent = "Senha incorreta.";
    return;
  }

  sessionStorage.setItem("predio-admin-auth", "true");
  showAdmin();
});

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (currentEntryId) persistCurrentEntry();
});

Object.values(inputs).forEach((input) => {
  input.addEventListener("input", renderPreview);
});

addEntry.addEventListener("click", () => {
  const entry = makeBlankEntry();

  floors = floors.map((floor) => {
    if (floor.floor !== currentFloor) return floor;
    return {
      ...floor,
      entries: [...floor.entries, entry],
    };
  });

  currentEntryId = entry.id;
  saveFloors(floors);
  renderAdminList();
  loadEditor();
  showFeedback("Item criado", "Preencha os dados do novo item e clique em Salvar item.");
});

deleteEntry.addEventListener("click", () => {
  if (!currentEntryId) return;

  floors = floors.map((floor) => {
    if (floor.floor !== currentFloor) return floor;
    return {
      ...floor,
      entries: floor.entries.filter((entry) => entry.id !== currentEntryId),
    };
  });

  currentEntryId = null;
  ensureSelectedEntry();
  saveFloors(floors);
  renderAdminList();
  loadEditor();
  showFeedback("Item excluído", "O item foi removido deste andar.");
});

clearFloor.addEventListener("click", () => {
  floors = floors.map((floor) => {
    if (floor.floor !== currentFloor) return floor;
    return {
      ...floor,
      entries: [],
    };
  });

  currentEntryId = null;
  saveFloors(floors);
  renderAdminList();
  loadEditor();
  showFeedback("Andar limpo", "Todos os itens deste andar foram removidos.");
});

resetData.addEventListener("click", () => {
  floors = resetFloors();
  currentFloor = 1;
  currentEntryId = null;
  ensureSelectedEntry();
  renderAdminList();
  loadEditor();
  showFeedback("Demo restaurada", "Os dados de demonstração foram carregados novamente.");
});

if (sessionStorage.getItem("predio-admin-auth") === "true") {
  showAdmin();
}

feedbackClose.addEventListener("click", () => {
  clearTimeout(feedbackTimer);
  feedbackModal.classList.add("is-hidden");
});
