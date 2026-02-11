const STORAGE_KEY = "bn-omsorg-analyse:v1";
const SCENARIOS_KEY = "bn-omsorg-analyse:scenarios:v1";

export function defaultState(){
  return {
    youthCount: 4,
    staffPerYouth: 1.0,

    turnusModel: "3747",
    turnusCycleDays: 21,
    turnusWorkDays: 7,

    nightMode: "fixed",
    nightFixedPerNight: 1,
    nightPerYouthRatio: 4, // 1 nattevakt per 4 ungdom
    nightCoverageFactor: 3.0,

    salaryDayAnnual: 620000,
    salaryNightAnnual: 300000,

    employerTaxPct: 14.1,
    otpPct: 2.0,
    holidayPayPct: 12.0,
    otherSocialPct: 0.0,

    rentMonthly: 35000,
    foodPerYouthMonthly: 6000,
    carMonthly: 15000,
    utilitiesMonthly: 15000,
    otherOpsMonthly: 10000,

    publicRatePerYouthMonthly: 197225,
    addOnRatePerYouthMonthly: 0,
    grantsMonthly: 0,

    startingCash: 500000,
    targetCashBufferMonths: 2.0,
    receivableDays: 30,
    payableDays: 30,
    forecastMonths: 24,
  };
}

export function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  }catch{
    return defaultState();
  }
}

export function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(){
  localStorage.removeItem(STORAGE_KEY);
}

export function loadScenarios(){
  try{
    const raw = localStorage.getItem(SCENARIOS_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }catch{
    return [];
  }
}

export function saveScenarios(list){
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(list));
}

export function exportJSON(state, scenarios){
  return JSON.stringify({ state, scenarios, exportedAt: new Date().toISOString() }, null, 2);
}

export function importJSON(text){
  const parsed = JSON.parse(text);
  if(!parsed || typeof parsed !== "object") throw new Error("Ugyldig fil");
  return {
    state: { ...defaultState(), ...(parsed.state || {}) },
    scenarios: Array.isArray(parsed.scenarios) ? parsed.scenarios : [],
  };
}
