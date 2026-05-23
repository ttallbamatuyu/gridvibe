/**
 * GridVibe - Single Self-Contained Premium Application Controller
 * Robust, CORS-free architecture fully compatible with local file:// protocol.
 * Integrates 5 Major Commercial Upgrades:
 *  1. Multi-Dataset Charting & Layout Swappers
 *  2. Paywall Engine with Mock Toss/KakaoPay Checkout Portals (Keypad authentication)
 *  3. A4 Vector PDF printing & Base64 Logo Uploader
 *  4. Mock Notion Database Live Sync Simulator
 *  5. Vanilla JS Grid Layout controller Menu
 */

// ==========================================================================
// 1. THEME MANAGER SECTION
// ==========================================================================
const THEMES = {
  MIDNIGHT: 'midnight',
  LIGHT: 'light',
  CYBER: 'cyber'
};

let currentTheme = THEMES.LIGHT;
const themeCallbacks = [];

// Global Application State Controller
let state = {
  title: 'Premium Analytics Dashboard',
  theme: THEMES.LIGHT,
  dataSourceType: 'csv',
  sheetUrl: '',
  mappings: { x: '', y: [] },
  widgets: {
    kpis: true,
    lineChart: true,
    barChart: true,
    donutChart: true,
    table: true
  },
  mainChartType: 'line',
  widgetOrder: [],
  logoBase64: '',
  isPro: false,
  checkoutStage: 'plan',
  checkoutPin: '',
  selectedPlan: 'PRO',
  activeFilter: null // Used for drill-down interactivity
};

// ==========================================================================
// 1.5. LOCAL STORAGE SAVE & LOAD
// ==========================================================================
function saveStateToLocal() {
  if (state.csvData && state.csvData.length > 0) {
    const grid = document.getElementById('dashboard-active-content');
    const chartsRow = document.getElementById('charts-row-container') || document.querySelector('.charts-row');
    if (grid) {
      state.widgetOrder = Array.from(grid.children).map(c => c.id || 'charts-row-container').filter(Boolean);
    }
    if (chartsRow) {
      state.chartsOrder = Array.from(chartsRow.children).map(c => c.id).filter(Boolean);
    }
    localStorage.setItem('gridvibe_state', JSON.stringify(state));
  }
}

function loadStateFromLocal() {
  const saved = localStorage.getItem('gridvibe_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.csvData && parsed.csvData.length > 0) {
        state = { ...state, ...parsed };
        
        // Restore layout order
        const grid = document.getElementById('dashboard-active-content');
        if (grid && state.widgetOrder) {
          state.widgetOrder.forEach(id => {
            const el = id === 'charts-row-container' ? (document.getElementById('charts-row-container') || document.querySelector('.charts-row')) : document.getElementById(id);
            if (el) grid.appendChild(el);
          });
        }
        const chartsRow = document.getElementById('charts-row-container') || document.querySelector('.charts-row');
        if (chartsRow && state.chartsOrder) {
          state.chartsOrder.forEach(id => {
            const el = document.getElementById(id);
            if (el) chartsRow.appendChild(el);
          });
        }
        
        // Restore chart tab UI
        document.querySelectorAll('.chart-tab').forEach(btn => {
          btn.classList.remove('active');
          btn.style.background = 'transparent';
          btn.style.color = 'var(--text-muted)';
          btn.style.border = '1px solid var(--card-border)';
          if (btn.dataset.type === state.mainChartType) {
            btn.classList.add('active');
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'white';
            btn.style.border = 'none';
          }
        });
        
        if (state.csvData && state.columns) {
          document.getElementById('dashboard-empty-state').classList.add('hidden');
          document.getElementById('dashboard-active-content').classList.remove('hidden');
          onMappingUpdate();
        }
        return true;
      }
    } catch(e) {
      console.error('Failed to parse state', e);
    }
  }
  return false;
}

function initTheme() {
  const savedTheme = localStorage.getItem('gridvibe-theme');
  if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
    applyTheme(savedTheme);
  } else {
    applyTheme(THEMES.LIGHT);
  }
  setupThemeListeners();
}

function getCurrentTheme() {
  return currentTheme;
}

function onThemeChange(callback) {
  if (typeof callback === 'function') {
    themeCallbacks.push(callback);
  }
}

function applyTheme(theme) {
  if (!Object.values(THEMES).includes(theme)) return;
  currentTheme = theme;
  
  if (theme === THEMES.MIDNIGHT) {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  const options = document.querySelectorAll('.theme-option');
  options.forEach(opt => {
    const optTheme = opt.getAttribute('data-theme');
    if (optTheme === theme || (theme === THEMES.MIDNIGHT && optTheme === 'midnight')) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  localStorage.setItem('gridvibe-theme', theme);

  themeCallbacks.forEach(cb => {
    try {
      cb(theme, getThemeColorTokens(theme));
    } catch (err) {
      console.error('Error in theme change callback:', err);
    }
  });
}

function setupThemeListeners() {
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const selectedTheme = opt.getAttribute('data-theme');
      applyTheme(selectedTheme);
    });
  });
}

function getThemeColorTokens(theme = currentTheme) {
  switch (theme) {
    case THEMES.LIGHT:
      return {
        background: '#f0f4f9',
        panelBg: 'rgba(255, 255, 255, 0.7)',
        textMain: '#1f2937',
        textMuted: '#6b7280',
        primary: '#6366f1',
        secondary: '#db2777',
        gridLine: 'rgba(31, 41, 55, 0.08)',
        cardBorder: 'rgba(209, 213, 219, 0.5)',
        glow: 'rgba(99, 102, 241, 0.15)'
      };
    case THEMES.CYBER:
      return {
        background: '#020704',
        panelBg: 'rgba(4, 28, 16, 0.7)',
        textMain: '#ecfdf5',
        textMuted: '#6ee7b7',
        primary: '#10b981',
        secondary: '#06b6d4',
        gridLine: 'rgba(16, 185, 129, 0.1)',
        cardBorder: 'rgba(16, 185, 129, 0.25)',
        glow: 'rgba(16, 185, 129, 0.3)'
      };
    case THEMES.MIDNIGHT:
    default:
      return {
        background: '#080c16',
        panelBg: 'rgba(13, 20, 38, 0.7)',
        textMain: '#f3f4f6',
        textMuted: '#9ca3af',
        primary: '#8b5cf6',
        secondary: '#ec4899',
        gridLine: 'rgba(255, 255, 255, 0.05)',
        cardBorder: 'rgba(43, 64, 116, 0.4)',
        glow: 'rgba(139, 92, 246, 0.25)'
      };
  }
}

// ==========================================================================
// 2. DATA PARSER SECTION
// ==========================================================================
function fetchAndParseGoogleSheet(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('URL이 입력되지 않았습니다.'));
      return;
    }
    if (!url.includes('docs.google.com/spreadsheets')) {
      reject(new Error('올바른 구글 시트 주소가 아닙니다. "웹에 게시(CSV)" 주소를 사용해 주세요.'));
      return;
    }
    let csvUrl = url;
    if (url.includes('/edit') && !url.includes('output=csv')) {
      csvUrl = url.replace(/\/edit(#gid=\d+)?$/, '/export?format=csv');
    }
    fetch(csvUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('구글 시트를 가져오는 데 실패했습니다. 링크가 전체 공개(웹에 게시)되어 있는지 확인해 주세요.');
        }
        return response.text();
      })
      .then(csvText => {
        parseCSVText(csvText, resolve, reject);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('파일이 선택되지 않았습니다.'));
      return;
    }
    if (typeof window.Papa === 'undefined') {
      reject(new Error('PapaParse 라이브러리가 로드되지 않았습니다.'));
      return;
    }
    window.Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error('CSV 파싱 에러: ' + results.errors[0].message));
          return;
        }
        const data = results.data;
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        resolve({ data, columns });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

function parseCSVText(csvText, resolve, reject) {
  if (typeof window.Papa === 'undefined') {
    reject(new Error('PapaParse 라이브러리가 로드되지 않았습니다.'));
    return;
  }
  window.Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: true,
    complete: (results) => {
      if (results.errors.length > 0 && results.data.length === 0) {
        reject(new Error('CSV 파싱 실패: ' + results.errors[0].message));
        return;
      }
      const data = results.data;
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      resolve({ data, columns });
    },
    error: (error) => {
      reject(error);
    }
  });
}

