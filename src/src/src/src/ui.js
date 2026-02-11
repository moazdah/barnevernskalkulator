import { formatNOK, formatPct } from "./format.js";
import { calcTurnusFactor } from "./calc.js";
import { SOURCES } from "./sources.js";

export function bindTabs(){
  const tabs = document.querySelectorAll(".tab");
  const panels = {
    inputs: document.getElementById("tab-inputs"),
    results: document.getElementById("tab-results"),
    scenarios: document.getElementById("tab-scenarios"),
    sources: document.getElementById("tab-sources"),
  };

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      Object.values(panels).forEach(p => p.classList.add("is-hidden"));
      panels[btn.dataset.tab].classList.remove("is-hidden");
    });
  });
}

export function renderSources(){
  const el = document.getElementById("sourcesList");
  el.innerHTML = "";

  const list = document.createElement("div");
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.style.gap = "12px";

  for(const s of SOURCES){
    const card = document.createElement("div");
    card.className = "scenarioItem";
    card.style.alignItems = "flex-start";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "name";
    title.textContent = s.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${s.publisher}. ${s.note}`;

    const link = document.createElement("a");
    link.href = s.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Åpne kilde";
    link.className = "btn btn--ghost";
    link.style.textDecoration = "none";
    link.style.display = "inline-block";
    link.style.marginTop = "10px";

    left.appendChild(title);
    left.appendChild(meta);
    left.appendChild(link);

    card.appendChild(left);
    list.appendChild(card);
  }
  el.appendChild(list);
}

export function mapInputs(state, onChange){
  const ids = [
    "youthCount","staffPerYouth",
    "turnusModel","turnusCycleDays","turnusWorkDays","turnusFactor",
    "nightMode","nightFixedPerNight","nightPerYouthRatio","nightCoverageFactor",
    "salaryDayAnnual","salaryNightAnnual",
    "employerTaxPct","otpPct","holidayPayPct","otherSocialPct",
    "rentMonthly","foodPerYouthMonthly","carMonthly","utilitiesMonthly","otherOpsMonthly",
    "publicRatePerYouthMonthly","addOnRatePerYouthMonthly","grantsMonthly",
    "startingCash","targetCashBufferMonths","receivableDays","payableDays","forecastMonths",
  ];

  const els = {};
  for(const id of ids) els[id] = document.getElementById(id);

  // init values
  els.youthCount.value = state.youthCount;
  els.staffPerYouth.value = state.staffPerYouth;

  els.turnusModel.value = state.turnusModel;
  els.turnusCycleDays.value = state.turnusCycleDays;
  els.turnusWorkDays.value = state.turnusWorkDays;

  els.nightMode.value = state.nightMode;
  els.nightFixedPerNight.value = state.nightFixedPerNight;
  els.nightPerYouthRatio.value = state.nightPerYouthRatio;
  els.nightCoverageFactor.value = state.nightCoverageFactor;

  els.salaryDayAnnual.value = state.salaryDayAnnual;
  els.salaryNightAnnual.value = state.salaryNightAnnual;

  els.employerTaxPct.value = state.employerTaxPct;
  els.otpPct.value = state.otpPct;
  els.holidayPayPct.value = state.holidayPayPct;
  els.otherSocialPct.value = state.otherSocialPct;

  els.rentMonthly.value = state.rentMonthly;
  els.foodPerYouthMonthly.value = state.foodPerYouthMonthly;
  els.carMonthly.value = state.carMonthly;
  els.utilitiesMonthly.value = state.utilitiesMonthly;
  els.otherOpsMonthly.value = state.otherOpsMonthly;

  els.publicRatePerYouthMonthly.value = state.publicRatePerYouthMonthly;
  els.addOnRatePerYouthMonthly.value = state.addOnRatePerYouthMonthly;
  els.grantsMonthly.value = state.grantsMonthly;

  els.startingCash.value = state.startingCash;
  els.targetCashBufferMonths.value = state.targetCashBufferMonths;
  els.receivableDays.value = state.receivableDays;
  els.payableDays.value = state.payableDays;
  els.forecastMonths.value = state.forecastMonths;

  function refreshTurnusUI(){
    if(els.turnusModel.value === "3747"){
      els.turnusCycleDays.value = 21;
      els.turnusWorkDays.value = 7;
      els.turnusCycleDays.disabled = true;
      els.turnusWorkDays.disabled = true;
    }else{
      els.turnusCycleDays.disabled = false;
      els.turnusWorkDays.disabled = false;
    }
  }

  function writeTurnusFactor(){
    const temp = {
      turnusCycleDays: Number(els.turnusCycleDays.value),
      turnusWorkDays: Number(els.turnusWorkDays.value),
    };
    els.turnusFactor.value = calcTurnusFactor(temp).toFixed(2);
  }

  refreshTurnusUI();
  writeTurnusFactor();

  function handler(){
    const next = {
      ...state,
      youthCount: Number(els.youthCount.value),
      staffPerYouth: Number(els.staffPerYouth.value),

      turnusModel: els.turnusModel.value,
      turnusCycleDays: Number(els.turnusCycleDays.value),
      turnusWorkDays: Number(els.turnusWorkDays.value),

      nightMode: els.nightMode.value,
      nightFixedPerNight: Number(els.nightFixedPerNight.value),
      nightPerYouthRatio: Number(els.nightPerYouthRatio.value),
      nightCoverageFactor: Number(els.nightCoverageFactor.value),

      salaryDayAnnual: Number(els.salaryDayAnnual.value),
      salaryNightAnnual: Number(els.salaryNightAnnual.value),

      employerTaxPct: Number(els.employerTaxPct.value),
      otpPct: Number(els.otpPct.value),
      holidayPayPct: Number(els.holidayPayPct.value),
      otherSocialPct: Number(els.otherSocialPct.value),

      rentMonthly: Number(els.rentMonthly.value),
      foodPerYouthMonthly: Number(els.foodPerYouthMonthly.value),
      carMonthly: Number(els.carMonthly.value),
      utilitiesMonthly: Number(els.utilitiesMonthly.value),
      otherOpsMonthly: Number(els.otherOpsMonthly.value),

      publicRatePerYouthMonthly: Number(els.publicRatePerYouthMonthly.value),
      addOnRatePerYouthMonthly: Number(els.addOnRatePerYouthMonthly.value),
      grantsMonthly: Number(els.grantsMonthly.value),

      startingCash: Number(els.startingCash.value),
      targetCashBufferMonths: Number(els.targetCashBufferMonths.value),
      receivableDays: Number(els.receivableDays.value),
      payableDays: Number(els.payableDays.value),
      forecastMonths: Number(els.forecastMonths.value),
    };

    refreshTurnusUI();
    writeTurnusFactor();
    onChange(next);
  }

  Object.values(els).forEach(el => {
    if(!el) return;
    if(el.id === "turnusFactor") return;
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });

  return { els };
}

export function renderKPIs(kpis){
  const el = document.getElementById("kpiGrid");
  el.innerHTML = "";

  const items = [
    { label: "Månedlig omsetning", value: formatNOK(kpis.monthlyRevenue), sub: "Inntekter per måned" },
    { label: "Månedlige kostnader", value: formatNOK(kpis.monthlyCosts), sub: "Lønn + drift" },
    { label: "Månedlig driftsresultat", value: formatNOK(kpis.monthlyResult), sub: "Før finans og skatt" },

    { label: "Årlig omsetning", value: formatNOK(kpis.annualRevenue), sub: "12 måneder" },
    { label: "Årlig resultat", value: formatNOK(kpis.annualResult), sub: "12 måneder" },
    { label: "Resultatmargin", value: formatPct(kpis.profitMarginPct), sub: "Resultat / omsetning" },

    { label: "Dekningsgrad", value: formatPct(kpis.dekningsgradPct), sub: "Forenklet modell" },
    { label: "Bidragsmargin", value: formatPct(kpis.contributionMarginPct), sub: "Forenklet modell" },
    { label: "Likviditetsgrad", value: (kpis.liquidityRatio ?? "–"), sub: "Basert på cash, AR, AP" },

    { label: "Kontanter ved slutt", value: formatNOK(kpis.endingCash), sub: "Slutten av prognosen" },
    { label: "Døgnansatte (beregnet)", value: kpis.staffing.headcountDay.toFixed(2), sub: "Hodeantall estimat" },
    { label: "Nattevakter (beregnet)", value: kpis.staffing.headcountNight.toFixed(2), sub: "Hodeantall estimat" },
  ];

  for(const it of items){
    const card = document.createElement("div");
    card.className = "kpi";
    const a = document.createElement("div");
    a.className = "label";
    a.textContent = it.label;
    const b = document.createElement("div");
    b.className = "value";
    b.textContent = it.value;
    const c = document.createElement("div");
    c.className = "sub";
    c.textContent = it.sub;

    card.appendChild(a);
    card.appendChild(b);
    card.appendChild(c);
    el.appendChild(card);
  }
}

export function renderMonthlyTable(forecast){
  const tbody = document.querySelector("#monthlyTable tbody");
  tbody.innerHTML = "";

  for(const r of forecast.rows){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>M${r.month}</td>
      <td>${formatNOK(r.revenue)}</td>
      <td>${formatNOK(r.costs)}</td>
      <td>${formatNOK(r.operatingResult)}</td>
      <td>${formatNOK(r.cash)}</td>
    `;
    tbody.appendChild(tr);
  }
}
