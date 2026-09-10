import { MAX_HP, displayValue } from "./cards.js";

const $ = selector => document.querySelector(selector);
const handEl = $("#hand");
const logEl = $("#log");
const infoOverlay = $("#infoOverlay");

let handlers = {
  onCardClick: () => {},
  onSkipDefense: () => {},
  onRestart: () => {}
};

export function configureUI(nextHandlers) {
  handlers = { ...handlers, ...nextHandlers };

  $("#restartBtn").addEventListener("click", () => handlers.onRestart());
  $("#skipDefenseBtn").addEventListener("click", () => handlers.onSkipDefense());
  $("#rulesBtn").addEventListener("click", () => infoOverlay.classList.add("show"));
  $("#closeInfoBtn").addEventListener("click", () => infoOverlay.classList.remove("show"));
  infoOverlay.addEventListener("click", event => {
    if (event.target === infoOverlay) infoOverlay.classList.remove("show");
  });
}

export function clearLog() {
  logEl.innerHTML = "";
}

export function addLog(text, tone = "") {
  const div = document.createElement("div");
  div.className = "log-entry " + tone;
  div.textContent = text;
  logEl.prepend(div);
}

function artColors(type) {
    if (type === "attack") return ["#ff477e","#ff9b45","#ffe34f"];
    if (type === "defense") return ["#00e7ff","#4f7cff","#9cf8ff"];
    if (type === "heal") return ["#20d98b","#7dff75","#fff36e"];
    return ["#a76cff","#ff4fd8","#00e7ff"];
  }

