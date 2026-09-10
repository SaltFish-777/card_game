// 카드 데이터와 손패 관련 기능
export const MAX_HP = 40;
export const HAND_SIZE = 9;

export const CARD_POOL = [
    { name:"철검", type:"attack", label:"공격", value:5, desc:"기본 공격 5 피해", weight:18 },
    { name:"대검", type:"attack", label:"공격", value:8, desc:"강한 공격 8 피해", weight:10 },
    { name:"천벌", type:"attack", label:"공격", value:11, desc:"희귀 공격 11 피해", weight:4 },
    { name:"관통창", type:"special", label:"특수", value:6, pierce:true, desc:"방어를 무시하고 6 피해", weight:6 },
    { name:"흡혈검", type:"special", label:"특수", value:5, lifesteal:3, desc:"5 피해 + HP 3 회복", weight:5 },
    { name:"도박의 칼", type:"special", label:"특수", value:0, gamble:true, desc:"2~12의 무작위 피해", weight:5 },

    { name:"나무 방패", type:"defense", label:"방어", value:3, desc:"받는 피해 3 감소", weight:13 },
    { name:"강철 방패", type:"defense", label:"방어", value:6, desc:"받는 피해 6 감소", weight:9 },
    { name:"성벽", type:"defense", label:"방어", value:9, desc:"받는 피해 9 감소", weight:4 },

    { name:"약초", type:"heal", label:"회복", value:4, desc:"HP 4 회복", weight:10 },
    { name:"성수", type:"heal", label:"회복", value:7, desc:"HP 7 회복", weight:6 },
    { name:"기적", type:"heal", label:"회복", value:11, desc:"HP 11 회복", weight:2 }
];

export const CARD_ART = {
    "철검":"sword","대검":"greatsword","천벌":"thunder","관통창":"spear",
    "흡혈검":"vampire","도박의 칼":"dice","나무 방패":"woodshield",
    "강철 방패":"steelshield","성벽":"wall","약초":"herb","성수":"water","기적":"miracle"
};

CARD_POOL.forEach(card => card.art = CARD_ART[card.name] || "sword");

export function weightedCard() {
  const total = CARD_POOL.reduce((sum, card) => sum + card.weight, 0);
  let random = Math.random() * total;

  for (const card of CARD_POOL) {
    random -= card.weight;
    if (random <= 0) {
      return {
        ...card,
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2)
      };
    }
  }

  return { ...CARD_POOL[0] };
}

export function newHand() {
  return Array.from({ length: HAND_SIZE }, weightedCard);
}

export function drawFor(hand, count = 1) {
  for (let i = 0; i < count; i++) hand.push(weightedCard());
}

export function removeAndRefill(hand, index) {
  hand.splice(index, 1);
  while (hand.length < HAND_SIZE) drawFor(hand);
}

export function displayValue(card) {
  if (card.gamble) return "?";
  if (card.type === "heal") return `+${card.value}`;
  if (card.type === "defense") return `-${card.value}`;
  return card.value;
}