function getSampleData(type) {
  let data = [];
  if (type === 'revenue') {
    data = [
      { '날짜(Month)': '1월', '매출액(원)': 12000, '마케팅비(원)': 3200, '활성유저(MAU)': 1200, '신규유입': 230 },
      { '날짜(Month)': '2월', '매출액(원)': 14500, '마케팅비(원)': 3500, '활성유저(MAU)': 1550, '신규유입': 410 },
      { '날짜(Month)': '3월', '매출액(원)': 19000, '마케팅비(원)': 4800, '활성유저(MAU)': 2100, '신규유입': 580 },
      { '날짜(Month)': '4월', '매출액(원)': 18500, '마케팅비(원)': 4200, '활성유저(MAU)': 2450, '신규유입': 350 },
      { '날짜(Month)': '5월', '매출액(원)': 24000, '마케팅비(원)': 5500, '활성유저(MAU)': 3100, '신규유입': 690 },
      { '날짜(Month)': '6월', '매출액(원)': 29500, '마케팅비(원)': 6800, '활성유저(MAU)': 4200, '신규유입': 880 },
      { '날짜(Month)': '7월', '매출액(원)': 35000, '마케팅비(원)': 7500, '활성유저(MAU)': 5600, '신규유입': 1200 },
      { '날짜(Month)': '8월', '매출액(원)': 32000, '마케팅비(원)': 6900, '활성유저(MAU)': 6100, '신규유입': 910 },
      { '날짜(Month)': '9월', '매출액(원)': 38000, '마케팅비(원)': 8200, '활성유저(MAU)': 7200, '신규유입': 1350 },
      { '날짜(Month)': '10월', '매출액(원)': 45000, '마케팅비(원)': 9500, '활성유저(MAU)': 8900, '신규유입': 1800 },
      { '날짜(Month)': '11월', '매출액(원)': 52000, '마케팅비(원)': 11000, '활성유저(MAU)': 10500, '신규유입': 2100 },
      { '날짜(Month)': '12월', '매출액(원)': 68000, '마케팅비(원)': 14000, '활성유저(MAU)': 13000, '신규유입': 2950 }
    ];
  } else if (type === 'marketing') {
    data = [
      { '캠페인(Campaign)': '구글 검색 광고', '노출수': 125000, '클릭수': 4800, '전환수': 240, '비용(원)': 1800, 'ROAS(%)': 260 },
      { '캠페인(Campaign)': '인스타 피드 캠페인', '노출수': 280000, '클릭수': 9500, '전환수': 380, '비용(원)': 3200, 'ROAS(%)': 185 },
      { '캠페인(Campaign)': '유튜브 인스트림', '노출수': 450000, '클릭수': 12000, '전환수': 180, '비용(원)': 4500, 'ROAS(%)': 110 },
      { '캠페인(Campaign)': '리타겟팅 배너', '노출수': 85000, '클릭수': 3100, '전환수': 420, '비용(원)': 1200, 'ROAS(%)': 490 },
      { '캠페인(Campaign)': '틱톡 챌린지 광고', '노출수': 390000, '클릭수': 18500, '전환수': 210, '비용(원)': 2800, 'ROAS(%)': 150 },
      { '캠페인(Campaign)': '뉴스레터 스폰서십', '노출수': 25000, '클릭수': 1200, '전환수': 95, '비용(원)': 500, 'ROAS(%)': 380 },
      { '캠페인(Campaign)': '인플루언서 협찬', '노출수': 150000, '클릭수': 6400, '전환수': 310, '비용(원)': 2500, 'ROAS(%)': 220 }
    ];
  } else if (type === 'users') {
    data = [
      { '주간(Week)': 'W1', '신규가입': 350, '유료가입': 35, '이탈률(%)': 4.5, '고객문의': 22 },
      { '주간(Week)': 'W2', '신규가입': 410, '유료가입': 48, '이탈률(%)': 4.1, '고객문의': 28 },
      { '주간(Week)': 'W3', '신규가입': 480, '유료가입': 55, '이탈률(%)': 3.9, '고객문의': 34 },
      { '주간(Week)': 'W4', '신규가입': 520, '유료가입': 62, '이탈률(%)': 4.2, '고객문의': 31 },
      { '주간(Week)': 'W5', '신규가입': 600, '유료가입': 75, '이탈률(%)': 3.7, '고객문의': 40 },
      { '주간(Week)': 'W6', '신규가입': 680, '유료가입': 88, '이탈률(%)': 3.5, '고객문의': 45 },
      { '주간(Week)': 'W7', '신규가입': 750, '유료가입': 92, '이탈률(%)': 3.2, '고객문의': 38 },
      { '주간(Week)': 'W8', '신규가입': 890, '유료가입': 115, '이탈률(%)': 3.0, '고객문의': 52 }
    ];
  }
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  return { data, columns };
}

// ==========================================================================
// 3. CHARTS MANAGER SECTION (NEW UPGRADE: Multi-dataset & ChartTypes)
// ==========================================================================
let activeCharts = {
  main: null
};

function renderDashboardChartsDirect(data, xCol, yCols, theme, tokens, chartType = 'line') {
  const canvas = document.getElementById('mainLineChart');
  if (!canvas || !data || data.length === 0 || !xCol || yCols.length === 0) return;

  if (activeCharts.main) {
    activeCharts.main.destroy();
    activeCharts.main = null;
  }

  if (typeof window.Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const labels = data.map(row => String(row[xCol] !== undefined ? row[xCol] : ''));

  // Futuristic color arrays
  const palette = [
    tokens.primary,
    tokens.secondary,
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#06b6d4'
  ];

  // Construct multiple datasets (one for each Y column!)
  const datasets = yCols.map((yCol, idx) => {
    const color = palette[idx % palette.length];
    
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

    // Dynamic gradient under line curve
    const areaGradient = ctx.createLinearGradient(0, 0, 0, 300);
    areaGradient.addColorStop(0, color + '55');
    areaGradient.addColorStop(1, color + '00');

    // Build specific dataset structures depending on ChartType selector
    const ds = {
      label: yCol,
      data: values,
      borderColor: color,
      backgroundColor: chartType === 'line' ? areaGradient : color,
      borderWidth: 3,
      fill: chartType === 'line',
      tension: 0.38,
      pointBackgroundColor: color,
      pointBorderColor: '#ffffff',
      pointRadius: 4,
      pointHoverRadius: 7
    };

    if (chartType === 'bar' || chartType === 'horizontalBar') {
      ds.borderRadius = 6;
      ds.borderWidth = 0;
      ds.fill = false;
    }
    return ds;
  });

  // Determine standard orientation or radar layouts
  let actualType = chartType;
  if (chartType === 'horizontalBar') {
    actualType = 'bar'; // Horizontal is bar chart with indexAxis option
  }

  const config = {
    type: actualType,
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: chartType === 'horizontalBar' ? 'y' : 'x',
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: tokens.textMain,
            boxWidth: 12,
            boxHeight: 10,
            font: { family: 'Inter', size: 11, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: tokens.panelBg,
          titleColor: tokens.textMain,
          bodyColor: tokens.textMain,
          borderColor: tokens.cardBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          usePointStyle: true
        }
      },
      scales: actualType === 'radar' ? undefined : {
        x: {
          grid: { color: tokens.gridLine, drawBorder: false },
          ticks: { color: tokens.textMuted, font: { family: 'Inter', size: 10 } }
        },
        y: {
          grid: { color: tokens.gridLine, drawBorder: false },
          ticks: { color: tokens.textMuted, font: { family: 'Inter', size: 10 } }
        }
      },
      onClick: (e, elements) => {
        if (!elements || elements.length === 0) {
          // Clear filter on background click
          if (state.activeFilter) {
            state.activeFilter = null;
            showToast('필터가 해제되었습니다.', 'info');
            onMappingUpdate(); // Rerender full dashboard
          }
          return;
        }
        
        // Drill-down filter
        const index = elements[0].index;
        const clickedLabel = labels[index];
        if (clickedLabel !== state.activeFilter) {
          state.activeFilter = clickedLabel;
          showToast(`'${clickedLabel}' 데이터로 필터링 되었습니다.`, 'success');
          
          // Re-render table and subcharts using activeFilter
          tableCurrentPage = 1;
          renderDashboardTable();
          // Render donut just for the filtered value, or keep it but highlight
          const singleData = data.filter(r => String(r[xCol]) === clickedLabel);
          if (singleData.length > 0) {
             const val = singleData[0][yCols[0]];
             // For a single item, donut is 100%, but we still render it
             renderDonutChartLegacy([clickedLabel], [val], tokens, yCols[0]);
          }
        }
      }
    }
  };

  // Add specific radar styled configurations
  if (actualType === 'radar') {
    config.options.scales = {
      r: {
        grid: { color: tokens.gridLine },
        angleLines: { color: tokens.gridLine },
        pointLabels: { color: tokens.textMuted, font: { family: 'Inter', size: 10 } },
        ticks: { backdropColor: 'transparent', color: tokens.textMuted }
      }
    };
  }

  activeCharts.main = new window.Chart(ctx, config);
  
  // Also draw distribution donut chart with the first selected metric
  renderDonutChartLegacy(labels, datasets[0].data, tokens, yCols[0]);
}

