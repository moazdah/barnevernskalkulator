import { round2 } from "./format.js";

/**
 * Bemanning:
 * - 1 ansatt per ungdom på vakt samtidig (staffPerYouth)
 * - Turnusfaktor = cycleDays / workDays
 * - For å dekke én posisjon over tid: headcount = positions * turnusFactor
 *
 * Nattevakt:
 * - enten fast antall nattevakter per natt, eller ratio per ungdom
 * - nattevakter dekking med nightCoverageFactor (typisk lik turnusFactor i samme turnuslogikk)
 */

export function calcTurnusFactor(state){
  const cycle = Math.max(1, Number(state.turnusCycleDays));
  const work = Math.max(1, Number(state.turnusWorkDays));
  return cycle / work;
}

export function calcNightPositions(state){
  const y = Math.max(0, Number(state.youthCount));
  if(state.nightMode === "fixed"){
    return Math.max(0, Number(state.nightFixedPerNight));
  }
  const ratio = Math.max(1, Number(state.nightPerYouthRatio));
  return Math.ceil(y / ratio);
}

export function calcStaffing(state){
  const youth = Math.max(0, Number(state.youthCount));
  const staffPerYouth = Math.max(0, Number(state.staffPerYouth));

  const positionsDay = youth * staffPerYouth;
  const turnusFactor = calcTurnusFactor(state);

  const headcountDay = positionsDay * turnusFactor;

  const positionsNight = calcNightPositions(state);
  const nightCoverageFactor = Math.max(1, Number(state.nightCoverageFactor));
  const headcountNight = positionsNight * nightCoverageFactor;

  return {
    positionsDay,
    headcountDay,
    positionsNight,
    headcountNight,
    turnusFactor
  };
}

export function calcPayrollMonthly(state){
  const s = calcStaffing(state);

  const dayAnnual = Math.max(0, Number(state.salaryDayAnnual));
  const nightAnnual = Math.max(0, Number(state.salaryNightAnnual));

  const baseAnnual =
    s.headcountDay * dayAnnual +
    s.headcountNight * nightAnnual;

  const baseMonthly = baseAnnual / 12;

  const holidayPct = Math.max(0, Number(state.holidayPayPct)) / 100;
  const employerTaxPct = Math.max(0, Number(state.employerTaxPct)) / 100;
  const otpPct = Math.max(0, Number(state.otpPct)) / 100;
  const otherSocialPct = Math.max(0, Number(state.otherSocialPct)) / 100;

  // Feriepenger beregnes av lønn. Arbeidsgiveravgift beregnes av både lønn og feriepenger.
  const holidayMonthly = baseMonthly * holidayPct;

  const otpMonthly = baseMonthly * otpPct;
  const otherSocialMonthly = baseMonthly * otherSocialPct;

  const employerTaxBase = baseMonthly + holidayMonthly + otpMonthly + otherSocialMonthly;
  const employerTaxMonthly = employerTaxBase * employerTaxPct;

  const totalMonthly = baseMonthly + holidayMonthly + otpMonthly + otherSocialMonthly + employerTaxMonthly;

  return {
    staffing: s,
    baseMonthly,
    holidayMonthly,
    otpMonthly,
    otherSocialMonthly,
    employerTaxMonthly,
    totalMonthly,
  };
}

export function calcOpsCostsMonthly(state){
  const youth = Math.max(0, Number(state.youthCount));
  const rent = Math.max(0, Number(state.rentMonthly));
  const food = Math.max(0, Number(state.foodPerYouthMonthly)) * youth;
  const car = Math.max(0, Number(state.carMonthly));
  const utilities = Math.max(0, Number(state.utilitiesMonthly));
  const otherOps = Math.max(0, Number(state.otherOpsMonthly));

  return {
    rent, food, car, utilities, otherOps,
    total: rent + food + car + utilities + otherOps
  };
}

export function calcRevenueMonthly(state){
  const youth = Math.max(0, Number(state.youthCount));
  const rate = Math.max(0, Number(state.publicRatePerYouthMonthly));
  const addon = Math.max(0, Number(state.addOnRatePerYouthMonthly));
  const grants = Math.max(0, Number(state.grantsMonthly));

  const perYouth = rate + addon;
  const revenue = youth * perYouth + grants;

  return { perYouth, grants, revenue };
}

