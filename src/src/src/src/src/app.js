import {
  loadState, saveState, resetState,
  loadScenarios, saveScenarios,
  exportJSON, importJSON
} from "./state.js";

import { bindTabs, mapInputs, renderKPIs, renderMonthlyTable, renderSources } from "./ui.js";
import { calcKPIs } from "./calc.js";
import { renderCharts } from "./charts.js";

let state = loadState();
let scenarios = loadScenarios();

bindTabs();
renderSources();

function recomputeAndRender(){
  const kpis = calcKPIs(state);
  renderKPIs(kpis);
  renderMonthlyTable(kpis.forecast);
  renderCharts(kpis.forecast);
}

function setState(next){
  state = next;
  saveState(state);
  recomputeAndRender();
  renderScenarioList();
}

mapInputs(state, setState);
recomputeAndRender();

// Export / import / reset
document.getElementById("btnExport").addEventListener("click", () => {
  const text = exportJSON(state, scenarios);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bn-omsorg-analyse.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("fileImport").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if(!file) return;
  const text = await file.text();
  try{
    const { state: importedState, scenarios: importedScenarios } = importJSON(text);
    state = importedState;
    scenarios = importedScenarios;
    saveState(state);
    saveScenarios(scenarios);

    // force reload of inputs by reloading the page
    location.reload();
  }catch(err){
    alert(`Kunne ikke importere: ${err?.message || err}`);
  }
});

document.getElementById("btnReset").addEventListener("click", () => {
  if(!confirm("Nullstill alle inndata og scenarioer i denne nettleseren?")) return;
  resetState();
  saveScenarios([]);
  location.reload();
});

// Scenarioer
function renderScenarioList(){
  const el = document.getElementById("scenarioList");
  el.innerHTML = "";
  if(!scenarios.length){
    el.innerHTML = `<div class="muted small">Ingen lagrede scenarioer.</div>`;
    return;
  }

  for(const s of scenarios){
    const item = document.createElement("div");
    item.className = "scenarioItem";

    const left = document.createElement("div");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = s.name;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Ungdom: ${s.state.youthCount}. Lønn døgn: ${Math.round(s.state.salaryDayAnnual).toLocaleString("nb-NO")} kr. Sats: ${Math.round(s.state.publicRatePerYouthMonthly).toLocaleString("nb-NO")} kr/mnd.`;

    left.appendChild(name);
    left.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const btnLoad = document.createElement("button");
    btnLoad.className = "btn btn--ghost";
    btnLoad.textContent = "Last";
    btnLoad.addEventListener("click", () => {
      state = { ...state, ...s.state };
      saveState(state);
      location.reload();
    });

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn btn--danger";
    btnDelete.textContent = "Slett";
    btnDelete.addEventListener("click", () => {
      scenarios = scenarios.filter(x => x.id !== s.id);
      saveScenarios(scenarios);
      renderScenarioList();
    });

    actions.appendChild(btnLoad);
    actions.appendChild(btnDelete);

    item.appendChild(left);
    item.appendChild(actions);

    el.appendChild(item);
  }
}

function uid(){
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

document.getElementById("btnSaveScenario").addEventListener("click", () => {
  const name = (document.getElementById("scenarioName").value || "").trim();
  if(!name){
    alert("Skriv et scenario navn.");
    return;
  }
  scenarios.unshift({ id: uid(), name, createdAt: new Date().toISOString(), state });
  saveScenarios(scenarios);
  document.getElementById("scenarioName").value = "";
  renderScenarioList();
});

document.getElementById("btnDuplicateScenario").addEventListener("click", () => {
  const name = (document.getElementById("scenarioName").value || "").trim() || "Duplikat";
  scenarios.unshift({ id: uid(), name, createdAt: new Date().toISOString(), state: { ...state } });
  saveScenarios(scenarios);
  document.getElementById("scenarioName").value = "";
  renderScenarioList();
});

renderScenarioList();
