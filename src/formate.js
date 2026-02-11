export function formatNOK(value){
  const v = Number(value);
  if(!Number.isFinite(v)) return "–";
  return v.toLocaleString("nb-NO", { style:"currency", currency:"NOK", maximumFractionDigits: 0 });
}

export function formatPct(value){
  const v = Number(value);
  if(!Number.isFinite(v)) return "–";
  return `${v.toLocaleString("nb-NO", { maximumFractionDigits: 2 })} %`;
}

export function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

export function round2(n){
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
