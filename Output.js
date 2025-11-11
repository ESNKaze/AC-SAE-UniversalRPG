// === 2_Output.js === UNIVERSAL POST-PROCESS + GENRE WARNINGS ===
const modifier = (text) => {
  text = AutoCards("output", onOutput_SAE(text));
  const p = state.UniversalRPG?.player;
  if (!p) return { text };

  // GENRE-SPECIFIC LOW HEALTH WARNING
  if (p.health < 30) {
    if (p.storyTags.includes("romance")) {
      text += `\n(Your heart aches... the world blurs with unshed tears. 💔)`;
    } else if (p.storyTags.includes("horror")) {
      text += `\n(The shadows close in... your breath catches in terror. 😱)`;
    } else if (p.storyTags.includes("fantasy")) {
      text += `\n(The magic fades... your strength ebbs like dying starlight. ✨)`;
    } else if (p.storyTags.includes("space")) {
      text += `\n(Alarms blare... life support flickers. 🚨)`;
    } else {
      text += `\n(The world darkens... your pulse falters. 💔)`;
    }
  }

  // ROMANCE: Add heartbeat if affection high
  if (p.storyTags.includes("romance") && p.affection?.level > 70) {
    text += `\n(Your heart races at the thought of *them*... ❤️)`;
  }

  return { text };
};

modifier(text);
