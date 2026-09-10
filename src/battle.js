import { MAX_HP, newHand, removeAndRefill } from "./cards.js";
import { chooseAiCard, chooseAiDefense } from "./ai.js";
import { TIMING, sleep, playAttackFx, playDefenseFx, pulse } from "./effects.js";
import { render, addLog, clearLog } from "./ui.js";

let battleSerial = 0;
let state = null;

export function getState() {
  return state;
}

function clearPlayedCards() {
  state.lastPlayerCard = null;
  state.lastEnemyCard = null;
}

function showPlayed(side, card) {
  if (side === "player") state.lastPlayerCard = { ...card };
  else state.lastEnemyCard = { ...card };
}

function clampHp(value) {
  return Math.max(0, Math.min(MAX_HP, value));
}

export function resetGame() {
  const battleId = ++battleSerial;
  state = {
    battleId,
    playerHp: MAX_HP,
    enemyHp: MAX_HP,
    playerHand: newHand(),
    enemyHand: newHand(),
    phase: "player",
    turn: 1,
    gameOver: false,
    pendingAttack: null,
    lastPlayerCard: null,
    lastEnemyCard: null
  };

  clearLog();
  addLog("전투 시작! 먼저 행동합니다.", "info");
  render(state);
}

async function resolveAttack(card, attacker, battleId = state.battleId) {
    if (battleId !== state.battleId || state.gameOver) return;
    const dmg = card.gamble ? 2 + Math.floor(Math.random()*11) : card.value;
    state.phase = "resolving";
    render(state);

    // 먼저 공격 카드를 충분히 읽을 시간을 줍니다.
    await sleep(TIMING.CARD_REVEAL);
    if (battleId !== state.battleId || state.gameOver) return;

    // 공격 카드 확인 후 실제 공격이 날아가는 연출을 보여줍니다.
    await playAttackFx(attacker, card);
    if (battleId !== state.battleId || state.gameOver) return;

    if (attacker === "player") {
      if (card.pierce) {
        applyDamage("enemy", dmg);
        addLog(`관통 공격! 적에게 ${dmg} 피해를 입혔습니다.`, "good");
        if (card.lifesteal) {
          state.playerHp = clampHp(state.playerHp + card.lifesteal);
          addLog(`흡혈 효과로 HP ${card.lifesteal} 회복.`, "good");
        }
        checkEnd();
        render(state);
        if (state.gameOver) return;
        await sleep(TIMING.RESULT_HOLD);
        if (battleId !== state.battleId) return;
        await beginEnemyTurn(battleId);
        return;
      }

      const defIndex = chooseAiDefense(state.enemyHand, dmg);
      let blocked = 0;
      if (defIndex >= 0) {
        const shield = state.enemyHand[defIndex];
        blocked = shield.value;
        showPlayed("enemy", shield);
        playDefenseFx("enemy");
        removeAndRefill(state.enemyHand, defIndex);
        addLog(`적이 ${shield.name}으로 ${blocked}만큼 방어합니다.`);
        state.phase = "resolving";
        render(state);

        // 핵심: 상대가 어떤 방어 카드를 썼는지 오래 보여줍니다.
        await sleep(TIMING.DEFENSE_REVEAL);
        if (battleId !== state.battleId || state.gameOver) return;
      }

      const finalDmg = Math.max(0, dmg - blocked);
      applyDamage("enemy", finalDmg);
      addLog(`${card.name}: 적에게 ${finalDmg} 피해.`, "good");
      if (card.lifesteal) {
        state.playerHp = clampHp(state.playerHp + card.lifesteal);
        addLog(`흡혈 효과로 HP ${card.lifesteal} 회복.`, "good");
      }
      checkEnd();
      render(state);
      if (state.gameOver) return;

      await sleep(TIMING.RESULT_HOLD);
      if (battleId !== state.battleId) return;
      await beginEnemyTurn(battleId);
    } else {
      if (card.pierce) {
        applyDamage("player", dmg);
        addLog(`적의 관통 공격! ${dmg} 피해를 받았습니다.`, "bad");
        if (card.lifesteal) state.enemyHp = clampHp(state.enemyHp + card.lifesteal);
        checkEnd();
        render(state);
        if (state.gameOver) return;
        await sleep(TIMING.RESULT_HOLD);
        if (battleId !== state.battleId) return;
        await finishEnemyTurn(battleId);
      } else {
        openDefense(card, dmg);
      }
    }
  }

export async function playPlayerCard(idx) {
    if (state.phase !== "player" || state.gameOver) return;
    const battleId = state.battleId;
    const card = state.playerHand[idx];
    if (!card || card.type === "defense") return;

    state.phase = "resolving";
    showPlayed("player", card);
    removeAndRefill(state.playerHand, idx);
    render(state);

    if (card.type === "heal") {
      await sleep(TIMING.CARD_REVEAL);
      if (battleId !== state.battleId || state.gameOver) return;
      const before = state.playerHp;
      state.playerHp = clampHp(state.playerHp + card.value);
      addLog(`${card.name} 사용: HP ${state.playerHp-before} 회복.`, "good");
      render(state);
      await sleep(TIMING.RESULT_HOLD);
      if (battleId !== state.battleId) return;
      await beginEnemyTurn(battleId);
      return;
    }

    await resolveAttack(card, "player", battleId);
  }