function svgArt(card) {
    const [a,b,c] = artColors(card.type);
    const start = `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${card.name}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>
        </linearGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="240" height="120" rx="18" fill="url(#g)"/>
      <circle cx="30" cy="22" r="38" fill="white" opacity=".18"/>
      <circle cx="210" cy="99" r="48" fill="white" opacity=".15"/>`;

    const art = {
      sword:`<g transform="translate(120 60) rotate(-42)" filter="url(#gl)">
        <rect x="-7" y="-42" width="14" height="70" rx="6" fill="white"/><polygon points="0,-57 -11,-37 11,-37" fill="white"/>
        <rect x="-27" y="23" width="54" height="9" rx="5" fill="#263561"/><rect x="-5" y="31" width="10" height="24" rx="4" fill="#263561"/></g>`,
      greatsword:`<g transform="translate(120 59) rotate(-28)" filter="url(#gl)">
        <polygon points="0,-58 16,-42 11,29 -11,29 -16,-42" fill="white"/><rect x="-31" y="25" width="62" height="10" rx="4" fill="#47224d"/>
        <rect x="-7" y="33" width="14" height="28" rx="5" fill="#47224d"/></g>`,
      thunder:`<g filter="url(#gl)"><polygon points="133,10 86,67 116,67 94,111 163,49 128,49" fill="white"/>
        <path d="M43 27h49M163 94h35M178 23h23" stroke="white" stroke-width="6" stroke-linecap="round" opacity=".74"/></g>`,
      spear:`<g transform="translate(120 60) rotate(-18)" filter="url(#gl)">
        <rect x="-4" y="-43" width="8" height="94" rx="4" fill="#173c76"/><polygon points="0,-59 -14,-35 14,-35" fill="white"/>
        <path d="M-28 -8H28" stroke="white" stroke-width="7" stroke-linecap="round" opacity=".82"/></g>`,
      vampire:`<g transform="translate(120 60) rotate(-38)" filter="url(#gl)">
        <rect x="-6" y="-43" width="12" height="71" rx="6" fill="white"/><polygon points="0,-57 -10,-38 10,-38" fill="white"/>
        <rect x="-27" y="24" width="54" height="8" rx="4" fill="#4b1758"/>
        <path d="M31 -18c18 13 10 31-2 34-12-4-20-22 2-34z" fill="#fff0fb"/></g>`,
      dice:`<g filter="url(#gl)"><rect x="79" y="20" width="82" height="82" rx="16" fill="white"/>
        <g fill="#7049d8"><circle cx="100" cy="41" r="7"/><circle cx="140" cy="41" r="7"/><circle cx="120" cy="61" r="7"/><circle cx="100" cy="82" r="7"/><circle cx="140" cy="82" r="7"/></g></g>`,
      woodshield:`<g filter="url(#gl)"><path d="M120 13l48 17v31c0 27-20 43-48 50-28-7-48-23-48-50V30z" fill="#fff5db"/>
        <path d="M96 30v63M120 22v83M144 30v63" stroke="#a8753e" stroke-width="6" opacity=".84"/></g>`,
      steelshield:`<g filter="url(#gl)"><path d="M120 12l49 18v32c0 27-20 43-49 49-29-6-49-22-49-49V30z" fill="white"/>
        <path d="M120 25v70M88 54h64" stroke="#4f7cff" stroke-width="8" stroke-linecap="round"/></g>`,
      wall:`<g filter="url(#gl)" fill="white"><rect x="49" y="38" width="142" height="60" rx="5"/>
        <path d="M49 58h142M49 78h142M85 38v20M140 38v20M72 58v20M122 58v20M171 58v20M96 78v20M151 78v20" stroke="#4f7cff" stroke-width="5"/></g>`,
      herb:`<g filter="url(#gl)"><path d="M120 103V52" stroke="white" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="96" cy="53" rx="27" ry="14" transform="rotate(25 96 53)" fill="white"/>
        <ellipse cx="145" cy="43" rx="28" ry="14" transform="rotate(-28 145 43)" fill="white"/>
        <ellipse cx="145" cy="77" rx="25" ry="13" transform="rotate(24 145 77)" fill="#eaffd6"/></g>`,
      water:`<g filter="url(#gl)"><path d="M120 15c-16 25-39 48-39 67 0 22 17 34 39 34s39-12 39-34c0-19-23-42-39-67z" fill="white"/>
        <path d="M100 81c7 12 17 16 31 13" fill="none" stroke="#4f7cff" stroke-width="7" stroke-linecap="round"/></g>`,
      miracle:`<g filter="url(#gl)"><circle cx="120" cy="60" r="31" fill="white"/>
        <path d="M120 10v22M120 88v22M70 60h22M148 60h22M84 24l16 16M140 80l16 16M156 24l-16 16M100 80L84 96" stroke="white" stroke-width="8" stroke-linecap="round"/>
        <circle cx="120" cy="60" r="12" fill="#ffcf3f"/></g>`
    };
    return start + (art[card.art] || art.sword) + `</svg>`;
  }

function playedMarkup(card) {
    if (!card) return `<div class="played-empty">아직 사용한 카드가 없습니다.</div>`;
    return `<div class="played-card card-pop">
      <div class="played-art">${svgArt(card)}</div>
      <div class="played-body">
        <div class="played-meta">${card.label}</div>
        <div class="played-name">${card.name}</div>
        <div class="played-desc">${card.desc}</div>
        <div class="played-value">${displayValue(card)}</div>
      </div>
    </div>`;
  }

function hpBar(el, hp) {
    el.style.width = `${Math.max(0, hp / MAX_HP * 100)}%`;
    if (hp <= 12) el.style.background = "linear-gradient(90deg,#ff6b78,#ff996b)";
    else if (hp <= 24) el.style.background = "linear-gradient(90deg,#f1c75b,#ffdf75)";
    else el.style.background = "linear-gradient(90deg,#5dd390,#9be372)";
  }

function renderPlayed(state) {
  $("#playerPlayed").innerHTML = playedMarkup(state.lastPlayerCard);
  $("#enemyPlayed").innerHTML = playedMarkup(state.lastEnemyCard);
  $("#playerPlayedSlot").classList.toggle("active", !!state.lastPlayerCard);
  $("#enemyPlayedSlot").classList.toggle("active", !!state.lastEnemyCard);
}

