// ================================
// CONFIGURACIÓN INICIAL
// ================================
const SPREADSHEET_ID = "1Bf1pOOSn-nCrGlalyHqA8u6End_0iVsv10Na-AI42v0";
const params = new URLSearchParams(window.location.search);
const sheetName = params.get("player") || "";
const [numberFromUrl, ...nameParts] = sheetName.split(" ");
const playerNameFromUrl = nameParts.join(" ");

console.log("Jugador seleccionado:", sheetName);

// ================================
// DICCIONARIO DE ESTADÍSTICAS
// ================================
const STAT_INFO = {
  PTS: "Puntos por partido",
  REB: "Rebotes por partido",
  ASS: "Asistencias por partido",
  STL: "Robos por partido",
  BLK: "Tapones por partido",
  TO: "Pérdidas por partido",
  "2PT%": "Porcentaje de dobles",
  "3PT%": "Porcentaje de triples",
  EFF: "Eficiencia general del jugador",
  PLAYED: "Partidos jugados"
};

// ================================
// FUNCIONES AUXILIARES
// ================================
function formatStat(value, decimals = 1) {
  return Number(value).toFixed(decimals);
}

function formatPct(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

function formatInt(value) {
  return Math.round(value);
}

// ================================
// CARGAR PROMEDIOS Y TABLA DE PARTIDOS
// ================================
function loadPlayerAverages() {
  if (!sheetName) return;

  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47, text.length - 2));
      const rows = json.table.rows;

      console.log("TOTAL FILAS:", rows.length);
      debugRows(rows);

      // ============================
      // FOTO Y DATOS DEL JUGADOR
      // ============================
      const playerId = rows[3]?.c[1]?.v || "";
      const photoElement = document.querySelector(".player-photo");
      photoElement.style.backgroundImage = playerId
        ? `url("assets/players/${playerId}.png")`
        : "none";

      document.getElementById("playerName").textContent = playerNameFromUrl;
      document.getElementById("playerId").textContent = numberFromUrl;

      // ============================
      // PROMEDIOS DEL JUGADOR
      // ============================
      const stats = {
        pts: rows[0]?.c[4]?.v ?? 0,
        rebs: rows[1]?.c[4]?.v ?? 0,
        assists: rows[2]?.c[4]?.v ?? 0,
        steals: rows[0]?.c[6]?.v ?? 0,
        blocks: rows[1]?.c[6]?.v ?? 0,
        turnovers: rows[2]?.c[6]?.v ?? 0,
        played: rows[1]?.c[11]?.v ?? 0,
        twoPtPct: rows[2]?.c[8]?.v ?? 0,
        threePtPct: rows[2]?.c[10]?.v ?? 0,
        efficiency: rows[2]?.c[11]?.v ?? 0
      };

      renderAverages(stats);
      setupTooltip();
      renderGamesTable(rows);
    })
    .catch(err => console.error("Error cargando hoja del jugador:", err));
}

// ================================
// FUNCIONES DE RENDER
// ================================
function renderAverages(stats) {
  document.getElementById("averagesGrid").innerHTML = `
    <div class="avg-item" data-stat="PTS"><strong>PTS</strong><span class="stat-value">${formatStat(stats.pts)}</span></div>
    <div class="avg-item" data-stat="REB"><strong>REB</strong><span class="stat-value">${formatStat(stats.rebs)}</span></div>
    <div class="avg-item" data-stat="ASS"><strong>ASS</strong><span class="stat-value">${formatStat(stats.assists)}</span></div>
    <div class="avg-item" data-stat="STL"><strong>STL</strong><span class="stat-value">${formatStat(stats.steals)}</span></div>
    <div class="avg-item" data-stat="BLK"><strong>BLK</strong><span class="stat-value">${formatStat(stats.blocks)}</span></div>
    <div class="avg-item" data-stat="TO"><strong>TO</strong><span class="stat-value">${formatStat(stats.turnovers)}</span></div>
    <div class="avg-item" data-stat="2PT%"><strong>2PT%</strong><span class="stat-value">${formatPct(stats.twoPtPct)}</span></div>
    <div class="avg-item" data-stat="3PT%"><strong>3PT%</strong><span class="stat-value">${formatPct(stats.threePtPct)}</span></div>
    <div class="avg-item" data-stat="EFF"><strong>EFF</strong><span class="stat-value">${formatStat(stats.efficiency)}</span></div>
    <div class="avg-item" data-stat="PLAYED"><strong>PLAYED</strong><span class="stat-value">${formatInt(stats.played)}</span></div>
  `;
}

