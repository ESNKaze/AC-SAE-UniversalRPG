// === 2_Output.js === FULL BEAST + FLAVOR-SYNC: AI FLAVOR + COMBAT (HUD FIXED!) ===
const modifier = (text) => {
  try {
    text = AutoCards("output", onOutput_SAE(text));
    const lower = text.toLowerCase().trim();
    const p = state.UniversalRPG?.player;
    if (!p) return { text };

    // === SAFE INIT ===
    p.name ??= "The Unnamed";
    p.level ??= 1;
    p.health ??= 100;
    p.maxHealth ??= 100;
    p.mana ??= 100;
    p.maxMana ??= 100;
    p.class ??= "Adventurer";
    p.storyTags ??= [];
    p.enemies ??= {};
    p.currentEnemy ??= "None";
    p.inCombat ??= false;
    p.vengeance ??= 0;

    // === FLAVOR-SYNC: UPGRADED - GRABS Health/Mana % EVERYWHERE ===
    const nameMatch = text.match(/([A-Z][a-z]+)—?\s*(?:Level|lvl|LVL)/i);
    if (nameMatch) p.name = nameMatch[1].trim();

    const levelMatch = text.match(/(?:Level|lvl|LVL)[:\s]*(\d+)/i);
    if (levelMatch) p.level = parseInt(levelMatch[1]);

    const classMatch = text.match(/Level \d+ ([A-Za-z\s]+?)(?:\.|,|\n|$)/i) || 
                           text.match(/(?:class|Class):?\s*([A-Za-z\s]+?)(?:\.|,|\n|$)/i);
    if (classMatch) p.class = classMatch[1].trim();

    // FIXED HP: Health % → HP calc
    const hpMatch = text.match(/(?:HP|Health)[:\s]*(\d+)(?:\/(\d+)|%)/i);
    if (hpMatch) {
      const val = parseInt(hpMatch[1]);
      if (hpMatch[2]) {
        p.health = val;
        p.maxHealth = parseInt(hpMatch[2]);
      } else {
        p.health = Math.round((val / 100) * (p.maxHealth || 100));
      }
      log(`HP Synced: ${p.health}/${p.maxHealth}`);
    }

    // FIXED MP: Mana % → MP calc
    const mpMatch = text.match(/(?:MP|Mana)[:\s]*(\d+)(?:\/(\d+)|%)/i);
    if (mpMatch) {
      const val = parseInt(mpMatch[1]);
      if (mpMatch[2]) {
        p.mana = val;
        p.maxMana = parseInt(mpMatch[2]);
      } else {
        p.mana = Math.round((val / 100) * (p.maxMana || 100));
      }
      log(`MP Synced: ${p.mana}/${p.maxMana}`);
    }

    // === TARGET & ENEMY TRACKING ===
    const targetMatch = text.match(/Target:\s*([A-Za-z\s]+)/i);
    if (targetMatch) p.currentEnemy = targetMatch[1].trim();

    const enemyHpMatch = text.match(/([A-Za-z\s]+?)\s*\(Level \d+\)\s*HP[:\s]*(\d+)\/(\d+)/i);
    if (enemyHpMatch && p.currentEnemy) {
      const enemyName = enemyHpMatch[1].trim();
      const enemy = p.enemies[enemyName] || { name: enemyName, hp: 100, maxHp: 100 };
      enemy.hp = parseInt(enemyHpMatch[2]);
      enemy.maxHp = parseInt(enemyHpMatch[3]);
      p.enemies[enemyName] = enemy;
      if (enemy.hp <= 0) {
        delete p.enemies[enemyName];
        p.currentEnemy = "None";
        p.inCombat = false;
      }
    }

    // === COMBAT TRIGGERS ===
    if (lower.includes("kobold") || lower.includes("target") || lower.includes("attack")) {
      p.inCombat = true;
    }

    // === FIXED /status: BULLETPROOF DETECTION (checks input echo + lower) ===
    const isStatus = lower.includes("/status") || text.includes("You /status");
    if (isStatus) {
      p.inCombat = false;
      const playerHUD = 
        `💠 **FLAVOR + BATTLE HUD** 💠\n` +
        `[Player: ${p.name} | Lvl ${p.level} | HP ${p.health}/${p.maxHealth} | MP ${p.mana}/${p.maxMana} | Class: ${p.class}]\n` +
        `[Tags: ${p.storyTags.join(", ") || "None"}] | [Target: ${p.currentEnemy || "None"}]\n` +
        `[Vengeance: ${p.vengeance}/100 ${p.vengeance >= 100 ? "⚡" : ""}]`;

      text = `\n${playerHUD}\n\n${text}`;
      return { text };  // EARLY RETURN - HUD ALWAYS SHOWS
    }

    // === VENGEANCE & BATTLE LOGIC ===
    const alerts = [];
    const enemy = p.enemies[p.currentEnemy] || { hp: 0, maxHp: 100 };

    if (lower.match(/you (attack|strike|kill|shoot|slash)/i)) {
      const dmg = RPG_roll(20) + p.level;
      enemy.hp = Math.max(0, enemy.hp - dmg);
      alerts.push(`**VOID STRIKE! ${p.currentEnemy} -${dmg} HP → ${enemy.hp}/${enemy.maxHp} ⚔️**`);
      p.vengeance = (p.vengeance || 0) + 15;
    }

    if (p.vengeance >= 100) {
      p.vengeance = 0;
      p.health = Math.min(p.maxHealth, p.health + 30);
      alerts.push(`**DARKNESS UNLEASHED! +30 HP → ${p.health}/${p.maxHealth} 🩸**`);
    }

    if (lower.match(/(heal|restore|energy bar|mana surge)/i)) {
      const heal = RPG_roll(30) + 20;
      p.health = Math.min(p.maxHealth, p.health + heal);
      alerts.push(`**HEAL! +${heal} HP → ${p.health}/${p.maxHealth} ❤️**`);
    }

    // === IN-COMBAT BATTLE HUD ===
    if (p.inCombat && alerts.length > 0) {
      text = `\n🔥 **BATTLE HUD:** ${alerts.join(" | ")}\n` +
             `**HP: ${p.health}/${p.maxHealth} | MP: ${p.mana}/${p.maxMana} | Target: ${p.currentEnemy} (${enemy.hp}/${enemy.maxHp})**\n\n${text}`;
    }

    return { text };
  } catch (e) {
    log(`Full Beast Error: ${e.message}`);
    return { text };
  }
};

// === RPG ROLL ===
function RPG_roll(sides = 10) {
  return Math.floor(Math.random() * sides) + 1;
}

modifier(text);
