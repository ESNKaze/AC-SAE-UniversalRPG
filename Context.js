// === 3_Context.js === UNIVERSAL MEMORY INJECTION + GENRE TAGS ===
const modifier = (text) => {
  [text, stop] = AutoCards("context", onContext_SAE(text), stop);

  const p = state.UniversalRPG?.player;
  if (!p) return { text, stop: false };

  // ENSURE state.memory.context EXISTS
  if (!state.memory.context) state.memory.context = "";

  // AUTO-PULL NAME FROM STORY
  const nameMatch = state.memory.context.match(/My name is ([^\n,.]+)/i);
  if (nameMatch) p.name = nameMatch[1].trim();

  // INJECT PLAYER STATS + TAGS (SAFE REPLACE)
  const inject = `[Player: ${p.name} | Lvl ${p.level} | HP ${p.health}/${p.maxHealth} | Class: ${p.class || "Adventurer"}]\n[Tags: ${p.storyTags.join(", ") || "None"}]`;

  // Remove ALL old [Player...] blocks
  state.memory.context = state.memory.context.replace(/\[Player:[^\]]*\]\n\[Tags:[^\]]*\][\n]*/g, '').trim();

  // Append fresh inject
  state.memory.context = (state.memory.context ? state.memory.context + "\n" : "") + inject;

  return { text, stop: false };
};

modifier(text);