function setupTooltip() {
  const tooltip = document.getElementById("statTooltip");

  document.addEventListener("click", e => {
    const statItem = e.target.closest(".avg-item");

    if (!statItem) {
      tooltip.classList.add("hidden");
      tooltip.classList.remove("visible");
      return;
    }

    const statKey = statItem.dataset.stat;
    const info = STAT_INFO[statKey];
    if (!info) return;

    const rect = statItem.getBoundingClientRect();

    tooltip.textContent = info;
    tooltip.style.top = `${window.scrollY + rect.top - 32}px`;
    tooltip.style.left = `${window.scrollX + rect.left + rect.width / 2}px`;
    tooltip.style.transform = "translateX(-50%)";

    tooltip.classList.remove("hidden");
    tooltip.classList.add("visible");
  });
}

function renderGamesTable(rows) {
  const table = document.getElementById("gamesTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  thead.innerHTML = `
    <tr>
      <th>GAME</th>
      <th>PTS</th>
      <th>REB</th>
      <th>ASS</th>
      <th>STL</th>
      <th>BLK</th>
      <th>2PT%</th>
      <th>3PT%</th>
      <th>TO</th>
    </tr>
  `;

  tbody.innerHTML = "";
  let lastGameName = "";

  rows.forEach(row => {
    const c = row?.c;
    if (!c) return;

    if (c[0]?.v) lastGameName = c[0].v;
    if (!lastGameName) return;

    const pts = c[1]?.v;
    if (pts === null || pts === undefined) return;

    const rebs = c[2]?.v ?? 0;
    const assists = c[3]?.v ?? 0;
    const steals = c[4]?.v ?? 0;
    const blocks = c[5]?.v ?? 0;
    const twoPtPct = c[8]?.v ?? 0;
    const threePtPct = c[11]?.v ?? 0;
    const turnovers = c[12]?.v ?? 0;

    const tr = document.createElement("tr");
    tr.classList.add("game-row");
    tr.innerHTML = `
      <td>${lastGameName}</td>
      <td>${pts}</td>
      <td>${rebs}</td>
      <td>${assists}</td>
      <td>${steals}</td>
      <td>${blocks}</td>
      <td>${formatPct(twoPtPct)}</td>
      <td>${formatPct(threePtPct)}</td>
      <td>${turnovers}</td>
    `;
    tbody.appendChild(tr);
  });

  setupGamesToggle();
}

function setupGamesToggle() {
  const toggleBtn = document.getElementById("toggleGames");
  const rows = Array.from(document.querySelectorAll("#gamesTable tbody .game-row"));

  function showLast5() {
    rows.forEach((row, index) => {
  row.style.display = index < 10 ? "" : "none";
});
    toggleBtn.textContent = "Ver todos los partidos";
    toggleBtn.dataset.showingAll = "false";
  }

  toggleBtn.addEventListener("click", () => {
    const showingAll = toggleBtn.dataset.showingAll === "true";

    if (showingAll) {
      showLast5();
    } else {
      rows.forEach(row => (row.style.display = ""));
      toggleBtn.textContent = "Ver menos";
      toggleBtn.dataset.showingAll = "true";
    }
  });

  // Mostrar solo últimas 5 al inicio
  showLast5();
}

// ================================
// DEBUG OPCIONAL
// ================================
function debugRows(rows) {
  rows.forEach((row, i) => {
    const valores = row.c?.map((c, j) => (c && c.v !== null ? `[${j}] ${c.v}` : null)).filter(Boolean);
    if (valores?.length) console.log(`Fila ${i}:`, valores.join(" | "));
  });
}

// ================================
// INICIALIZACIÓN
// ================================
loadPlayerAverages();
