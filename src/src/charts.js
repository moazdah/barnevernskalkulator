import { formatNOK } from "./format.js";

let chartRevenueCosts = null;
let chartCash = null;
let chartMargin = null;

function destroyIf(chart){
  if(chart && typeof chart.destroy === "function") chart.destroy();
}

export function renderCharts(forecast){
  const labels = forecast.rows.map(r => `M${r.month}`);
  const revenue = forecast.rows.map(r => r.revenue);
  const costs = forecast.rows.map(r => r.costs);
  const cash = forecast.rows.map(r => r.cash);
  const margin = forecast.rows.map(r => r.revenue > 0 ? (r.operatingResult / r.revenue) * 100 : 0);

  destroyIf(chartRevenueCosts);
  destroyIf(chartCash);
  destroyIf(chartMargin);

  const ctx1 = document.getElementById("chartRevenueCosts");
  const ctx2 = document.getElementById("chartCash");
  const ctx3 = document.getElementById("chartMargin");

  chartRevenueCosts = new Chart(ctx1, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Inntekter", data: revenue, tension: 0.25 },
        { label: "Kostnader", data: costs, tension: 0.25 },
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatNOK(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        y: { ticks: { callback: (v) => formatNOK(v) } }
      }
    }
  });

  chartCash = new Chart(ctx2, {
    type: "line",
    data: { labels, datasets: [{ label: "Kontanter", data: cash, tension: 0.25 }] },
    options: {
      responsive: true,
      plugins: {
        tooltip: { callbacks: { label: (ctx) => `${formatNOK(ctx.parsed.y)}` } }
      },
      scales: { y: { ticks: { callback: (v) => formatNOK(v) } } }
    }
  });

  chartMargin = new Chart(ctx3, {
    type: "line",
    data: { labels, datasets: [{ label: "Resultatmargin (%)", data: margin, tension: 0.25 }] },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: (v) => `${v}%` } } }
    }
  });
}