function renderDonutChartLegacy(labels, values, tokens, yLabel) {
  const canvas = document.getElementById('subDonutChart');
  if (!canvas) return;

  const donutCanvas = activeCharts.donut;
  if (donutCanvas) {
    donutCanvas.destroy();
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

  activeCharts.donut = new window.Chart(ctx, {
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
      cutout: '65%',
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
  });
}

function bindEvents() {
  // --- Data Source Type Toggle ---
  const btnSheet = document.getElementById('btn-source-sheet');
  const btnCsv = document.getElementById('btn-source-csv');
  const btnNotion = document.getElementById('btn-source-notion');
  const sheetInputWrapper = document.getElementById('sheet-input-wrapper');
  const csvInputWrapper = document.getElementById('csv-input-wrapper');
  const notionInputWrapper = document.getElementById('notion-input-wrapper');

  if (btnSheet && btnCsv && btnNotion && sheetInputWrapper && csvInputWrapper && notionInputWrapper) {
    btnSheet.addEventListener('click', () => {
      btnSheet.classList.add('active');
      btnCsv.classList.remove('active');
      btnNotion.classList.remove('active');
      sheetInputWrapper.classList.remove('hidden');
      csvInputWrapper.classList.add('hidden');
      notionInputWrapper.classList.add('hidden');
      state.dataSourceType = 'sheet';
    });

    btnCsv.addEventListener('click', () => {
      btnCsv.classList.add('active');
      btnSheet.classList.remove('active');
      btnNotion.classList.remove('active');
      csvInputWrapper.classList.remove('hidden');
      sheetInputWrapper.classList.add('hidden');
      notionInputWrapper.classList.add('hidden');
      state.dataSourceType = 'csv';
    });

    btnNotion.addEventListener('click', () => {
      btnNotion.classList.add('active');
      btnSheet.classList.remove('active');
      btnCsv.classList.remove('active');
      notionInputWrapper.classList.remove('hidden');
      sheetInputWrapper.classList.add('hidden');
      csvInputWrapper.classList.add('hidden');
      state.dataSourceType = 'notion';
    });
  }

  // --- Fetch Google Sheet ---
  const sheetUrlInput = document.getElementById('sheet-url');
  const fetchSheetBtn = document.getElementById('btn-fetch-sheet');
  if (fetchSheetBtn && sheetUrlInput) {
    fetchSheetBtn.addEventListener('click', () => {
      const url = sheetUrlInput.value.trim();
      if (!url) {
        showToast('구글 시트 URL을 입력해 주세요.', 'error');
        return;
      }
      state.sheetUrl = url;
      loadGoogleSheetData(url);
    });
  }

  // --- Mock Notion API Sync (NEW UPGRADE) ---
  const fetchNotionBtn = document.getElementById('btn-fetch-notion');
  if (fetchNotionBtn) {
    fetchNotionBtn.addEventListener('click', () => {
      const dbIdEl = document.getElementById('notion-db-id');
      const tokenEl = document.getElementById('notion-api-key');
      const dbId = dbIdEl ? dbIdEl.value.trim() : '';
      const token = tokenEl ? tokenEl.value.trim() : '';
      
      showLoader('노션 integration 보안 통신 채널 개설 중...');
      setTimeout(() => {
        showLoader('노션 데이터베이스 테이블 파싱 및 컬럼 인덱싱 중...');
        setTimeout(() => {
          try {
            const result = getSampleData('users');
            state.title = '노션 연동 실시간 코호트 모니터링';
            
            const titleInput = document.getElementById('dashboard-title-input');
            const liveTitle = document.getElementById('live-dashboard-title');
            if (titleInput) titleInput.value = state.title;
            if (liveTitle) liveTitle.textContent = state.title;

            onDataLoaded(result.data, result.columns, 'Notion DB (Simulated)');
            showToast('노션 실시간 API 연동 성공!', 'success');
          } catch (e) {
            showToast('노션 연결 오류: ' + e.message, 'error');
          } finally {
            hideLoader();
          }
        }, 800);
      }, 1000);
    });
  }

  // --- Drag and Drop CSV Upload ---
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('csv-file-input');
  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('click', (e) => e.stopPropagation()); // Prevent click event bubbling recursion!
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleCSVFile(e.target.files[0]);
      }
    });
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleCSVFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Reset Data Button
  const btnReset = document.getElementById('btn-reset-data');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('대시보드를 초기 상태로 되돌리시겠습니까? 저장된 모든 데이터가 삭제됩니다.')) {
        localStorage.removeItem('gridvibe_state');
        location.reload();
      }
    });
  }

  // Chart Type Tabs
  const chartTabs = document.querySelectorAll('.chart-tab');
  chartTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      chartTabs.forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-muted)';
        btn.style.border = '1px solid var(--card-border)';
      });
      e.target.classList.add('active');
      e.target.style.background = 'var(--primary-color)';
      e.target.style.color = 'white';
      e.target.style.border = 'none';
      
      state.mainChartType = e.target.dataset.type;
      saveStateToLocal();
      triggerChartsRender();
    });
  });

  // --- Global Event Delegation for Clicks (NEW UPGRADE) ---
  document.body.addEventListener('click', (e) => {
    const target = e.target;
    // Find closest interactive element
    const btn = target.closest('button') || target.closest('.btn-select-plan') || target.closest('.keypad-btn') || target.closest('.sample-btn') || target.closest('.pay-method-card') || target.closest('.ctrl-btn');
    if (!btn) return;

    // Data Row Deletion (Data Cleaning)
    if (btn.classList.contains('btn-delete-row')) {
      const idx = parseInt(btn.dataset.index);
      if (!isNaN(idx)) {
        state.csvData.splice(idx, 1);
        saveStateToLocal();
        onMappingUpdate();
        showToast('데이터 행이 삭제되었습니다.', 'success');
      }
      return;
    }

    // 1. Sample Dataset Selection
    if (btn.classList.contains('sample-btn')) {
      const type = btn.getAttribute('data-sample');
      loadSample(type);
      return;
    }
    if (btn.id === 'btn-load-first-sample') {
      loadSample('revenue');
      return;
    }

    // 2. Action Buttons (Header & Sidebar)
    if (btn.id === 'btn-save-local') {
      saveConfig();
      return;
    }
    if (btn.id === 'btn-reset') {
      resetDashboard();
      return;
    }
    if (btn.id === 'btn-export-html') {
      if (!state.isPro) {
        openPaywallModal();
        return;
      }
      exportDashboardHTML();
      return;
    }
    if (btn.id === 'btn-export-csv') {
      exportDataToCSV();
      return;
    }
    if (btn.id === 'btn-pdf-print') {
      window.print();
      return;
    }
    if (btn.id === 'btn-subscribe-header') {
      openPaywallModal();
      return;
    }

    // 3. Widget Control Buttons (Up, Down, Width, Hide)
    if (btn.classList.contains('btn-widget-up')) {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const widget = document.getElementById(targetId);
      if (widget && widget.previousElementSibling) {
        widget.parentNode.insertBefore(widget, widget.previousElementSibling);
        showToast('위젯 순서가 올라갔습니다.', 'success');
      }
      return;
    }
    if (btn.classList.contains('btn-widget-down')) {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const widget = document.getElementById(targetId);
      if (widget && widget.nextElementSibling) {
        widget.parentNode.insertBefore(widget.nextElementSibling, widget);
        showToast('위젯 순서가 내려갔습니다.', 'success');
      }
      return;
    }
    if (btn.classList.contains('btn-widget-width')) {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const widget = document.getElementById(targetId);
      if (!widget) return;
      if (widget.classList.contains('span-12')) {
        widget.classList.remove('span-12');
        widget.classList.add('span-6');
        showToast('너비: 50%', 'info');
      } else if (widget.classList.contains('span-6')) {
        widget.classList.remove('span-6');
        widget.classList.add('span-4');
        showToast('너비: 33%', 'info');
      } else if (widget.classList.contains('span-4')) {
        widget.classList.remove('span-4');
        widget.classList.add('span-8');
        showToast('너비: 66%', 'info');
      } else {
        widget.classList.remove('span-8');
        widget.classList.add('span-12');
        showToast('너비: 100%', 'info');
      }
      setTimeout(() => { Object.values(activeCharts).forEach(c => { if (c) c.resize(); }); }, 150);
      return;
    }
    if (btn.classList.contains('btn-widget-hide')) {
      e.stopPropagation();
      const cbId = btn.getAttribute('data-checkbox');
      const cb = document.getElementById(cbId);
      if (cb) {
        cb.checked = false;
        cb.dispatchEvent(new Event('change'));
        showToast('위젯이 숨김 처리되었습니다. 좌측 토글로 복원할 수 있습니다.', 'info');
      }
      return;
    }

    // 4. Paywall Modal Buttons
    if (btn.id === 'btn-close-paywall') {
      closePaywallModal();
      return;
    }
    if (btn.classList.contains('btn-select-plan') && !btn.disabled) {
      const plan = btn.getAttribute('data-plan');
      state.selectedPlan = plan;
      const priceDisp = document.getElementById('checkout-price-display');
      if (priceDisp) priceDisp.textContent = plan === 'PRO' ? '19,000원 / 월' : '49,000원 / 월';
      transitionPaywallStage('method');
      return;
    }
    if (btn.id === 'btn-pay-toss' || btn.id === 'btn-pay-kakao' || btn.id === 'btn-pay-card') {
      ['btn-pay-toss', 'btn-pay-kakao', 'btn-pay-card'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
      btn.classList.add('active');
      return;
    }
    if (btn.id === 'btn-proceed-payment') {
      state.checkoutPin = '';
      updatePinDisplay();
      transitionPaywallStage('keypad');
      return;
    }
    if (btn.classList.contains('keypad-btn')) {
      const val = btn.textContent.trim();
      if (val === '' || val === 'delete' || btn.id === 'btn-keypad-back') return;
      if (state.checkoutPin.length < 6) {
        state.checkoutPin += val;
        updatePinDisplay();
        if (state.checkoutPin.length === 6) simulateCheckoutSuccess();
      }
      return;
    }
    if (btn.id === 'btn-keypad-back') {
      if (state.checkoutPin.length > 0) {
        state.checkoutPin = state.checkoutPin.slice(0, -1);
        updatePinDisplay();
      }
      return;
    }
    if (btn.id === 'btn-success-confirm') {
      closePaywallModal();
      state.isPro = true;
      const expBadge = document.getElementById('export-lock-badge');
      if (expBadge) expBadge.classList.add('hidden');
      const headerSubBtn = document.getElementById('btn-subscribe-header');
      if (headerSubBtn) {
        headerSubBtn.innerHTML = `<i data-lucide="shield-check"></i> PRO 멤버십`;
        headerSubBtn.style.background = 'var(--success-color)';
        headerSubBtn.style.boxShadow = '0 0 12px var(--success-glow)';
        if (window.lucide) window.lucide.createIcons();
      }
      showToast('GridVibe PRO 업그레이드가 활성화되었습니다!', 'success');
      return;
    }
  });

  // --- Real-time Title Synchronization ---
  const titleInput = document.getElementById('dashboard-title-input');
  const liveTitle = document.getElementById('live-dashboard-title');
  if (titleInput && liveTitle) {
    titleInput.addEventListener('input', (e) => {
      state.title = e.target.value.trim() || 'Premium Analytics Dashboard';
      liveTitle.textContent = state.title;
    });
  }

  // --- Metric Mappings Dimension X Change Handler ---
  const selectX = document.getElementById('mapping-x');
  if (selectX) {
    selectX.addEventListener('change', (e) => {
      state.mappings.x = e.target.value;
      onMappingUpdate();
    });
  }

  // --- Chart Type Selector (NEW UPGRADE) ---
  const chartTypeSelect = document.getElementById('chart-type-selector');
  if (chartTypeSelect) {
    chartTypeSelect.addEventListener('change', (e) => {
      state.mainChartType = e.target.value;
      document.querySelectorAll('.chart-tab').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-muted)';
        btn.style.border = '1px solid var(--card-border)';
        if (btn.dataset.type === state.mainChartType) {
          btn.classList.add('active');
          btn.style.background = 'var(--primary-color)';
          btn.style.color = 'white';
          btn.style.border = 'none';
        }
      });
      saveStateToLocal();
      triggerChartsRender();
    });
  }

  // --- Brand Logo Uploader (NEW UPGRADE: Base64 local files reader) ---
  const logoTrigger = document.getElementById('logo-upload-trigger');
  const logoFileInput = document.getElementById('logo-file-input');
  if (logoTrigger && logoFileInput) {
    logoTrigger.addEventListener('click', () => {
      if (!state.isPro) {
        openPaywallModal();
        return;
      }
      logoFileInput.click();
    });

    logoFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.size > 1024 * 1024) {
          showToast('로고 파일은 1MB 이하여야 합니다.', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          state.logoBase64 = event.target.result;
          
          const previewFrame = document.getElementById('logo-preview-frame');
          if (previewFrame) previewFrame.innerHTML = `<img src="${state.logoBase64}" class="logo-preview-img" />`;
          
          const workspaceLogoFrame = document.getElementById('workspace-logo-frame');
          const workspaceLogoImg = document.getElementById('workspace-logo-img');
          if (workspaceLogoFrame && workspaceLogoImg) {
            workspaceLogoFrame.classList.remove('hidden');
            workspaceLogoImg.src = state.logoBase64;
          }
          
          showToast('커스텀 로고가 적용되었습니다!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- Widget Toggles (Show/Hide Panels) ---
  setupWidgetToggle('toggle-kpis', 'kpis', 'widget-kpi-container');
  setupWidgetToggle('toggle-line-chart', 'lineChart', 'widget-line-container');
  setupWidgetToggle('toggle-bar-chart', 'barChart', 'bar-chart-wrapper');
  setupWidgetToggle('toggle-donut-chart', 'donutChart', 'donut-chart-wrapper');
  setupWidgetToggle('toggle-table', 'table', 'widget-table-container');

  onThemeChange((newTheme) => {
    state.theme = newTheme;
    triggerChartsRender();
  });

  // Action buttons events are now handled by Global Event Delegation

  // --- Table Search & Pagination ---
  const searchInput = document.getElementById('table-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      tableCurrentPage = 1;
      renderDashboardTable();
    });
  }

  const prevBtn = document.getElementById('btn-page-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (tableCurrentPage > 1) {
        tableCurrentPage--;
        renderDashboardTable();
      }
    });
  }

  const nextBtn = document.getElementById('btn-page-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredTableData.length / tablePageSize);
      if (tableCurrentPage < totalPages) {
        tableCurrentPage++;
        renderDashboardTable();
      }
    });
  }

  // Paywall events are now handled by Global Event Delegation

  // Initialize Drag and Drop using SortableJS
  if (typeof window.Sortable !== 'undefined') {
    const grid = document.getElementById('dashboard-active-content');
    const chartsRow = document.getElementById('charts-row-container') || document.querySelector('.charts-row');
    const sortableOpts = {
      animation: 150,
      handle: '.btn-widget-drag',
      ghostClass: 'sortable-ghost',
      forceFallback: true,
      fallbackClass: 'sortable-drag',
      onEnd: function() {
        showToast('위젯 레이아웃이 변경되었습니다.', 'info');
        saveStateToLocal();
      }
    };
    if (grid) new window.Sortable(grid, sortableOpts);
    if (chartsRow) new window.Sortable(chartsRow, sortableOpts);
  }
}

