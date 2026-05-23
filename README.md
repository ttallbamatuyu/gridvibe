# GridVibe - 프리미엄 인텔리전스 대시보드

GridVibe는 원시 데이터를 시각적으로 아름답고 직관적인 인사이트로 변환하도록 설계된 최첨단 인터랙티브 분석 대시보드입니다. 최신 웹 기술과 프리미엄 사용자 경험(UX)에 중점을 두고 제작되었으며, 매끄러운 드래그 앤 드롭 커스터마이징, 심층적인 데이터 필터링(Drill-down), 그리고 아름다운 반응형 테마 시스템을 제공합니다.

## 🚀 주요 기능

- **실시간 CSV 데이터 분석**: 업계 표준인 [PapaParse](https://www.papaparse.com/) 엔진을 탑재하여, 원본 CSV 데이터를 드래그 앤 드롭하기만 하면 즉시 동적인 대시보드로 변환됩니다. 문자열과 숫자 데이터 컬럼이 X/Y축으로 자동 매핑됩니다.
- **인터랙티브 드릴다운(Drill-Down) 분석**: 메인 차트의 특정 데이터 포인트(막대나 점)를 클릭하면 대시보드 전체(데이터 표 및 서브 차트)가 즉시 해당 데이터 기준으로 필터링되어 심층 분석이 가능합니다.
- **드래그 앤 드롭 위젯 재배치**: [SortableJS](https://sortablejs.github.io/Sortable/) 기반으로 구현되어, 마우스 드래그만으로 KPI, 차트, 표 등의 위젯 레이아웃을 사용자의 워크플로우에 맞게 자유롭게 커스터마이징 할 수 있습니다.
- **완벽한 카멜레온 테마 동기화**: 3가지의 아름다운 테마(미드나잇, 라이트 글래스, 네온 사이버)를 지원하며, 테마 변경 시 Chart.js 내부의 선, 막대, 툴팁 색상까지 완벽하게 동기화됩니다.
- **데이터 및 리포트 내보내기**: 분석 및 필터링이 완료된 최종 데이터를 다시 CSV 형식으로 내보내거나, 현재 대시보드 화면을 깔끔하게 정리된 PDF 리포트 파일로 출력할 수 있습니다.

## 🛠️ 기술 스택 (Technology Stack)

- **Core**: 순수 HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: [Chart.js](https://www.chartjs.org/) (반응형 캔버스 기반 데이터 시각화)
- **Data Parsing**: [PapaParse](https://www.papaparse.com/) (초고속 CSV 데이터 처리)
- **Interactivity**: [SortableJS](https://sortablejs.github.io/Sortable/) (부드러운 드래그 앤 드롭 위젯 관리)
- **Icons**: [Lucide Icons](https://lucide.dev/) (가볍고 깔끔한 SVG 아이콘)

## 📥 시작하기

1. **저장소 클론(Clone):**
   ```bash
   git clone https://github.com/ttallbamatuyu/gridvibe.git
   ```
2. **로컬에서 실행하기:**
   다운받은 폴더 내의 `index.html` 파일을 웹 브라우저로 열기만 하면 끝입니다. 복잡한 빌드 도구나 백엔드 서버가 전혀 필요하지 않은 독립형(Standalone) 프로젝트입니다!
3. **데이터 로드하기:**
   화면 좌측 상단의 "CSV 업로드" 영역에 본인의 데이터를 넣거나, "샘플 매출 데이터로 즉시 체험하기" 버튼을 눌러 대시보드의 강력한 기능들을 바로 테스트해 보세요.

## 📄 라이선스 (License)

이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
