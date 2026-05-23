/**
 * GridVibe Charts Manager
 * Handles premium Chart.js instantiation, gradient generations, and responsive redrawing.
 */

// Local chart references to prevent overlapping instances
let activeCharts = {
  line: null,
  donut: null,
  bar: null
};

// Listen for global data update events from the controller
window.addEventListener('gridvibe-data-updated', (event) => {
  const { data, xCol, yCol, theme, tokens } = event.detail;
  
  if (!data || data.length === 0 || !xCol || !yCol) return;

  // Prepare chart datasets
  const labels = data.map(row => String(row[xCol] !== undefined ? row[xCol] : ''));
  const rawValues = data.map(row => {
    let val = row[yCol];
    if (val !== undefined && val !== null) {
      if (typeof val === 'string') {
        val = parseFloat(val.replace(/[\$,%,원,건,\s]/g, ''));
      }
      return parseFloat(val);
    }
    return 0;
  });
  
  const values = rawValues.map(v => isNaN(v) ? 0 : v);

  // Redraw widgets
  renderLineChart(labels, values, tokens, yCol);
  renderDonutChart(labels, values, tokens);
  renderBarChart(labels, values, tokens);
});

/**
 * Render Large Area Line Spline Chart
 */
function renderLineChart(labels, values, tokens, yLabel) {
  const canvas = document.getElementById('mainLineChart');
  if (!canvas) return;

  // Destroy previous line chart if active
  if (activeCharts.line) {
    activeCharts.line.destroy();
  }

  const ctx = canvas.getContext('2d');
  
  // Create beautiful visual gradient glow below line
  const areaGradient = ctx.createLinearGradient(0, 0, 0, 300);
  areaGradient.addColorStop(0, tokens.primary + '55'); // 33% opacity
  areaGradient.addColorStop(0.5, tokens.primary + '1a'); // 10% opacity
  areaGradient.addColorStop(1, tokens.primary + '00'); // 0% opacity

  const config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: yLabel,
        data: values,
        borderColor: tokens.primary,
        borderWidth: 3,
        pointBackgroundColor: tokens.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: tokens.secondary,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        backgroundColor: areaGradient,
        fill: true,
        tension: 0.38, // Smooth curves
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Mute legend, layout is clean
        },
        tooltip: {
          backgroundColor: tokens.panelBg,
          titleColor: tokens.textMain,
          bodyColor: tokens.textMain,
          borderColor: tokens.cardBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          callbacks: {
            label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: tokens.gridLine,
            drawBorder: false
          },
          ticks: {
            color: tokens.textMuted,
            font: {
              family: 'Inter',
              size: 11
            },
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          grid: {
            color: tokens.gridLine,
            drawBorder: false
          },
          ticks: {
            color: tokens.textMuted,
            font: {
              family: 'Inter',
              size: 11
            },
            callback: (val) => val.toLocaleString()
          }
        }
      }
    }
  };

  activeCharts.line = new Chart(ctx, config);
}

/**
 * Render Segment Donut Distribution Chart (Top 5 categories)
 */
function renderDonutChart(labels, values, tokens) {
  const canvas = document.getElementById('subDonutChart');
  if (!canvas) return;

  if (activeCharts.donut) {
    activeCharts.donut.destroy();
  }

  const sliceLabels = labels;
  const sliceValues = values;

  const ctx = canvas.getContext('2d');
  
  const basePalette = [
    tokens.primary,
    tokens.secondary,
    '#3b82f6',
    '#f59e0b',
    '#10b981',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f43f5e',
    '#84cc16'
  ];
  const colorPalette = labels.map((_, i) => basePalette[i % basePalette.length]);

  const config = {
    type: 'doughnut',
    data: {
      labels: sliceLabels,
      datasets: [{
        data: sliceValues,
        backgroundColor: colorPalette,
        borderWidth: 2,
        borderColor: tokens.panelBg,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%', // Thin elegant ring layout
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: tokens.textMain,
            boxWidth: 10,
            boxHeight: 10,
            padding: 12,
            font: {
              family: 'Inter',
              size: 11,
              weight: '500'
            }
          }
        },
        tooltip: {
          backgroundColor: tokens.panelBg,
          titleColor: tokens.textMain,
          bodyColor: tokens.textMain,
          borderColor: tokens.cardBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8
        }
      }
    }
  };

  activeCharts.donut = new Chart(ctx, config);
}

/**
 * Render Bar comparison chart (Top 7 rows)
 */
function renderBarChart(labels, values, tokens) {
  const canvas = document.getElementById('subBarChart');
  if (!canvas) return;

  if (activeCharts.bar) {
    activeCharts.bar.destroy();
  }

  const barLabels = labels;
  const barValues = values;

  const ctx = canvas.getContext('2d');

  // Gradient fill for bar curves
  const barGradient = ctx.createLinearGradient(0, 0, 0, 200);
  barGradient.addColorStop(0, tokens.secondary);
  barGradient.addColorStop(1, tokens.secondary + '40'); // Transparent glow

  const config = {
    type: 'bar',
    data: {
      labels: barLabels,
      datasets: [{
        data: barValues,
        backgroundColor: barGradient,
        borderRadius: 6, // Premium rounded bar top corners
        borderWidth: 0,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: tokens.panelBg,
          titleColor: tokens.textMain,
          bodyColor: tokens.textMain,
          borderColor: tokens.cardBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: tokens.textMuted,
            font: {
              family: 'Inter',
              size: 10
            }
          }
        },
        y: {
          grid: {
            color: tokens.gridLine,
            drawBorder: false
          },
          ticks: {
            color: tokens.textMuted,
            font: {
              family: 'Inter',
              size: 10
            }
          }
        }
      }
    }
  };

  activeCharts.bar = new Chart(ctx, config);
}
