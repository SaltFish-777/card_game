import { configureUI } from "./ui.js";
import { resetGame, playPlayerCard, defendWith, skipDefense, getState } from "./battle.js";

configureUI({
  onRestart: resetGame,
  onSkipDefense: skipDefense,
  onCardClick: index => {
    const state = getState();
    if (!state || state.gameOver) return;

    if (state.phase === "defense") defendWith(index);
    else if (state.phase === "player") playPlayerCard(index);
  }
});

resetGame();
