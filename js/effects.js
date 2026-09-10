// 전투 타이밍과 시각 이펙트
export const TIMING = {
  CARD_REVEAL: 1000,
  DEFENSE_REVEAL: 1900,
  RESULT_HOLD: 900,
  TURN_GAP: 1100,
  AI_THINK: 800
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function playAttackFx(attacker, card) {
    return new Promise(resolve => {
      const layer = document.querySelector("#battleFx");
      if (!layer) { resolve(); return; }

      const special = card.type === "special" ? " special" : "";
      const projectile = document.createElement("div");
      projectile.className = `attack-projectile ${attacker === "player" ? "from-player" : "from-enemy"}${special}`;
      layer.appendChild(projectile);

      setTimeout(() => {
        const impact = document.createElement("div");
        impact.className = `impact-ring ${attacker === "player" ? "on-enemy" : "on-player"}${special}`;
        layer.appendChild(impact);

        const slash = document.createElement("div");
        slash.className = `slash-flare ${attacker === "player" ? "on-enemy" : "on-player"}`;
        layer.appendChild(slash);

        const target = attacker === "player" ? document.querySelector("#enemyBox") : document.querySelector("#playerBox");
        if (target) {
          target.classList.remove("hit-strong");
          void target.offsetWidth;
          target.classList.add("hit-strong");
        }

        setTimeout(() => { impact.remove(); slash.remove(); }, 520);
      }, 430);

      setTimeout(() => {
        projectile.remove();
        resolve();
      }, 680);
    });
  }

export function playDefenseFx(targetSide) {
    const layer = document.querySelector("#battleFx");
    if (!layer) return;
    const shield = document.createElement("div");
    shield.className = `shield-fx ${targetSide === "enemy" ? "on-enemy" : "on-player"}`;
    layer.appendChild(shield);
    setTimeout(() => shield.remove(), 760);
  }

export function pulse(selector) {
    const el = document.querySelector(selector);
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  }
