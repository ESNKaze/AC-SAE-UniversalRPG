// === 3_Context.js === UNIVERSAL MEMORY INJECTION + GENRE TAGS ===
const modifier = (text) => {
  [text, stop] = AutoCards("context", onContext_SAE(text), stop);

  const p = state.UniversalRPG?.player;
  if (!p) return { text, stop: false };

  // AUTO-PULL NAME FROM STORY (fallback to player.name)
  if (state.memory.context) {
    const nameMatch = state.memory.context.match(/My name is ([^\n,.]+)/i);
    if (nameMatch) p.name = nameMatch[1].trim();
  }

  // INJECT PLAYER STATS + TAGS INTO MEMORY (SAFE REPLACE)
  const inject = `[Player: ${p.name} | Lvl ${p.level} | HP ${p.health}/${p.maxHealth} | Class: ${p.class || "Adventurer"}]\n[Tags: ${p.storyTags.join(", ") || "None"}]`;

  // Remove old [Player...] block if exists
  state.memory.context = state.memory.context.replace(/\[Player:[^\]]*\]\n\[Tags:[^\]]*\]/g, '').trim();

  // Append new inject
  state.memory.context = (state.memory.context ? state.memory.context + "\n" : "") + inject;

  return { text, stop: false };
};

modifier(text);
