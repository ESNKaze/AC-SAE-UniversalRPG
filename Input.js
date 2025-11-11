// === 1_Input.js === SAE + UNIVERSAL HUD RPG (ANY NAME) ===
const modifier = (text) => {
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
        class: "Adventurer"
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

  // AUTO-PULL NAME FROM STORY MEMORY
  if (state.memory.context) {
    const nameMatch = state.memory.context.match(/My name is ([^\n,.]+)/i);
    if (nameMatch) p.name = nameMatch[1].trim();
  }

  if (state.saveOutput || RPG.generatingArc) {
    return { text, stop: false };
  }

  if (input.startsWith("/")) {
    const [rawCmd, ...args] = input.slice(1).split(" ");
    const cmd = rawCmd.toLowerCase();
    const arg = args.join(" ").toLowerCase();
    let response = "";

    switch (cmd) {
      case "status":
        let levelMsg = "";
        const need = p.level * 100;
        if (p.xp >= need) {
          p.level++;
          p.xp -= need;
          p.maxHealth += 15;
          p.health = p.maxHeart || p.maxHealth;
          levelMsg = `\nLEVEL UP! Now Level ${p.level}. +15 Max HP.`;
        }

        // FIXED: Clean line breaks + proper string
        const hudPrefix = p.storyTags.includes("romance") ? "Your heart flutters as a soft glow blooms in your vision" :
                          p.storyTags.includes("fantasy") ? "A rune glows on your skin" :
                          p.storyTags.includes("space") ? "Neural HUD boots up" :
                          p.storyTags.includes("horror") ? "Your pulse spikes as red text burns in" :
                          "Your visor flickers";

        response = `${hudPrefix} as the status display appears in your line of sight:

**Name:** ${p.name}
**Class:** ${p.class || "Adventurer"} (${p.level < 10 ? "Rookie" : "Veteran"})
**Level:** ${p.level}
**Health:** ${p.health}/${p.maxHealth}
**Mana:** ${p.mana || 100}/${p.maxMana || 100}

**Equipment:**
- ${p.equipped.weapon || "Standard Weapon"}
- ${p.equipped.ranged || "Sidearm"}
- ${p.equipped.armor || "Standard Armor"}

**Skills:**
- ${p.skills[0] || "Combat Training"} (${p.skillLevels?.[0] || "Proficient"})
- ${p.skills[1] || "Stealth"} (${p.skillLevels?.[1] || "Competent"})
- ${p.skills[2] || "Survival"} (${p.skillLevels?.[2] || "Basic"})

**Experience Points:** ${p.xp}/${p.level * 100}

Your health is slightly depleted from recent action, but not critically so. Energy levels remain stable. Your primary weapon hums faintly at your side, ready for the next move.${levelMsg}`;
        break;

      // ... (rest of cases unchanged — inventory, class, etc.)
      case "inventory":
      case "inv":
        response = `Your neural interface flashes an inventory overlay across your vision:

**Inventory:** ${p.inventory.join(", ") || "Empty"}
**Equipped:**
- Weapon: ${p.equipped.weapon || "None"}
- Ranged: ${p.equipped.ranged || "None"}
- Armor: ${p.equipped.armor || "None"}

Gear check complete. Ready to proceed.`;
        break;

      case "equipment":
      case "equip":
        response = `HUD Equipment Scan:
- Weapon: ${p.equipped.weapon || "None"}
- Ranged: ${p.equipped.ranged || "None"}
- Armor: ${p.equipped.armor || "None"}`;
        break;

      case "class":
      case "changeclass":
        if (!arg) {
          response = `HUD Pulse: **Current Class: ${p.class || "Adventurer"}**\nUse: /class <name> to change.`;
        } else {
          p.class = arg.charAt(0).toUpperCase() + arg.slice(1);
          response = `Class updated: **${p.class}**. Neural pathways realigned.`;
        }
        break;

      case "exp":
      case "experience":
        response = `XP Overlay: **${p.xp}/${p.level * 100}** (Level ${p.level})\nProgress stable.`;
        break;

      case "addexp":
        const xp = parseInt(arg) || 10;
        p.xp += xp;
        response = `+${xp} XP gained. ${RPG_checkLevelUp() || ""}`;
        break;

      case "addgold":
        const gold = parseInt(arg) || 10;
        p.gold += gold;
        response = `+${gold} credits. Total: ${p.gold}`;
        break;

      case "help":
        response = `**UNIVERSAL HUD COMMANDS**
/status – Visor HUD
/inventory – Gear check
/equipment – Equipped scan
/class <name> – Change role
/exp – Progress
/addexp <num> – Gain XP
/addgold <num> – Gain credits
/help – This menu`;
        break;

      default:
        response = `Unknown command: /${cmd}`;
    }

    state.message = [{ text: `\n${response}\n`, mode: "replace" }];
    RPG.turnCount++;
    if (typeof state.turnNum_SAE !== 'undefined') state.turnNum_SAE++;
    return { text: "", stop: true };
  }

  text = AutoCards("input", onInput_SAE(text));
  return { text };
};

modifier(text);