async function beginEnemyTurn(battleId = state.battleId) {
    if (battleId !== state.battleId || state.gameOver) return;

    // 공격/방어 결과를 읽고 다음 턴임을 인지할 수 있도록 텀을 둡니다.
    state.phase = "between";
    render(state);
    await sleep(TIMING.TURN_GAP);
    if (battleId !== state.battleId || state.gameOver) return;

    // 플레이어 턴이 끝났으므로, 상대 턴 시작 전에 양쪽 사용 카드 슬롯을 비웁니다.
    clearPlayedCards();
    state.phase = "enemy";
    render(state);
    await sleep(TIMING.AI_THINK);
    if (battleId !== state.battleId || state.gameOver) return;

    const idx = chooseAiCard(state.enemyHand, state.enemyHp);
    const card = state.enemyHand[idx];
    removeAndRefill(state.enemyHand, idx);
    showPlayed("enemy", card);
    state.phase = "resolving";
    render(state);

    if (card.type === "heal") {
      await sleep(TIMING.CARD_REVEAL);
      if (battleId !== state.battleId || state.gameOver) return;
      const before = state.enemyHp;
      state.enemyHp = clampHp(state.enemyHp + card.value);
      addLog(`적이 ${card.name}을 사용해 HP ${state.enemyHp-before} 회복.`);
      render(state);
      await sleep(TIMING.RESULT_HOLD);
      if (battleId !== state.battleId) return;
      await finishEnemyTurn(battleId);
    } else if (card.type === "defense") {
      addLog(`적이 ${card.name}으로 방어 태세를 유지합니다.`);
      await sleep(TIMING.DEFENSE_REVEAL);
      if (battleId !== state.battleId) return;
      await finishEnemyTurn(battleId);
    } else {
      addLog(`적이 ${card.name}을 사용했습니다.`, "bad");
      await resolveAttack(card, "enemy", battleId);
    }
  }

function openDefense(card, dmg) {
    state.phase = "defense";
    state.pendingAttack = {card, dmg};
    addLog(`적의 ${card.name} 공격! 손패에서 방어 카드를 직접 선택하세요.`, "bad");
    render(state);
  }

export async function defendWith(idx) {
    const battleId = state.battleId;
    const shield = state.playerHand[idx];
    if (!shield || shield.type !== "defense" || !state.pendingAttack) return;
    const {card,dmg} = state.pendingAttack;

    state.phase = "resolving";
    showPlayed("player", shield);
    playDefenseFx("player");
    removeAndRefill(state.playerHand, idx);
    addLog(`${shield.name}으로 방어합니다. 카드를 확인하세요.`, "info");
    render(state);

    // 내가 쓴 방어 카드도 바로 피해 계산하지 않고 충분히 보여줍니다.
    await sleep(TIMING.DEFENSE_REVEAL);
    if (battleId !== state.battleId || state.gameOver) return;

    const finalDmg = Math.max(0, dmg - shield.value);
    applyDamage("player", finalDmg);
    addLog(`${shield.name}으로 ${shield.value} 방어 → ${finalDmg} 피해를 받았습니다.`, finalDmg ? "bad" : "good");
    if (card.lifesteal) state.enemyHp = clampHp(state.enemyHp + card.lifesteal);
    state.pendingAttack = null;
    checkEnd();
    render(state);
    if (state.gameOver) return;

    await sleep(TIMING.RESULT_HOLD);
    if (battleId !== state.battleId) return;
    await finishEnemyTurn(battleId);
  }

export async function skipDefense() {
  if (state.phase !== "defense" || !state.pendingAttack || state.gameOver) return;

  const battleId = state.battleId;
  const { card, dmg } = state.pendingAttack;
  state.phase = "resolving";
  render(state);

  await sleep(450);
  if (battleId !== state.battleId || state.gameOver) return;

  applyDamage("player", dmg);
  addLog(`방어하지 않아 ${dmg} 피해를 받았습니다.`, "bad");

  if (card.lifesteal) state.enemyHp = clampHp(state.enemyHp + card.lifesteal);

  state.pendingAttack = null;
  checkEnd();
  render(state);
  if (state.gameOver) return;

  await sleep(TIMING.RESULT_HOLD);
  if (battleId !== state.battleId) return;
  await finishEnemyTurn(battleId);
}

function applyDamage(target, amount) {
    if (target === "player") {
      state.playerHp = clampHp(state.playerHp - amount);
      pulse("#playerBox");
    } else {
      state.enemyHp = clampHp(state.enemyHp - amount);
      pulse("#enemyBox");
    }
  }

async function finishEnemyTurn(battleId = state.battleId) {
    if (battleId !== state.battleId || state.gameOver) { render(state); return; }
    state.phase = "between";
    render(state);
    await sleep(TIMING.TURN_GAP);
    if (battleId !== state.battleId || state.gameOver) return;

    // AI 턴이 끝났으므로, 플레이어 턴 시작 전에 양쪽 사용 카드 슬롯을 비웁니다.
    clearPlayedCards();

    state.turn++;
    state.phase = "player";
    render(state);
  }

function checkEnd() {
    if (state.enemyHp <= 0 || state.playerHp <= 0) {
      state.gameOver = true;
      state.phase = "over";
      if (state.enemyHp <= 0 && state.playerHp > 0) addLog("승리했습니다!", "info");
      else addLog("패배했습니다. 새 게임으로 다시 도전할 수 있습니다.", "bad");
      render(state);
      return true;
    }
    return false;
  }
