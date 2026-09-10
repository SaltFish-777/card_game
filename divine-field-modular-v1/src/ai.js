// AI의 카드 선택 판단만 담당합니다.
export function chooseAiDefense(enemyHand, incomingDamage) {
  const shields = enemyHand
    .map((card, index) => ({ card, index }))
    .filter(item => item.card.type === "defense")
    .sort((a, b) => a.card.value - b.card.value);

  if (!shields.length) return -1;

  const enough = shields.find(item => item.card.value >= incomingDamage);
  if (enough && Math.random() < 0.85) return enough.index;
  if (incomingDamage >= 7) return shields[shields.length - 1].index;
  return Math.random() < 0.45 ? shields[0].index : -1;
}

export function chooseAiCard(enemyHand, enemyHp) {
  if (enemyHp <= 18) {
    const heals = enemyHand
      .map((card, index) => ({ card, index }))
      .filter(item => item.card.type === "heal")
      .sort((a, b) => b.card.value - a.card.value);

    if (heals.length && Math.random() < 0.7) return heals[0].index;
  }

  const attacks = enemyHand
    .map((card, index) => ({ card, index }))
    .filter(item => item.card.type === "attack" || item.card.type === "special");

  if (attacks.length) {
    attacks.sort((a, b) => (b.card.value || 7) - (a.card.value || 7));
    return Math.random() < 0.6
      ? attacks[0].index
      : attacks[Math.floor(Math.random() * attacks.length)].index;
  }

  const heals = enemyHand
    .map((card, index) => ({ card, index }))
    .filter(item => item.card.type === "heal");

  if (heals.length) return heals[0].index;
  return Math.floor(Math.random() * enemyHand.length);
}