export function render(state) {
  $("#playerHpText").textContent = `${state.playerHp} / ${MAX_HP}`;
  $("#enemyHpText").textContent = `${state.enemyHp} / ${MAX_HP}`;
  hpBar($("#playerHpBar"), state.playerHp);
  hpBar($("#enemyHpBar"), state.enemyHp);

  $("#playerState").textContent = `손패 ${state.playerHand.length}장`;
  $("#enemyState").textContent = `손패 ${state.enemyHand.length}장`;
  $("#turnNum").textContent = state.turn;
  $("#handNum").textContent = state.playerHand.length;
  $("#enemyHandNum").textContent = state.enemyHand.length;

  if (state.gameOver) {
    $("#turnLabel").textContent = "BATTLE OVER";
    $("#turnTitle").textContent = state.playerHp > 0 ? "승리!" : "패배";
    $("#turnHelp").textContent = "새 게임 버튼으로 다시 시작할 수 있습니다.";
    $("#statusIcon").textContent = state.playerHp > 0 ? "🏆" : "☠";
  } else if (state.phase === "player") {
    $("#turnLabel").textContent = `TURN ${state.turn}`;
    $("#turnTitle").textContent = "당신의 턴";
    $("#turnHelp").textContent = "사용할 카드 한 장을 선택하세요.";
    $("#statusIcon").textContent = "⚔";
  } else {
    $("#turnLabel").textContent = `TURN ${state.turn}`;

    if (state.phase === "defense") {
      $("#turnTitle").textContent = "방어 선택";
      $("#turnHelp").textContent = "상대의 공격 카드를 확인한 뒤 방어 카드를 선택하세요.";
    } else if (state.phase === "resolving") {
      $("#turnTitle").textContent = "카드 확인 중";
      $("#turnHelp").textContent = "사용된 카드와 효과를 잠시 보여주고 있습니다.";
    } else if (state.phase === "between") {
      $("#turnTitle").textContent = "다음 턴 준비";
      $("#turnHelp").textContent = "방금 사용한 카드를 확인하세요.";
    } else {
      $("#turnTitle").textContent = "적의 턴";
      $("#turnHelp").textContent = "상대가 사용할 카드를 확인하세요.";
    }

    $("#statusIcon").textContent = "⌛";
  }

  const defenseMode = state.phase === "defense" && !state.gameOver;
  const handZone = $("#handZone");
  const defenseInline = $("#defenseInline");

  if (handZone) handZone.classList.toggle("defense-mode", defenseMode);
  if (defenseInline) defenseInline.classList.toggle("show", defenseMode);

  if (defenseMode && state.pendingAttack) {
    const { card, dmg } = state.pendingAttack;
    $("#defenseInlineTitle").textContent = `${card.name} · ${dmg} 피해가 들어옵니다`;

    const shieldCount = state.playerHand.filter(card => card.type === "defense").length;
    $("#defenseInlineDesc").textContent = shieldCount
      ? `방어 카드 ${shieldCount}장 중 하나를 직접 선택하세요. 다른 카드는 잠시 선택할 수 없습니다.`
      : "사용 가능한 방어 카드가 없습니다. 방어하지 않기를 선택하세요.";
  }

  renderPlayed(state);

  handEl.innerHTML = "";
  state.playerHand.forEach((card, index) => {
    const button = document.createElement("button");
    button.className = `card ${card.type}`;

    if (state.gameOver) {
      button.disabled = true;
    } else if (state.phase === "player") {
      button.disabled = card.type === "defense";
    } else if (state.phase === "defense") {
      button.disabled = card.type !== "defense";
    } else {
      button.disabled = true;
    }

    button.innerHTML = `
      <div class="card-art">${svgArt(card)}</div>
      <div class="card-body">
        <span class="type">${card.label}</span>
        <span class="cname">${card.name}</span>
        <span class="desc">${card.desc}</span>
        <span class="value">${displayValue(card)}</span>
      </div>`;

    button.addEventListener("click", () => handlers.onCardClick(index));
    handEl.appendChild(button);
  });
}
