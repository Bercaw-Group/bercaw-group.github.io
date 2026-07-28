const SAMPLES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=378766511&single=true&output=csv";

let projectsData = [];

function parseCSV(text) {
    const lines = text.split("\n").filter(l => l.trim() !== "");
    const headers = lines[0].split(",");
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const row = {};
        const values = lines[i].split(",");
        headers.forEach((h, index) => {
            row[h.trim()] = values[index] || "";
        });
        data.push(row);
    }

    return data;
}

async function fetchProjects() {

    const response = await fetch(SAMPLES_CSV);
    const text = await response.text();
    projectsData = parseCSV(text);

    renderProjects(projectsData);
}

function renderProjects(projects) {

    const grid = document.getElementById("portfolio-grid");
    grid.innerHTML = "";

    projects.forEach(project => {

        const card = document.createElement("div");
        card.className = "bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition";

        const firstImage = project["Image 1"];

        card.innerHTML = `
            <img src="${firstImage || ''}" class="w-full h-64 object-cover">
            <div class="p-5">
                <h3 class="text-lg font-bold">${project.Title}</h3>
                <p class="text-gray-500 text-sm">${project.Location || ''}</p>
            </div>
        `;

        card.addEventListener("click", () => openPortfolioModal(project));

        grid.appendChild(card);
    });
}

function openPortfolioModal(project) {

    document.getElementById("modal-title").textContent = project.Title;
    document.getElementById("modal-location").textContent = project.Location || '';
    document.getElementById("modal-description").textContent = project.Description || '';

    const imageContainer = document.getElementById("modal-images");
    imageContainer.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
        const img = project[`Image ${i}`];
        if (img && img.trim() !== "") {
            const imageEl = document.createElement("img");
            imageEl.src = img;
            imageEl.className = "w-full max-w-md rounded-lg shadow";
            imageContainer.appendChild(imageEl);
        }
    }

    document.getElementById("portfolio-modal").classList.remove("hidden");
    document.getElementById("portfolio-modal").classList.add("flex");
    document.body.style.overflow = "hidden";
}

function closePortfolioModal() {
    document.getElementById("portfolio-modal").classList.add("hidden");
    document.getElementById("portfolio-modal").classList.remove("flex");
    document.body.style.overflow = "auto";
}

document.getElementById("portfolio-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "portfolio-modal") closePortfolioModal();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePortfolioModal();
});

fetchProjects();