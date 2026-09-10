# Divine Field Prototype · Modular v1

기존 Neon v5를 기능별 파일로 분리한 버전입니다.

## 구조

```text
divine-field-modular-v1/
├─ index.html
├─ css/
│  └─ game.css
└─ js/
   ├─ main.js
   ├─ battle.js
   ├─ cards.js
   ├─ ai.js
   ├─ effects.js
   └─ ui.js
```

## 각 파일 역할
- `index.html`: 화면의 HTML 뼈대
- `css/game.css`: 전체 UI, 카드, 애니메이션 스타일
- `js/cards.js`: 카드 데이터, 드로우, 손패 보충
- `js/ai.js`: AI 공격/회복/방어 판단
- `js/effects.js`: 공격/방어 이펙트와 전투 타이밍
- `js/ui.js`: DOM 렌더링, 카드 이미지, 로그, 버튼 연결
- `js/battle.js`: 턴, 공격, 방어, 피해, 승패 등 실제 게임 규칙
- `js/main.js`: 각 모듈을 연결하고 게임 시작

## 이번 버그 수정
이전 버전은 `AI 턴 종료 → 플레이어 턴 시작`에서만 중앙 사용 카드 슬롯을 비웠습니다.
이제 `플레이어 턴 종료 → AI 턴 시작`에서도 같은 초기화를 수행하므로,
각 플레이어의 턴이 새로 시작될 때 중앙 카드 슬롯은 항상 빈 상태가 됩니다.

## 실행
ES Module을 사용하므로 브라우저 보안 설정에 따라 `index.html`을 파일로 직접 열었을 때
모듈 로딩이 차단될 수 있습니다. 가장 안정적인 실행 방법은 프로젝트 폴더에서 간단한 로컬 서버를 여는 것입니다.

예:
```bash
python -m http.server 8000
```

그 후 브라우저에서 `http://localhost:8000`을 엽니다.
