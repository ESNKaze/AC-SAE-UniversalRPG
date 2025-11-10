// === AC-SAE + UNIVERSAL RPG CONTEXT MERGE ===
const modifier = (text) => {
  // === Run AC-SAE base context logic first ===
  [text, stop] = AutoCards("context", onContext_SAE(text), stop);

  // === UNIVERSAL RPG CONTEXT INJECTION ===
  const RPG = state.UniversalRPG;
  const p = RPG.player;

  if (RPG && p) {
    state.memory.context += `
[Player: ${p.name} | Lvl ${p.level} | HP ${p.health}/${p.maxHealth} | Skills: ${p.skills.join(", ") || "None"}]
[Tags: ${p.storyTags.join(", ") || "None"}]`;

    if (RPG.storyArc)
      state.memory.context += `\n[Story Arc: ${RPG.storyArc}]`;
    if (RPG.generatingArc)
      state.memory.context += `\n[Generating Arc in progress...]`;
  }

  // === Return updated context ===
  return { text, stop: false };
};

modifier(text);