export function calcMonthlySnapshot(state){
  const payroll = calcPayrollMonthly(state);
  const ops = calcOpsCostsMonthly(state);
  const rev = calcRevenueMonthly(state);

  const totalCosts = payroll.totalMonthly + ops.total;
  const operatingResult = rev.revenue - totalCosts;

  const contributionMargin = rev.revenue > 0 ? (rev.revenue - payroll.totalMonthly) / rev.revenue : 0; // enkel modell
  const profitMargin = rev.revenue > 0 ? operatingResult / rev.revenue : 0;

  return {
    payroll, ops, rev,
    totalCosts,
    operatingResult,
    contributionMargin,
    profitMargin
  };
}

/**
 * Likviditet og prognose:
 * - Vi modellerer AR og AP som funksjon av dager.
 * - CashFlow ~ resultat (enkelt) men med tidsforskyvning mellom innbetaling og utbetaling.
 */
export function buildForecast(state){
  const months = Math.max(6, Number(state.forecastMonths));
  const receivableDays = Math.max(0, Number(state.receivableDays));
  const payableDays = Math.max(0, Number(state.payableDays));

  const snap = calcMonthlySnapshot(state);

  const monthlyRevenue = snap.rev.revenue;
  const monthlyCosts = snap.totalCosts;

  const arFactor = receivableDays / 30;
  const apFactor = payableDays / 30;

  let cash = Math.max(0, Number(state.startingCash));

  const rows = [];
  for(let i=1;i<=months;i++){
    // AR og AP estimert ved slutten av måneden
    const accountsReceivable = monthlyRevenue * arFactor;
    const accountsPayable = monthlyCosts * apFactor;

    // Kontantstrøm (enkelt):
    // Innbetaling = revenue som ble fakturert for (1/arFactor) måneder siden.
    // Utbetaling = kostnader med forsinkelse apFactor.
    // For enkelhet: vi bruker en glatting som nærmer seg disse faktorene.
    const cashIn = monthlyRevenue / Math.max(1, arFactor);
    const cashOut = monthlyCosts / Math.max(1, apFactor);

    const netCashFlow = cashIn - cashOut;
    cash = cash + netCashFlow;

    const liquidityRatio = accountsPayable > 0 ? (cash + accountsReceivable) / accountsPayable : null;

    rows.push({
      month: i,
      revenue: monthlyRevenue,
      costs: monthlyCosts,
      operatingResult: monthlyRevenue - monthlyCosts,
      cash,
      accountsReceivable,
      accountsPayable,
      liquidityRatio
    });
  }

  const annualRevenue = monthlyRevenue * 12;
  const annualCosts = monthlyCosts * 12;
  const annualResult = annualRevenue - annualCosts;

  return {
    snapshot: snap,
    rows,
    annual: { revenue: annualRevenue, costs: annualCosts, result: annualResult }
  };
}

export function calcKPIs(state){
  const forecast = buildForecast(state);
  const snap = forecast.snapshot;

  const annualRevenue = forecast.annual.revenue;
  const annualResult = forecast.annual.result;

  const last = forecast.rows[forecast.rows.length - 1];

  const dekningsgrad = snap.rev.revenue > 0
    ? (snap.rev.revenue - (snap.ops.total)) / snap.rev.revenue
    : 0;

  const likviditetsgrad = last.liquidityRatio;

  return {
    staffing: snap.payroll.staffing,
    monthlyRevenue: snap.rev.revenue,
    monthlyCosts: snap.totalCosts,
    monthlyResult: snap.operatingResult,
    annualRevenue,
    annualResult,
    contributionMarginPct: round2(snap.contributionMargin * 100),
    dekningsgradPct: round2(dekningsgrad * 100),
    profitMarginPct: round2(snap.profitMargin * 100),
    liquidityRatio: likviditetsgrad ? round2(likviditetsgrad) : null,
    endingCash: last.cash,
    forecast
  };
}
