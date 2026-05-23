/**
 * GridVibe Data Parser Module
 * Handles remote Google Sheet fetching, local CSV parsing via PapaParse, and generates high-fidelity sample datasets.
 */

/**
 * Fetch and parse a public Google Sheet (published as CSV)
 * @param {string} url - Google Sheet public CSV URL
 * @returns {Promise<Object>} { data: Array, columns: Array }
 */
export function fetchAndParseGoogleSheet(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('URL이 입력되지 않았습니다.'));
      return;
    }

    // Basic URL validation
    if (!url.includes('docs.google.com/spreadsheets')) {
      reject(new Error('올바른 구글 시트 주소가 아닙니다. "웹에 게시(CSV)" 주소를 사용해 주세요.'));
      return;
    }

    // Ensure it outputs CSV
    let csvUrl = url;
    if (url.includes('/edit') && !url.includes('output=csv')) {
      // Convert standard sheet URL to CSV export format if possible
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

/**
 * Parse standard CSV file using PapaParse
 * @param {File} file 
 * @returns {Promise<Object>} { data: Array, columns: Array }
 */
export function parseCSVFile(file) {
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

/**
 * Helper to parse raw CSV text content
 */
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

/**
 * Generate premium sample datasets
 * @param {string} type - 'revenue' | 'marketing' | 'users'
 * @returns {Object} { data: Array, columns: Array }
 */
export function getSampleData(type) {
  let data = [];
  
  if (type === 'revenue') {
    // 12 Months Startup Financial Performance
    data = [
      { '날짜(Month)': '1월', '매출액($)': 12000, '마케팅비($)': 3200, '활성유저(MAU)': 1200, '신규유입': 230 },
      { '날짜(Month)': '2월', '매출액($)': 14500, '마케팅비($)': 3500, '활성유저(MAU)': 1550, '신규유입': 410 },
      { '날짜(Month)': '3월', '매출액($)': 19000, '마케팅비($)': 4800, '활성유저(MAU)': 2100, '신규유입': 580 },
      { '날짜(Month)': '4월', '매출액($)': 18500, '마케팅비($)': 4200, '활성유저(MAU)': 2450, '신규유입': 350 },
      { '날짜(Month)': '5월', '매출액($)': 24000, '마케팅비($)': 5500, '활성유저(MAU)': 3100, '신규유입': 690 },
      { '날짜(Month)': '6월', '매출액($)': 29500, '마케팅비($)': 6800, '활성유저(MAU)': 4200, '신규유입': 880 },
      { '날짜(Month)': '7월', '매출액($)': 35000, '마케팅비($)': 7500, '활성유저(MAU)': 5600, '신규유입': 1200 },
      { '날짜(Month)': '8월', '매출액($)': 32000, '마케팅비($)': 6900, '활성유저(MAU)': 6100, '신규유입': 910 },
      { '날짜(Month)': '9월', '매출액($)': 38000, '마케팅비($)': 8200, '활성유저(MAU)': 7200, '신규유입': 1350 },
      { '날짜(Month)': '10월', '매출액($)': 45000, '마케팅비($)': 9500, '활성유저(MAU)': 8900, '신규유입': 1800 },
      { '날짜(Month)': '11월', '매출액($)': 52000, '마케팅비($)': 11000, '활성유저(MAU)': 10500, '신규유입': 2100 },
      { '날짜(Month)': '12월', '매출액($)': 68000, '마케팅비($)': 14000, '활성유저(MAU)': 13000, '신규유입': 2950 }
    ];
  } else if (type === 'marketing') {
    // Ad Campaign Performance Data
    data = [
      { '캠페인(Campaign)': '구글 검색 광고', '노출수': 125000, '클릭수': 4800, '전환수': 240, '비용($)': 1800, 'ROAS(%)': 260 },
      { '캠페인(Campaign)': '인스타 피드 캠페인', '노출수': 280000, '클릭수': 9500, '전환수': 380, '비용($)': 3200, 'ROAS(%)': 185 },
      { '캠페인(Campaign)': '유튜브 인스트림', '노출수': 450000, '클릭수': 12000, '전환수': 180, '비용($)': 4500, 'ROAS(%)': 110 },
      { '캠페인(Campaign)': '리타겟팅 배너', '노출수': 85000, '클릭수': 3100, '전환수': 420, '비용($)': 1200, 'ROAS(%)': 490 },
      { '캠페인(Campaign)': '틱톡 챌린지 광고', '노출수': 390000, '클릭수': 18500, '전환수': 210, '비용($)': 2800, 'ROAS(%)': 150 },
      { '캠페인(Campaign)': '뉴스레터 스폰서십', '노출수': 25000, '클릭수': 1200, '전환수': 95, '비용($)': 500, 'ROAS(%)': 380 },
      { '캠페인(Campaign)': '인플루언서 협찬', '노출수': 150000, '클릭수': 6400, '전환수': 310, '비용($)': 2500, 'ROAS(%)': 220 }
    ];
  } else if (type === 'users') {
    // User Activity and Retention stats
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
