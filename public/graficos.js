let allCards = [];
let filteredCards = [];
let charts = {};

const colorNames = {
    W: 'Branco', U: 'Azul', B: 'Preto', R: 'Vermelho', G: 'Verde'
};

async function loadCards() {
    try {
        const response = await fetch("http://localhost:3000/cards");
        allCards = await response.json();
        filteredCards = [...allCards];

        updateStatistics();
        createCharts();
        displayTable();
        setupEvents();

    } catch (err) {
        console.error("Erro:", err);
    }
}

function updateStatistics() {
    document.getElementById("total-cards").textContent = allCards.length;
    document.getElementById("total-colors").textContent =
        new Set(allCards.flatMap(c => c.colors || [])).size;
    document.getElementById("total-sets").textContent =
        new Set(allCards.map(c => c.set)).size;
    document.getElementById("total-types").textContent =
        new Set(allCards.flatMap(c => c.types || [])).size;
}

function createCharts() {
    createRarityChart();
    createColorChart();
    createTypeChart();
    createSetChart();
}

function createRarityChart() {
    const data = {};
    allCards.forEach(c => data[c.rarity] = (data[c.rarity] || 0) + 1);

    charts.rarity = new Chart(document.getElementById("rarityChart"), {
        type: "doughnut",
        data: { labels: Object.keys(data), datasets: [{ data: Object.values(data) }] }
    });
}

function createColorChart() {
    const data = {};

    allCards.forEach(c => {
        if (!c.colors || c.colors.length === 0) {
            data["Incolor"] = (data["Incolor"] || 0) + 1;
            return;
        }
        c.colors.forEach(cl => {
            data[colorNames[cl]] = (data[colorNames[cl]] || 0) + 1;
        });
    });

    charts.color = new Chart(document.getElementById("colorChart"), {
        type: "pie",
        data: { labels: Object.keys(data), datasets: [{ data: Object.values(data) }] }
    });
}

function createTypeChart() {
    const map = {};

    allCards.forEach(c => {
        if (c.types) {
            const t = c.types[0];
            map[t] = (map[t] || 0) + 1;
        }
    });

    const sorted = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10);

    charts.type = new Chart(document.getElementById("typeChart"), {
        type: "bar",
        data: {
            labels: sorted.map(s=>s[0]),
            datasets: [{ data: sorted.map(s=>s[1]) }]
        }
    });
}

function createSetChart() {
    const map = {};
    allCards.forEach(c => map[c.set] = (map[c.set] || 0) + 1);

    const sorted = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,15);

    charts.set = new Chart(document.getElementById("setChart"), {
        type: "bar",
        data: {
            labels: sorted.map(s=>s[0]),
            datasets: [{ data: sorted.map(s=>s[1]) }]
        }
    });
}

function displayTable() {
    const body = document.getElementById("tableBody");
    const showing = document.getElementById("showing-count");
    const total = document.getElementById("total-count");

    body.innerHTML = "";

    filteredCards.slice(0,200).forEach(c => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><strong>${c.name}</strong></td>
            <td>${c.type}</td>
            <td>${c.rarity}</td>
            <td>${c.colors?.map(cl=>colorNames[cl]).join(", ") || "Incolor"}</td>
            <td>${c.set}</td>
            <td>${c.artist || "N/A"}</td>
        `;

        tr.addEventListener("click", () => {
            window.location.href = `detalhes.html?id=${c.id}`;
        });

        body.appendChild(tr);
    });

    showing.textContent = filteredCards.length;
    total.textContent = allCards.length;
}

function setupEvents() {
    document.getElementById("searchInput").addEventListener("input", applyFilters);
    document.getElementById("rarityFilter").addEventListener("change", applyFilters);
    document.getElementById("colorFilter").addEventListener("change", applyFilters);
    document.getElementById("resetBtn").addEventListener("click", resetFilters);
}

function applyFilters() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    const rarity = document.getElementById("rarityFilter").value;
    const color = document.getElementById("colorFilter").value;

    filteredCards = allCards.filter(c => {
        const matchName = !q || c.name.toLowerCase().includes(q);
        const matchRarity = !rarity || c.rarity === rarity;

        let matchColor = true;
        if (color === "colorless") matchColor = !c.colors || c.colors.length === 0;
        else if (color === "multi") matchColor = c.colors && c.colors.length > 1;
        else if (color) matchColor = c.colors?.includes(color);

        return matchName && matchRarity && matchColor;
    });

    displayTable();
}

function resetFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("rarityFilter").value = "";
    document.getElementById("colorFilter").value = "";
    filteredCards = [...allCards];
    displayTable();
}

document.addEventListener("DOMContentLoaded", loadCards);
