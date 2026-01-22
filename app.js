const SPREADSHEET_ID = "1Bf1pOOSn-nCrGlalyHqA8u6End_0iVsv10Na-AI42v0";

function loadPlayers() {
  const url =
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq` +
    `?tqx=out:json&sheet=players`;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47, text.length - 2));
      const rows = json.table.rows;

      const select = document.getElementById("playerSelect");
      select.innerHTML = `<option value="">Seleccionar jugador</option>`;

      rows.forEach(row => {
        const sheetName = row.c[0]?.v;
        const id = row.c[1]?.v;
        const name = row.c[2]?.v;

        if (!sheetName || !name) return;

        const option = document.createElement("option");
        option.value = sheetName;
        option.textContent = name;

        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error cargando jugadores:", err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPlayers();

  const select = document.getElementById("playerSelect");
  const button = document.getElementById("viewPlayerBtn");

  select.addEventListener("change", () => {
    button.disabled = !select.value;
  });

  button.addEventListener("click", () => {
    const sheetName = select.value;
    if (!sheetName) return;

    window.location.href = `player.html?player=${encodeURIComponent(sheetName)}`;
  });
});

// PASO 1: leer parámetro ?player=
const params = new URLSearchParams(window.location.search);
const sheetName = params.get("player");

// Debug visual
const title = document.getElementById("playerName");
const debug = document.getElementById("debug");

if (title && debug) {
  if (!sheetName) {
    title.textContent = "Jugador no especificado";
    debug.textContent = "❌ Falta parámetro ?player en la URL";
  } else {
    title.textContent = `Jugador: ${sheetName}`;
    debug.textContent = `✅ Parámetro player recibido:\n${sheetName}`;
  }
}


console.log("PLAYER PARAM:", sheetName);