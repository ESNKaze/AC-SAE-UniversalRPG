// === AC-SAE + UNIVERSAL RPG INPUT MERGE ===
const modifier = (text) => {
    // === Allow SAE to run its own arc generation ===
    if (typeof generatingArc !== "undefined" && generatingArc) {
        // Let the arcPrompt go straight through to the AI
        return { text: text, stop: false };
    }

    // === RPG COMMAND SYSTEM ===
    const RPG = state.UniversalRPG;
    const p = RPG.player;
    const input = text.trim();
    RPG.turnCount++;

    if (input.startsWith("/")) {
        const [rawCmd, ...args] = input.slice(1).split(" ");
        const cmd = rawCmd.toLowerCase();
        const arg = args.join(" ").toLowerCase();
        let response = "";

        switch (cmd) {
            case "status":
                const stats = Object.entries(p.stats)
                    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                    .join(" | ");
                const levelMsg = RPG_checkLevelUp() || "";
                response = `🧍 **${p.name}** (Level ${p.level})
❤️ HP: ${p.health}/${p.maxHealth}   💫 XP: ${p.xp}/${p.level * 100}
⚔️ Class: ${p.class || "Adventurer"}   💰 Gold: ${p.gold}
${stats}
🎭 Skills: ${p.skills.join(", ") || "None"}
${levelMsg}`;
                break;

            case "inventory":
            case "inv":
                const eq = Object.entries(p.equipped)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ") || "Nothing equipped";
                response = `🎒 **Inventory:** ${p.inventory.join(", ") || "Empty"}
💍 **Equipped:** ${eq}`;
                break;

            case "equipment":
            case "equip":
                const eqList = Object.entries(p.equipped)
                    .map(([slot, item]) => `${slot}: ${item || "None"}`)
                    .join(" | ");
                response = `🧤 **Equipment:** ${eqList}`;
                break;

            case "changeclass":
            case "class":
                if (!arg) {
                    response = `💼 Current class: **${p.class || "Adventurer"}**.
Use: /changeclass <name>`;
                } else {
                    p.class = arg.charAt(0).toUpperCase() + arg.slice(1);
                    response = `🔄 Class changed to **${p.class}**!`;
                }
                break;

            case "exp":
            case "experience":
                const need = p.level * 100;
                response = `💫 XP: ${p.xp}/${need} (Level ${p.level})`;
                break;

            case "addexp":
                const xp = parseInt(arg) || 10;
                p.xp += xp;
                response = `✨ Gained ${xp} XP! ${RPG_checkLevelUp() || ""}`;
                break;

            case "addgold":
                const gold = parseInt(arg) || 10;
                p.gold += gold;
                response = `💰 You gained ${gold} gold. (Total: ${p.gold})`;
                break;

            case "help":
                response = `💋 **Available Commands**
/status – Show full stats.
/inventory – List your items.
/equipment – Show equipped gear.
/class or /changeclass <name> – Change your class.
/exp – View experience.
/addexp <amount> – Add XP.
/addgold <amount> – Add gold.
/help – Show this menu.`;
                break;

            default:
                response = `❓ Unknown command: /${cmd}`;
        }

        state.message = [{ text: `\n${response}\n`, mode: "replace" }];
        return { text: "", stop: true };
    }

    // === Normal SAE + AutoCards handling ===
    text = AutoCards("input", onInput_SAE(text));
    return { text };
};

modifier(text);
