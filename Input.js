// === 1_Input.js === SAE + UNIVERSAL HUD RPG (FULLY SYNCED + FREEFORM CLASSES + LVL CAP) ===
const modifier = (text) => {
  // === UNIVERSAL INIT ===
  if (!state.UniversalRPG) {
    state.UniversalRPG = {
      player: {
        name: "The Unnamed",
        level: 1,
        xp: 0,
        gold: 0,
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        stats: { stealth: 50, charm: 50, combat: 50, intellect: 50, luck: 50 },
        skills: ["Basic Combat", "Survival Instinct"],
        skillLevels: ["Novice", "Novice"],
        inventory: ["Rusty Knife", "Bandages"],
        equipped: { weapon: "Rusty Knife", ranged: null, armor: "Worn Cloak" },
        storyTags: [],
        class: "Adventurer",
        currentEnemy: "None"
      },
      turnCount: 0,
      arcInterval: 10,
      generatingArc: false,
      arcFailed: false
    };
  }

  const RPG = state.UniversalRPG;
  const p = RPG.player;
  const input = text.trim();

  // === SMART NAME SYNC ===
  if (state.character?.name && (!p.name || p.name === "The Unnamed")) {
    p.name = state.character.name.trim();
  }
  if ((!p.name || p.name === "The Unnamed") && text.match(/you are ([A-Z][A-Za-z' ]+)/i)) {
    const foundName = text.match(/you are ([A-Z][A-Za-z' ]+)/i)[1].trim();
    p.name = foundName;
  }
  if ((!p.name || p.name === "The Unnamed") && state.memory?.context) {
    const nameMatch =
      state.memory.context.match(/My name is ([^\n,.]+)/i) ||
      state.memory.context.match(/\[Player:\s*([A-Za-z0-9_ -]+)/i);
    if (nameMatch) p.name = nameMatch[1].trim();
  }

  // === STOP DURING GENERATION ===
  if (state.saveOutput || RPG.generatingArc) return { text, stop: false };

  // === SYNC AI-GENERATED STATS (boosted player priority) ===
  const levelMatches = [...text.matchAll(/(?:lvl|level|LVL)[:\s]*(\d+)/ig)];
  if (levelMatches.length > 0) {
    const lastLevelNum = parseInt(levelMatches[levelMatches.length - 1][1]);
    if (!isNaN(lastLevelNum)) {
      p.level = Math.max(1, Math.min(100, lastLevelNum));
      log(`Input Parsed/Capped Level: ${p.level}`);
    }
  }

  const classMatch = text.match(/(?:class|Class)[:\s]*([A-Za-z][A-Za-z\s]+?)(?=\s*(?:\.|,|\n|\]|\(|Subclass))/i);
  if (classMatch) {
    p.class = classMatch[1].trim();
    log(`Input Parsed Class: ${p.class}`);
  }

  // Player-specific HP/MP (post-command priority)
  const playerHpMatches = [...text.matchAll(/(?:you|player|kaito)[\s,]*HP[:\s]*(\d+)(?:\/(\d+))?/ig)];
  if (playerHpMatches.length > 0) {
    const lastPlayerHp = playerHpMatches[playerHpMatches.length - 1];
    const val = parseInt(lastPlayerHp[1]);
    if (lastPlayerHp[2]) {
      p.health = val;
      p.maxHealth = parseInt(lastPlayerHp[2]);
    } else {
      p.health = Math.round((val / 100) * p.maxHealth);
    }
    log(`Input Parsed PLAYER HP: ${p.health}/${p.maxHealth}`);
  }

  const playerMpMatches = [...text.matchAll(/(?:you|player|kaito)[\s,]*MP[:\s]*(\d+)(?:\/(\d+))?/ig)];
  if (playerMpMatches.length > 0) {
    const lastPlayerMp = playerMpMatches[playerMpMatches.length - 1];
    const val = parseInt(lastPlayerMp[1]);
    if (lastPlayerMp[2]) {
      p.mana = val;
      p.maxMana = parseInt(lastPlayerMp[2]);
    } else {
      p.mana = Math.round((val / 100) * p.maxMana);
    }
    log(`Input Parsed PLAYER MP: ${p.mana}/${p.maxMana}`);
  }

  // === HANDLE SLASH COMMANDS ===
  if (input.startsWith("/")) {
    const [rawCmd, ...args] = input.slice(1).split(" ");
    const cmd = rawCmd.toLowerCase();
    const arg = args.join(" ").trim();
    let response = "";

    switch (cmd) {
      // === STATUS / HUD DISPLAY ===
      case "status":
        state.message = [];
        const need = p.level * 1000; // Balanced XP scaling
        let levelMsg = "";
        if (p.xp >= need && p.level < 100) {
          p.level = Math.min(100, p.level + 1);
          p.xp -= need;
          p.maxHealth += 15;
          p.health = p.maxHealth;
          p.maxMana += 10;
          p.mana = p.maxMana;
          levelMsg = `\nLEVEL UP! Now Level ${p.level}. +15 Max HP, +10 Max MP.`;
        }

        const hudPrefix = p.storyTags.includes("romance")
          ? "Your heart flutters as a soft glow blooms in your vision"
          : p.storyTags.includes("fantasy")
          ? "A rune glows on your skin"
          : p.storyTags.includes("space")
          ? "Neural HUD boots up"
          : p.storyTags.includes("horror")
          ? "Your pulse spikes as red text burns in"
          : "Your visor flickers";

        response = `💠 **SYSTEM HUD ONLINE** 💠
[Player: ${p.name || "Unknown"} | Lvl ${p.level} | HP ${p.health}/${p.maxHealth} | MP ${p.mana}/${p.maxMana} | Class: ${p.class}]
[Tags: ${p.storyTags.join(", ") || "None"}]
[Target: ${p.currentEnemy || "None"}]

${hudPrefix} as the status display materializes before you.

**Name:** ${p.name}
**Class:** ${p.class || "Adventurer"} (${p.level < 10 ? "Rookie" : "Veteran"})
**Level:** ${p.level}
**Health:** ${p.health}/${p.maxHealth}
**Mana:** ${p.mana}/${p.maxMana}
**XP:** ${p.xp}/${p.level * 1000}

**Equipment:**
- ${p.equipped?.weapon || "Standard Weapon"}
- ${p.equipped?.ranged || "Sidearm"}
- ${p.equipped?.armor || "Standard Armor"}${levelMsg}`;
        break;

      // === INVENTORY ===
      case "inventory":
      case "inv":
        response = `Your neural interface flashes your inventory overlay:

**Inventory:** ${p.inventory?.join(", ") || "Empty"}
**Equipped:**
- Weapon: ${p.equipped?.weapon || "None"}
- Ranged: ${p.equipped?.ranged || "None"}
- Armor: ${p.equipped?.armor || "None"}`;
        break;

      // === EQUIPMENT ===
      case "equipment":
      case "gear":
        response = `Your gear overlay flashes across your visor:

**Head:** ${p.equipped?.head || "None"}
**Torso:** ${p.equipped?.armor || "Standard Armor"}
**Arms:** ${p.equipped?.arms || "None"}
**Legs:** ${p.equipped?.legs || "None"}
**Feet:** ${p.equipped?.feet || "None"}
**Primary Weapon:** ${p.equipped?.weapon || "None"}
**Secondary Weapon:** ${p.equipped?.ranged || "None"}
**Utility:** ${p.equipped?.utility || "None"}`;
        break;

      // === FREEFORM CLASS CHANGE ===
      case "class":
      case "changeclass":
        if (!arg) {
          response = `HUD Pulse: **Current Class: ${p.class || "Adventurer"}**\nUse: /class <your dream class> to become anything. e.g., /class Shadowblade Necromage`;
        } else {
          const newClass = arg.split(" ")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          p.class = newClass;
          response = `Class transformed: **${p.class}**. Neural pathways *rewoven*—power surges!`;
          log(`Freeform Class Set: ${p.class}`);
        }
        break;

      // === DYNAMIC /CLASSES ===
      case "classes":
        response = `💠 **HUD SCANS INFINITE ARCHETYPES** 💠\nNeural link queries the void...\n(Classes manifesting: Adventurer, Rift Walker, Blade Dancer, Mana Knight, Arcane Striker, Void Assassin, Starforged Healer... *and endless more!*)\nUse /class <any> to claim yours.`;
        break;

      // === EXPERIENCE ===
      case "exp":
      case "experience":
        response = `XP Overlay: **${p.xp}/${p.level * 1000}** (Level ${p.level})\nProgress stable.`;
        break;

      // === ADD EXPERIENCE ===
      case "addexp":
        const xp = parseInt(arg) || 10;
        p.xp += xp;
        let levelUps = 0;
        while (p.xp >= p.level * 1000 && p.level < 100) {
          p.level++;
          p.xp -= p.level * 1000;
          p.maxHealth += 15;
          p.health = p.maxHealth;
          p.maxMana += 10;
          p.mana = p.maxMana;
          levelUps++;
        }
        if (p.level >= 100) p.level = 100; // Hard cap
        response = `+${xp} XP gained. Progress: ${p.xp}/${p.level * 1000}.` + (levelUps > 0 ? `\nLEVEL UP x${levelUps}! Now Level ${p.level}. +${levelUps * 15} Max HP, +${levelUps * 10} Max MP.` : "");
        break;

      // === ADD GOLD ===
      case "addgold":
        const gold = parseInt(arg) || 10;
        p.gold += gold;
        response = `+${gold} credits acquired. Total: ${p.gold}.`;
        break;

      // === HELP MENU ===
      case "help":
        response = `**UNIVERSAL HUD COMMANDS**
/status – Display HUD
/inventory – View items
/equipment – View gear
/classes – Summon dynamic classes
/class <dream name> – Become ANY class!
/exp – View XP
/addexp <num> – Add XP
/addgold <num> – Add credits
/help – Show this`;
        break;

      // === TARGETING ===
      case "target":
      case "settarget":
        if (!arg) {
          const current = p.currentEnemy || "None";
          const list = p.enemies && Object.keys(p.enemies).length > 0 ? Object.keys(p.enemies).join(", ") : "No enemies detected.";
          response = `🎯 Current Target: **${current}**\nEnemies Known: ${list}\nUse **/target <name>** to change.`;
        } else {
          const name = arg.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          p.enemies ??= {};
          if (!p.enemies[name]) p.enemies[name] = { name, hp: 100, maxHp: 100 };
          p.currentEnemy = name;
          p.inCombat = true;
          if (!p.storyTags.includes("combat")) p.storyTags.push("combat");
          response = `🎯 Target locked on **${name}**.\nCombat mode engaged.`;
        }
        break;

      default:
        response = `Unknown command: /${cmd}. Type /help.`;
    }

    state.message = [{ text: `\n${response}\n`, mode: "replace" }];
    RPG.turnCount++;
    if (typeof state.turnNum_SAE !== "undefined") state.turnNum_SAE++;
    return { text: "", stop: true };
  }

  // === NORMAL TEXT HANDLING ===
  text = AutoCards("input", onInput_SAE(text));
  return { text };
};

modifier(text);