function setupWidgetToggle(checkboxId, stateKey, containerId) {
  const checkbox = document.getElementById(checkboxId);
  const container = document.getElementById(containerId);
  if (checkbox && container) {
    checkbox.addEventListener('change', (e) => {
      state.widgets[stateKey] = e.target.checked;
      if (e.target.checked) {
        container.style.display = '';
      } else {
        container.style.display = 'none';
      }
    });
    // Set initial state
    if (!state.widgets[stateKey]) {
      container.style.display = 'none';
    }
  }
}

/**
 * Paywall Modal helpers
 */
function openPaywallModal() {
  const overlay = document.getElementById('paywall-modal-overlay');
  overlay.classList.add('active');
  transitionPaywallStage('plan');
}

function closePaywallModal() {
  const overlay = document.getElementById('paywall-modal-overlay');
  overlay.classList.remove('active');
}

function transitionPaywallStage(stage) {
  state.checkoutStage = stage;
  
  // Hide all stages
  const stages = document.querySelectorAll('.paywall-stage');
  stages.forEach(s => s.classList.add('hidden'));
  
  // Show active stage
  const activeStage = document.getElementById(`checkout-stage-${stage}`);
  if (activeStage) activeStage.classList.remove('hidden');
}

function updatePinDisplay() {
  for (let i = 1; i <= 6; i++) {
    const dot = document.getElementById(`pin-${i}`);
    if (dot) {
      if (i <= state.checkoutPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    }
  }
}

function simulateCheckoutSuccess() {
  showLoader('모의 토스페이망 안전 거래 결제 승인 중...');
  setTimeout(() => {
    hideLoader();
    transitionPaywallStage('success');
  }, 1200);
}

/**
 * Premium Vanilla JS Layout Grid controls (NEW UPGRADE)
 */
function setupLayoutControls() {
  // Widget controls are now handled by Global Event Delegation in bindEvents()
}

function loadGoogleSheetData(url) {
  showLoader('구글 시트에서 실시간 데이터를 가져오는 중...');
  fetchAndParseGoogleSheet(url)
    .then(result => {
      onDataLoaded(result.data, result.columns, 'Google Sheet');
      showToast('구글 시트 연동 성공!', 'success');
    })
    .catch(err => {
      console.error(err);
      showToast(err.message, 'error');
    })
    .finally(hideLoader);
}

function handleCSVFile(file) {
  showLoader(`${file.name} 분석 중...`);
  parseCSVFile(file)
    .then(result => {
      onDataLoaded(result.data, result.columns, file.name);
      showToast('CSV 파일 파싱 완료!', 'success');
    })
    .catch(err => {
      console.error(err);
      showToast(err.message, 'error');
    })
    .finally(hideLoader);
}

function loadSample(type) {
  showLoader('샘플 대시보드 데이터를 구성하는 중...');
  setTimeout(() => {
    try {
      const result = getSampleData(type);
      const titles = {
        revenue: '스타트업 월간 재무 성과 대시보드',
        marketing: '다채널 디지털 마케팅 캠페인 분석 리포트',
        users: '실시간 유저 활성화 및 코호트 모니터링'
      };
      
      state.title = titles[type] || state.title;
      document.getElementById('dashboard-title-input').value = state.title;
      document.getElementById('live-dashboard-title').textContent = state.title;

      onDataLoaded(result.data, result.columns, `샘플: ${type}`);
      showToast('샘플 로딩 완료!', 'success');
    } catch (err) {
      showToast('샘플을 불러오는 중 오류 발생: ' + err.message, 'error');
    } finally {
      hideLoader();
    }
  }, 400);
}

function onDataLoaded(data, columns, sourceName) {
  if (!data || data.length === 0) {
    showToast('분석 가능한 데이터 행이 없습니다.', 'error');
    return;
  }
  state.csvData = data;
  state.columns = columns;

  document.getElementById('dashboard-empty-state').classList.add('hidden');
  document.getElementById('dashboard-active-content').classList.remove('hidden');

  const statusBadge = document.getElementById('dashboard-status-badge');
  const statusText = document.getElementById('status-text');
  statusBadge.classList.remove('disconnected');
  statusText.textContent = `연결됨: ${sourceName}`;

  populateMappingSelectors(columns);
  onMappingUpdate();
}

function populateMappingSelectors(columns) {
  const selectX = document.getElementById('mapping-x');
  const containerY = document.getElementById('mapping-y-container');
  const chartTypeSelect = document.getElementById('chart-type-selector');

  if (!selectX || !containerY) return;

  selectX.innerHTML = '';
  containerY.innerHTML = '';

  // 1. Populate X Axis grouping options
  selectX.innerHTML = `
    <option value="raw">원본 보기 (Raw)</option>
    <option value="day">일간 보기 (Daily)</option>
    <option value="week">주간 보기 (Weekly)</option>
    <option value="month">월간 보기 (Monthly)</option>
  `;
  selectX.disabled = false;
  if (chartTypeSelect) chartTypeSelect.disabled = false;

  // 2. Identify logical default date column for X-axis
  let defaultX = columns[0];
  const dateKeywords = ['날짜', 'month', 'date', 'day', '주간', '캠페인', 'week', 'year', '년도', '월'];
  for (const col of columns) {
    if (dateKeywords.some(keyword => col.toLowerCase().includes(keyword))) {
      defaultX = col;
      break;
    }
  }
  state.dateColumn = defaultX;
  state.mappings.x = 'raw';
  selectX.value = 'raw';

  // 3. Populate Y Axis checkboxes (excluding defaultX)
  let checkedAny = false;
  columns.forEach((col, idx) => {
    // Only allow columns containing numbers/currencies or simple floats
    const isNumeric = state.csvData.some(row => {
      const val = row[col];
      return val !== undefined && val !== null && !isNaN(parseFloat(String(val).replace(/[\$,%,원,건,\s]/g, '')));
    });

    if (isNumeric && col !== defaultX) {
      const wrapper = document.createElement('label');
      wrapper.className = 'checkbox-item';
      
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.value = col;
      chk.className = 'mapping-y-checkbox';
      
      // Auto-check first few numeric columns
      if (!checkedAny) {
        chk.checked = true;
        checkedAny = true;
      } else if (idx <= 3) {
        chk.checked = true;
      }

      chk.addEventListener('change', () => {
        updateActiveYMappings();
      });

      wrapper.appendChild(chk);
      wrapper.appendChild(document.createTextNode(' ' + col));
      containerY.appendChild(wrapper);
    }
  });

  updateActiveYMappings();
}

function updateActiveYMappings() {
  const checkboxes = document.querySelectorAll('.mapping-y-checkbox');
  const selected = [];
  checkboxes.forEach(c => {
    if (c.checked) selected.push(c.value);
  });

  state.mappings.y = selected;
  onMappingUpdate();
}

function onMappingUpdate() {
  if (!state.csvData || state.mappings.y.length === 0) return;

  const yCols = state.mappings.y;
  let totalSum = 0;
  let count = 0;
  let maxPeak = -Infinity;

  const grouping = state.mappings.x || 'raw';
  const dateCol = state.dateColumn;
  let processedData = [];

  if (grouping === 'raw' || !dateCol) {
    processedData = [...state.csvData];
  } else {
    const groups = {};
    state.csvData.forEach(row => {
      let rawVal = row[dateCol];
      let groupKey = String(rawVal !== undefined && rawVal !== null ? rawVal : '');
      
      if (rawVal) {
        const d = new Date(rawVal);
        if (!isNaN(d.getTime())) {
          if (grouping === 'day') {
            groupKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          } else if (grouping === 'month') {
            groupKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}월`;
          } else if (grouping === 'week') {
            const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
            const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            groupKey = `${d.getFullYear()}-W${String(weekNum).padStart(2,'0')}`;
          }
        }
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = { [dateCol]: groupKey };
        state.columns.forEach(c => {
          if (c !== dateCol) groups[groupKey][c] = row[c];
        });
        yCols.forEach(y => groups[groupKey][y] = 0);
      }
      
      yCols.forEach(yCol => {
        let val = row[yCol];
        if (typeof val === 'string') val = parseFloat(val.replace(/[\$,%,원,건,\s]/g, ''));
        if (!isNaN(val)) groups[groupKey][yCol] += val;
      });
    });
    
    processedData = Object.values(groups);
    processedData.sort((a, b) => String(a[dateCol]).localeCompare(String(b[dateCol]), undefined, { numeric: true }));
  }
  
  state.processedData = processedData;

  processedData.forEach(row => {
    yCols.forEach(yCol => {
      let val = row[yCol];
      if (typeof val === 'string') val = parseFloat(val.replace(/[\$,%,원,건,\s]/g, ''));
      if (!isNaN(val)) {
        totalSum += val;
        count++;
        if (val > maxPeak) maxPeak = val;
      }
    });
  });

  if (maxPeak === -Infinity) maxPeak = 0;
  const avg = count > 0 ? (totalSum / count) : 0;

  const formatNumber = (num) => {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '억';
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  // Update DOM KPI elements dynamically to show the primary Y metric or combined
  const mainYTitle = yCols.length === 1 ? yCols[0] : `${yCols[0]} 외 ${yCols.length - 1}개`;
  document.getElementById('kpi-1-label').textContent = `${mainYTitle} 합계`;
  document.getElementById('kpi-total-val').textContent = formatNumber(totalSum);
  
  document.getElementById('kpi-2-label').textContent = `${mainYTitle} 평균`;
  document.getElementById('kpi-avg-val').textContent = formatNumber(avg);
  
  document.getElementById('kpi-count-val').textContent = state.processedData.length.toLocaleString();
  
  document.getElementById('kpi-4-label').textContent = `${mainYTitle} 최고점`;
  document.getElementById('kpi-max-val').textContent = formatNumber(maxPeak);

  triggerChartsRender();
  renderDashboardTable();
}

function triggerChartsRender() {
  if (!state.processedData || state.mappings.y.length === 0) return;
  const tokens = getThemeColorTokens(state.theme);
  renderDashboardChartsDirect(state.processedData, state.dateColumn, state.mappings.y, state.theme, tokens, state.mainChartType);
}

let tableCurrentPage = 1;
const tablePageSize = 10;
let filteredTableData = [];

function renderDashboardTable() {
  const tableHeaderRow = document.getElementById('table-header-row');
  const tableBodyRows = document.getElementById('table-body-rows');
  const totalCountEl = document.getElementById('table-total-count');
  
  if (!tableHeaderRow || !tableBodyRows) return;

  tableHeaderRow.innerHTML = '';
  tableBodyRows.innerHTML = '';

  const displayColumns = state.columns.concat(['관리']);
  displayColumns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    tableHeaderRow.appendChild(th);
  });

  const searchInput = document.getElementById('table-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (query) {
    filteredTableData = state.processedData.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(query)
      );
    });
  } else {
    filteredTableData = [...state.processedData];
  }

  totalCountEl.textContent = filteredTableData.length;
  
  const totalRows = filteredTableData.length;
  const totalPages = Math.ceil(totalRows / tablePageSize);
  
  if (tableCurrentPage > totalPages) tableCurrentPage = Math.max(1, totalPages);
  
  const startIdx = (tableCurrentPage - 1) * tablePageSize;
  const endIdx = Math.min(startIdx + tablePageSize, totalRows);

  const paginatedData = filteredTableData.slice(startIdx, endIdx);

  const infoEl = document.getElementById('table-pagination-info');
  if (infoEl) {
    infoEl.textContent = totalRows > 0 
      ? `전체 ${totalRows}행 중 ${startIdx + 1} - ${endIdx}행 표시 중`
      : '표시할 행이 없습니다.';
  }

  const prevBtn = document.getElementById('btn-page-prev');
  const nextBtn = document.getElementById('btn-page-next');
  if (prevBtn) prevBtn.disabled = tableCurrentPage === 1 || totalRows === 0;
  if (nextBtn) nextBtn.disabled = tableCurrentPage === totalPages || totalRows === 0;

  const tokens = getThemeColorTokens(state.theme);

  paginatedData.forEach(row => {
    const tr = document.createElement('tr');
    state.columns.forEach(col => {
      const td = document.createElement('td');
      
      if (col === state.dateColumn) {
        td.style.fontWeight = '600';
        td.style.color = tokens.primary;
      } else if (state.mappings.y.includes(col)) {
        td.style.fontWeight = '700';
        td.style.color = tokens.secondary;
      }

      td.textContent = row[col] !== undefined ? row[col] : '';
      tr.appendChild(td);
    });
    
    // Add "관리" column with trash icon
    const tdAction = document.createElement('td');
    tdAction.innerHTML = `<button class="btn-icon btn-delete-row" data-index="${startIdx + paginatedData.indexOf(row)}" title="데이터 삭제" style="background:transparent;border:none;color:var(--error-color, #ef4444);cursor:pointer;"><i data-lucide="trash-2"></i></button>`;
    tr.appendChild(tdAction);

    tableBodyRows.appendChild(tr);
  });
  if (window.lucide) window.lucide.createIcons();
}

function resetDashboard() {
  state.csvData = null;
  state.columns = [];
  state.sheetUrl = '';
  state.mappings = { x: '', y: [] };
  state.logoBase64 = '';

  document.getElementById('sheet-url').value = '';
  const fileInput = document.getElementById('csv-file-input');
  if (fileInput) fileInput.value = '';
  
  const selectX = document.getElementById('mapping-x');
  const containerY = document.getElementById('mapping-y-container');
  selectX.innerHTML = '<option value="">데이터를 먼저 연결하세요</option>';
  containerY.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 10px;">데이터를 먼저 연결하세요</div>';
  selectX.disabled = true;

  document.getElementById('dashboard-active-content').classList.add('hidden');
  document.getElementById('dashboard-empty-state').classList.remove('hidden');

  const statusBadge = document.getElementById('dashboard-status-badge');
  const statusText = document.getElementById('status-text');
  statusBadge.classList.add('disconnected');
  statusText.textContent = '데이터 대기중';

  // Clear logo display
  document.getElementById('logo-preview-frame').innerHTML = `<i data-lucide="image" style="width: 18px; height: 18px; color: var(--text-muted);"></i>`;
  document.getElementById('workspace-logo-frame').classList.add('hidden');
  if (window.lucide) window.lucide.createIcons();

  Object.values(activeCharts).forEach((chart, idx) => {
    if (chart) {
      chart.destroy();
    }
  });
  activeCharts = { main: null };

  showToast('대시보드가 리셋되었습니다.', 'info');
}

function saveConfig() {
  const config = {
    title: state.title,
    theme: state.theme,
    dataSourceType: state.dataSourceType,
    sheetUrl: state.sheetUrl,
    mappings: state.mappings,
    widgets: state.widgets,
    chartType: state.chartType,
    logoBase64: state.logoBase64,
    isPro: state.isPro
  };

  localStorage.setItem('gridvibe-config', JSON.stringify(config));
  showToast('대시보드 설정이 브라우저에 저장되었습니다!', 'success');
}

function loadConfig() {
  const raw = localStorage.getItem('gridvibe-config');
  if (!raw) return;

  try {
    const config = JSON.parse(raw);
    
    state.title = config.title || state.title;
    state.theme = config.theme || state.theme;
    state.dataSourceType = config.dataSourceType || state.dataSourceType;
    state.sheetUrl = config.sheetUrl || state.sheetUrl;
    state.mappings = config.mappings || state.mappings;
    state.widgets = config.widgets || state.widgets;
    state.chartType = config.chartType || state.chartType;
    state.logoBase64 = config.logoBase64 || state.logoBase64;
    state.isPro = config.isPro || state.isPro;

    document.getElementById('dashboard-title-input').value = state.title;
    document.getElementById('live-dashboard-title').textContent = state.title;
    applyTheme(state.theme);

    // Apply PRO unlock state if saved
    if (state.isPro) {
      const expBadge = document.getElementById('export-lock-badge');
      if (expBadge) expBadge.classList.add('hidden');
      
      const headerSubBtn = document.getElementById('btn-subscribe-header');
      if (headerSubBtn) {
        headerSubBtn.innerHTML = `<i data-lucide="shield-check"></i> PRO 멤버십`;
        headerSubBtn.style.background = 'var(--success-color)';
        headerSubBtn.style.boxShadow = '0 0 12px var(--success-glow)';
        if (window.lucide) window.lucide.createIcons();
      }
    }

    // Apply custom logo if exists
    if (state.logoBase64) {
      document.getElementById('logo-preview-frame').innerHTML = `<img src="${state.logoBase64}" class="logo-preview-img" />`;
      const workspaceLogoFrame = document.getElementById('workspace-logo-frame');
      const workspaceLogoImg = document.getElementById('workspace-logo-img');
      workspaceLogoFrame.classList.remove('hidden');
      workspaceLogoImg.src = state.logoBase64;
    }

    syncCheckbox('toggle-kpis', state.widgets.kpis, 'widget-kpi-container');
    syncCheckbox('toggle-line-chart', state.widgets.lineChart, 'widget-line-container');
    syncCheckbox('toggle-bar-chart', state.widgets.barChart, 'bar-chart-wrapper');
    syncCheckbox('toggle-donut-chart', state.widgets.donutChart, 'donut-chart-wrapper');
    syncCheckbox('toggle-table', state.widgets.table, 'widget-table-container');

    if (state.dataSourceType === 'sheet' && state.sheetUrl) {
      document.getElementById('sheet-url').value = state.sheetUrl;
      loadGoogleSheetData(state.sheetUrl);
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
}

function syncCheckbox(id, checked, containerId) {
  const cb = document.getElementById(id);
  const container = document.getElementById(containerId);
  if (cb && container) {
    cb.checked = checked;
    if (checked) {
      container.classList.remove('hidden');
    } else {
      container.classList.add('hidden');
    }
  }
}

// Full premium CSS embedded directly for 100% standalone fidelity
function getGridVibeCSS() {
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

:root {
  --bg-color: #080c16;
  --bg-gradient: radial-gradient(circle at 50% 50%, #0c152b 0%, #060911 100%);
  --panel-bg: rgba(13, 20, 38, 0.7);
  --panel-border: rgba(35, 52, 94, 0.4);
  --primary-color: #8b5cf6;
  --primary-glow: rgba(139, 92, 246, 0.4);
  --secondary-color: #ec4899;
  --secondary-glow: rgba(236, 72, 153, 0.4);
  --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --text-inverse: #0b0f19;
  --card-bg: rgba(20, 30, 58, 0.6);
  --card-border: rgba(43, 64, 116, 0.4);
  --card-hover-border: rgba(139, 92, 246, 0.6);
  --card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  --input-bg: rgba(8, 12, 24, 0.8);
  --input-border: rgba(43, 64, 116, 0.6);
  --input-focus-border: #8b5cf6;
  --success-color: #10b981;
  --success-glow: rgba(16, 185, 129, 0.3);
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --sidebar-width: 420px;
  --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="light"] {
  --bg-color: #f0f4f9;
  --bg-gradient: radial-gradient(circle at 10% 20%, rgba(216, 241, 230, 0.46) 0.1%, rgba(233, 226, 226, 0.28) 90.1%);
  --panel-bg: rgba(255, 255, 255, 0.6);
  --panel-border: rgba(255, 255, 255, 0.8);
  --primary-color: #6366f1;
  --primary-glow: rgba(99, 102, 241, 0.25);
  --secondary-color: #db2777;
  --secondary-glow: rgba(219, 39, 119, 0.25);
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #db2777 100%);
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --text-inverse: #ffffff;
  --card-bg: rgba(255, 255, 255, 0.7);
  --card-border: rgba(209, 213, 219, 0.5);
  --card-hover-border: rgba(99, 102, 241, 0.5);
  --card-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.06);
  --input-bg: rgba(255, 255, 255, 0.9);
  --input-border: rgba(209, 213, 219, 0.8);
  --input-focus-border: #6366f1;
  --success-color: #059669;
  --success-glow: rgba(5, 150, 105, 0.2);
  --warning-color: #d97706;
  --error-color: #dc2626;
}

[data-theme="cyber"] {
  --bg-color: #020704;
  --bg-gradient: radial-gradient(circle at 50% 50%, #041d11 0%, #010402 100%);
  --panel-bg: rgba(3, 15, 9, 0.85);
  --panel-border: rgba(16, 185, 129, 0.2);
  --primary-color: #10b981;
  --primary-glow: rgba(16, 185, 129, 0.5);
  --secondary-color: #06b6d4;
  --secondary-glow: rgba(6, 182, 212, 0.5);
  --accent-gradient: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  --text-main: #ecfdf5;
  --text-muted: #6ee7b7;
  --text-inverse: #011c0e;
  --card-bg: rgba(4, 28, 16, 0.7);
  --card-border: rgba(16, 185, 129, 0.25);
  --card-hover-border: #10b981;
  --card-shadow: 0 8px 32px 0 rgba(0, 24, 12, 0.5);
  --input-bg: rgba(1, 10, 5, 0.9);
  --input-border: rgba(16, 185, 129, 0.4);
  --input-focus-border: #10b981;
  --success-color: #34d399;
  --success-glow: rgba(52, 211, 153, 0.3);
  --warning-color: #fbbf24;
  --error-color: #f87171;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

body {
  background: var(--bg-color);
  background-image: var(--bg-gradient);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
}

h1, h2, h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}
.deco-ball {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.25;
}
.deco-ball-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-color);
  top: -100px;
  right: 10%;
}
.deco-ball-2 {
  width: 300px;
  height: 300px;
  background: var(--secondary-color);
  bottom: -50px;
  left: 15%;
}

.app-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.workspace {
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--card-border);
}

.dashboard-title-h1 {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(to right, var(--text-main) 40%, var(--text-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.2);
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.kpi-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--card-shadow);
  position: relative;
  overflow: hidden;
  transition: transform var(--transition-fast);
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-gradient);
}
.kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
}
.kpi-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

.kpi-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kpi-value {
  font-family: 'Outfit', sans-serif;
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--text-main);
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.chart-panel-large {
  grid-column: span 8;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chart-panel-small {
  grid-column: span 4;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1100px) {
  .chart-panel-large, .chart-panel-small {
    grid-column: span 12;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  position: relative;
  flex: 1;
  min-height: 240px;
  width: 100%;
}

.table-panel {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.search-container {
  position: relative;
  width: 260px;
}
.search-container svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  stroke: var(--text-muted);
}
.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.8rem;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--card-border);
  border-radius: 10px;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.82rem;
}
.premium-table th {
  background: rgba(255, 255, 255, 0.02);
  padding: 14px 18px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--card-border);
  cursor: pointer;
}
.premium-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--card-border);
  color: var(--text-main);
}
.premium-table tr:last-child td {
  border-bottom: none;
}
.premium-table tbody tr:hover td {
  background: rgba(139, 92, 246, 0.03);
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--text-muted);
}
.pagination-controls {
  display: flex;
  gap: 6px;
}
.page-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--card-border);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-main);
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.hidden {
  display: none !important;
}

.custom-logo-display-frame {
  height: 40px;
  max-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}
.custom-logo-display-frame img {
  height: 100%;
  width: auto;
  object-fit: contain;
}

@media print {
  .sidebar,
  .widget-control-overlay,
  .loader-overlay,
  .toast-container,
  .workspace-header button,
  .workspace-header .status-badge,
  .table-toolbar,
  .table-pagination,
  footer {
    display: none !important;
  }
  body {
    background: #ffffff !important;
    color: #000000 !important;
    overflow: visible !important;
  }
  .app-container {
    display: block !important;
    height: auto !important;
    background: #ffffff !important;
  }
  .workspace {
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
  }
  .dashboard-grid {
    gap: 30px !important;
  }
  .kpi-card, .chart-panel-large, .chart-panel-small, .table-panel {
    background: #ffffff !important;
    color: #000000 !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: none !important;
    page-break-inside: avoid;
  }
  .kpi-value, .panel-title, .premium-table td {
    color: #000000 !important;
  }
  .chart-panel-large, .chart-panel-small {
    grid-column: span 12 !important;
  }
}
  `;
}

function exportDataToCSV() {
  if (!state.csvData || state.csvData.length === 0) {
    showToast('내보낼 데이터가 없습니다.', 'error');
    return;
  }
  if (typeof window.Papa === 'undefined') {
    showToast('PapaParse 라이브러리를 불러올 수 없습니다.', 'error');
    return;
  }
  
  // Use filteredTableData if activeFilter is applied, else use state.csvData
  const dataToExport = state.activeFilter ? filteredTableData : state.csvData;
  const csvStr = window.Papa.unparse(dataToExport);
  
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvStr], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dashboard_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('CSV 다운로드가 시작되었습니다.', 'success');
}

function exportDashboardHTML() {
  if (!state.csvData) {
    showToast('내보낼 데이터가 없습니다. 먼저 데이터를 불러오세요.', 'error');
    return;
  }

  showLoader('독립형 대시보드 파일을 생성하는 중...');

  setTimeout(() => {
    try {
      // Get system styling direct from hardcoded premium backup for 100% standalone reliability
      const cssContent = getGridVibeCSS();

      const packagedConfig = {
        title: state.title,
        theme: state.theme,
        csvData: state.csvData,
        columns: state.columns,
        mappings: state.mappings,
        widgets: state.widgets,
        chartType: state.chartType,
        logoBase64: state.logoBase64
      };

      const outputHTML = `<!DOCTYPE html>
<html lang="ko" data-theme="${state.theme === 'midnight' ? '' : state.theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.title} — Powered by GridVibe</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap">
  
  <style>
    ${cssContent}
  </style>
  
  <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
  <script src="https://unpkg.com/lucide@latest"><\/script>
</head>
<body style="overflow-y: auto;">
  <div class="background-decoration">
    <div class="deco-ball deco-ball-1"></div>
    <div class="deco-ball deco-ball-2"></div>
  </div>

  <div class="app-container" style="display: block; width: 100%; height: auto;">
    <main class="workspace" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 40px 20px;">
      
      <header class="workspace-header">
        <div class="workspace-title-area">
          ${packagedConfig.logoBase64 ? `<div class="custom-logo-display-frame"><img src="${packagedConfig.logoBase64}"></div>` : ''}
          <h1 class="dashboard-title-h1">${state.title}</h1>
        </div>
        <div class="status-badge" style="box-shadow: none;">
          <span class="status-dot"></span>
          <span>독립형 대시보드 리포트</span>
        </div>
      </header>

      <div class="dashboard-grid" style="margin-top: 24px;">
        <!-- KPI Metrics -->
        <div class="kpi-row ${state.widgets.kpis ? '' : 'hidden'}">
          <div class="kpi-card">
            <div class="kpi-header">
              <span>수치 합계</span>
              <i data-lucide="trending-up" class="kpi-icon"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-value" id="kpi-total-val">0</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-header">
              <span>평균값</span>
              <i data-lucide="bar-chart-2" class="kpi-icon"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-value" id="kpi-avg-val">0</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-header">
              <span>데이터 레코드 건수</span>
              <i data-lucide="rows" class="kpi-icon"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-value" id="kpi-count-val">0</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-header">
              <span>최고 수치</span>
              <i data-lucide="award" class="kpi-icon"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-value" id="kpi-max-val">0</span>
            </div>
          </div>
        </div>

        <!-- Charts Container -->
        <div class="charts-row">
          <div class="chart-panel-large ${state.widgets.lineChart ? '' : 'hidden'}" style="grid-column: span 12">
            <div class="panel-header">
              <h3 class="panel-title"><i data-lucide="line-chart"></i> 지표 분석 그래프</h3>
            </div>
            <div class="chart-container">
              <canvas id="mainLineChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Data table Grid -->
        <div class="table-panel ${state.widgets.table ? '' : 'hidden'}">
          <div class="panel-header">
            <h3 class="panel-title"><i data-lucide="table"></i> 세부 분석 데이터 그리드</h3>
          </div>
          <div class="table-toolbar">
            <div class="search-container">
              <i data-lucide="search"></i>
              <input type="text" id="table-search" class="search-input" placeholder="실시간 검색...">
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              총 <span id="table-total-count" style="font-weight: 600; color: var(--text-main);">0</span>개 데이터
            </div>
          </div>
          <div class="table-wrapper">
            <table class="premium-table">
              <thead>
                <tr id="table-header-row"></tr>
              </thead>
              <tbody id="table-body-rows"></tbody>
            </table>
          </div>
          <div class="table-pagination">
            <span id="table-pagination-info">데이터 표시 중</span>
            <div class="pagination-controls">
              <button class="page-btn" id="btn-page-prev"><i data-lucide="chevron-left"></i></button>
              <button class="page-btn" id="btn-page-next"><i data-lucide="chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>
      
      <footer style="margin-top: 60px; text-align: center; font-size: 0.72rem; color: var(--text-muted); opacity: 0.6;">
        GridVibe 대시보드 빌더에 의해 자동 생성된 리포트입니다.
      </footer>
    </main>
  </div>

  <script>
    const config = ${JSON.stringify(packagedConfig)};
    let tableCurrentPage = 1;
    const tablePageSize = 10;
    let filteredTableData = [...config.csvData];

    function getThemeColorTokens(theme) {
      if (theme === 'light') {
        return {
          primary: '#6366f1', secondary: '#db2777', textMain: '#1f2937', textMuted: '#6b7280',
          gridLine: 'rgba(31, 41, 55, 0.08)', glow: 'rgba(99, 102, 241, 0.15)', panelBg: 'rgba(255, 255, 255, 0.7)', cardBorder: 'rgba(209, 213, 219, 0.5)'
        };
      } else if (theme === 'cyber') {
        return {
          primary: '#10b981', secondary: '#06b6d4', textMain: '#ecfdf5', textMuted: '#6ee7b7',
          gridLine: 'rgba(16, 185, 129, 0.1)', glow: 'rgba(16, 185, 129, 0.3)', panelBg: 'rgba(4, 28, 16, 0.7)', cardBorder: 'rgba(16, 185, 129, 0.25)'
        };
      }
      return {
        primary: '#8b5cf6', secondary: '#ec4899', textMain: '#f3f4f6', textMuted: '#9ca3af',
        gridLine: 'rgba(255, 255, 255, 0.05)', glow: 'rgba(139, 92, 246, 0.25)', panelBg: 'rgba(13, 20, 38, 0.7)', cardBorder: 'rgba(43, 64, 116, 0.4)'
      };
    }

    document.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      calculateMetrics();
      renderCharts();
      renderTable();
      
      document.getElementById('table-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query) {
          filteredTableData = config.csvData.filter(row => 
            Object.values(row).some(v => String(v).toLowerCase().includes(query))
          );
        } else {
          filteredTableData = [...config.csvData];
        }
        tableCurrentPage = 1;
        renderTable();
      });

      document.getElementById('btn-page-prev').addEventListener('click', () => {
        if (tableCurrentPage > 1) { tableCurrentPage--; renderTable(); }
      });
      document.getElementById('btn-page-next').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredTableData.length / tablePageSize);
        if (tableCurrentPage < totalPages) { tableCurrentPage++; renderTable(); }
      });
    });

    function calculateMetrics() {
      const yCols = config.mappings.y;
      let total = 0, count = 0, max = -Infinity;

      config.csvData.forEach(row => {
        yCols.forEach(yCol => {
          let rawVal = row[yCol];
          if (rawVal !== undefined && rawVal !== null) {
            if (typeof rawVal === 'string') { rawVal = parseFloat(rawVal.replace(/[\\$,%,원,건,\\s]/g, '')); }
            const val = parseFloat(rawVal);
            if (!isNaN(val)) {
              total += val; count++;
              if (val > max) max = val;
            }
          }
        });
      });
      
      if (max === -Infinity) max = 0;
      const avg = count > 0 ? (total / count) : 0;
      
      const formatNumber = (num) => {
        if (num >= 100000000) return (num / 100000000).toFixed(1) + '억';
        if (num >= 10000) return (num / 10000).toFixed(1) + '만';
        return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
      };

      document.getElementById('kpi-total-val').textContent = formatNumber(total);
      document.getElementById('kpi-avg-val').textContent = formatNumber(avg);
      document.getElementById('kpi-count-val').textContent = config.csvData.length.toLocaleString();
      document.getElementById('kpi-max-val').textContent = formatNumber(max);
    }

    function renderCharts() {
      const tokens = getThemeColorTokens(config.theme);
      const labels = config.csvData.map(row => row[config.mappings.x]);
      const chartType = config.chartType || 'line';
      const ctx = document.getElementById('mainLineChart').getContext('2d');

      const palette = [
        tokens.primary,
        tokens.secondary,
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#06b6d4'
      ];

      const datasets = config.mappings.y.map((yCol, idx) => {
        const color = palette[idx % palette.length];
        const values = config.csvData.map(row => {
          let val = row[yCol];
          if (typeof val === 'string') { val = parseFloat(val.replace(/[\\$,%,원,건,\\s]/g, '')); }
          return parseFloat(val) || 0;
        });

        const grad = ctx.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, color + '60');
        grad.addColorStop(1, color + '02');

        const ds = {
          label: yCol,
          data: values,
          borderColor: color,
          backgroundColor: chartType === 'line' ? grad : color,
          borderWidth: 3,
          fill: chartType === 'line',
          tension: 0.4,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff'
        };

        if (chartType === 'bar' || chartType === 'horizontalBar') {
          ds.borderRadius = 6;
          ds.borderWidth = 0;
          ds.fill = false;
        }
        return ds;
      });

      let actualType = chartType;
      if (chartType === 'horizontalBar') {
        actualType = 'bar';
      }

      const configChart = {
        type: actualType,
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: chartType === 'horizontalBar' ? 'y' : 'x',
          plugins: {
            legend: {
              display: true,
              labels: { color: tokens.textMain }
            }
          },
          scales: actualType === 'radar' ? undefined : {
            x: { grid: { color: tokens.gridLine }, ticks: { color: tokens.textMuted } },
            y: { grid: { color: tokens.gridLine }, ticks: { color: tokens.textMuted } }
          }
        }
      };

      if (actualType === 'radar') {
        configChart.options.scales = {
          r: {
            grid: { color: tokens.gridLine },
            angleLines: { color: tokens.gridLine },
            pointLabels: { color: tokens.textMuted },
            ticks: { backdropColor: 'transparent', color: tokens.textMuted }
          }
        };
      }

      new Chart(ctx, configChart);
    }

    function renderTable() {
      const header = document.getElementById('table-header-row');
      const body = document.getElementById('table-body-rows');
      const tokens = getThemeColorTokens(config.theme);
      
      header.innerHTML = '';
      body.innerHTML = '';

      config.columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        header.appendChild(th);
      });

      const totalRows = filteredTableData.length;
      document.getElementById('table-total-count').textContent = totalRows;
      
      const totalPages = Math.ceil(totalRows / tablePageSize);
      const startIdx = (tableCurrentPage - 1) * tablePageSize;
      const endIdx = Math.min(startIdx + tablePageSize, totalRows);

      document.getElementById('table-pagination-info').textContent = totalRows > 0
        ? \`전체 \${totalRows}행 중 \${startIdx + 1} - \${endIdx}행 표시 중\`
        : '표시할 행이 없습니다.';

      document.getElementById('btn-page-prev').disabled = tableCurrentPage === 1 || totalRows === 0;
      document.getElementById('btn-page-next').disabled = tableCurrentPage === totalPages || totalRows === 0;

      filteredTableData.slice(startIdx, endIdx).forEach(row => {
        const tr = document.createElement('tr');
        config.columns.forEach(col => {
          const td = document.createElement('td');
          if (col === config.mappings.x) { td.style.fontWeight = '600'; td.style.color = tokens.primary; }
          else if (config.mappings.y.includes(col)) { td.style.fontWeight = '700'; td.style.color = tokens.secondary; }
          td.textContent = row[col] !== undefined ? row[col] : '';
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
    }
  </script>
</body>
</html>`;

      const blob = new Blob([outputHTML], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${state.title.replace(/\s+/g, '_')}_Dashboard.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('대시보드 파일이 성공적으로 다운로드되었습니다!', 'success');
    } catch (err) {
      console.error(err);
      showToast('HTML 내보내기 실패: ' + err.message, 'error');
    } finally {
      hideLoader();
    }
  }, 1000);
}

/**
 * Toast Notification System helper
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'alert-triangle';
  
  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { class: 'toast-icon' },
      nameAttr: 'data-lucide'
    });
  }

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * Loader overlays handlers (Show/Hide full-screen custom dynamic loader spinner)
 */
function showLoader(message) {
  const overlay = document.getElementById('loading-overlay');
  const msgEl = document.getElementById('loading-message');
  if (overlay) {
    if (msgEl && message) {
      msgEl.textContent = message;
    }
    overlay.classList.add('active');
  }
}

function hideLoader() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// ==========================================================================
// 4. MAIN ENTRY POINT & LIFE-CYCLE INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bindEvents();
  loadConfig();
  setupLayoutControls();
  
  if (!loadStateFromLocal()) {
    // If no saved dataset exists, auto-load standard revenue sample data for interactive wow factor!
    if (!state.csvData) {
      loadSample('revenue');
    }
  }
});
