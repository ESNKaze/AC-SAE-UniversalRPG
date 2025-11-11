const modifier = (text) => {
  [text, stop] = AutoCards("context", onContext_SAE(text), stop);
  const p = state.UniversalRPG?.player;
  if (p) {
    let inject = `[Player: ${p.name} | Lvl ${p.level} | HP ${p.health}/${p.maxHealth} | Class: ${p.class}]\n[Tags: ${p.storyTags.join(", ") || "None"}]`;
    state.memory.context = state.memory.context.replace(/\[Player:.*\n\[Tags:.*\]/, '') + `\n${inject}`;
  }
  return { text, stop: false };
};
modifier(text);
