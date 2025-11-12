// === 3_Context.js === UNIVERSAL MEMORY INJECTION + GENRE TAGS + FREEFORM CLASS SYNC ===
const modifier = (text) => {
  let stop = false; // Initialize stop to avoid reference error
  [text, stop] = AutoCards("context", onContext_SAE(text), stop);

  const p = state.UniversalRPG?.player;
  if (!p) return { text, stop };

  // === SAFE INITIALIZATION (caps level 100, preserves freeform class) ===
  p.health ??= 100;
  p.maxHealth ??= 100;
  p.mana ??= 100;
  p.maxMana ??= 100;
  p.level ??= Math.min(100, 1); // CAP at 100
  if (!p.class) p.class = "Adventurer"; // Only default if unset
  p.storyTags ??= [];
  p.enemies ??= {};
  p.currentEnemy ??= "None";
  p.inCombat ??= false;

  // === ENSURE CONTEXT EXISTS ===
  state.memory.context ??= "";

  // === UNIVERSAL NAME SYNC ===
  if (!p.name || p.name === "The Unnamed") {
    if (state.character?.name) {
      p.name = state.character.name.trim();
    } else {
      const nameMatch =
        text.match(/you are ([^\n,]+)/i) ||
        text.match(/my name is ([^\n,]+)/i);
      if (nameMatch) p.name = nameMatch[1].trim();
    }
    if (!p.name) p.name = "The Unnamed";
  }

  // === NEW: BACKUP CLASS SYNC (catches freeform classes from AI output) ===
  const classMatch = text.match(/(?:class|Class)[:\s]*([A-Za-z][A-Za-z\s]+?)(?=\s*(?:\.|,|\n|\]|\(|$))/i);
  if (classMatch) {
    p.class = classMatch[1].trim();
    log(`Context Parsed Class: ${p.class}`);
  }

  // === ENEMY LIST BUILDER ===
  const enemiesList =
    Object.keys(p.enemies).length > 0
      ? Object.values(p.enemies)
          .map((e) => `${e.name} (${e.hp}/${e.maxHp})`)
          .join(", ")
      : "None";

  // === CONTEXT HUD INJECTION (emphasizes freeform class) ===
  const inject =
    `[Player: ${p.name} | Lvl ${p.level} | HP ${p.health}/${p.maxHealth} | MP ${p.mana}/${p.maxMana} | Class: ${p.class}]\n` +
    `[Tags: ${p.storyTags.length ? p.storyTags.join(", ") : "None"}]\n` +
    `[Enemies: ${enemiesList} | Target: ${p.currentEnemy || "None"}]\n` +
    `[State: ${p.inCombat ? "IN COMBAT" : "CALM"}]\n` +
    `[Class Profile: As a ${p.class}, you wield unique powers shaped by your choices.]`;

  // === CLEAN OLD BLOCKS ===
  state.memory.context = state.memory.context
    .replace(
      /\[Player:[^\]]*\]\n\[Tags:[^\]]*\]\n\[Enemies:[^\]]*\]\n(?:\[State:[^\]]*\])?\n?(?:\[Class Profile:[^\]]*\])?/g,
      ""
    )
    .trim();

  // === ADD UPDATED BLOCK ===
  state.memory.context =
    (state.memory.context ? state.memory.context + "\n" : "") + inject;

  // === AUTO SYNC VITALS ===
  const syncLine = `Vitals Synced → HP ${p.health}/${p.maxHealth}, MP ${p.mana}/${p.maxMana}, Class: ${p.class}.`;
  if (!state.memory.context.includes(syncLine)) {
    state.memory.context += `\n${syncLine}`;
  }

  // === COMBAT TAGGING ===
  if (p.inCombat) {
    if (!p.storyTags.includes("combat")) p.storyTags.push("combat");
  } else {
    p.storyTags = p.storyTags.filter((tag) => tag !== "combat");
  }

  return { text, stop };
};

modifier(text);
