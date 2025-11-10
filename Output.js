// === AC-SAE + UNIVERSAL RPG OUTPUT MERGE ===
const modifier = (text) => {
  // === Run AC-SAE output first ===
  text = AutoCards("output", onOutput_SAE(text));

  // === UNIVERSAL RPG POST-PROCESSING ===
  const RPG = state.UniversalRPG;
  const p = RPG.player;

  // --- Handle Story Arc generation output ---
  if (RPG.generatingArc) {
    const arc = text.trim();
    const matches = arc.match(/^\d+\./gm);
    if (matches && matches.length >= 5) {
      RPG.storyArc = arc;
      state.message = [{ text: `\n📖 Story Arc Updated! 🌟\n`, mode: "append" }];
      RPG.generatingArc = false;
    } else {
      state.message = [{ text: `\n💔 Arc failed. Please /retry to try again.\n`, mode: "append" }];
      RPG.arcFailed = true;
    }
    // prevent the raw arc list from appearing in the story
    return { text: "" };
  }

  // --- Auto-tag genre hints ---
  const lower = text.toLowerCase();
  if ((lower.includes("cyber") || lower.includes("neon")) && !p.storyTags.includes("cyberpunk"))
    p.storyTags.push("cyberpunk");
  if ((lower.includes("curse") || lower.includes("ruin")) && !p.storyTags.includes("fantasy"))
    p.storyTags.push("fantasy");

  // --- Low health warning ---
  if (p.health < 30)
    text += `\n(The world darkens... your pulse falters. 💔)`;

  // --- Arc warning ---
  if ((RPG.turnCount + 1) % RPG.arcInterval === 0)
    text += `\n(Next story arc will generate soon... 💫)`;

  // --- Return processed text to AI Dungeon ---
  return { text };
};

modifier(text);
