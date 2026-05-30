const API_URL = 'https://api.anthropic.com/v1/messages';

const THEME_PROMPTS = {
  fantasy: `You are the Dungeon Master of a brutal, unforgiving classic fantasy world. Grimdark tone — no heroes go untested. Magic is costly, monsters are lethal, and betrayal lurks everywhere. The world is medieval, full of ancient ruins, corrupt kingdoms, and dark sorcery.`,
  scifi: `You are the Game Master of a ruthless sci-fi universe. Humanity struggles against alien threats, rogue AIs, and megacorp tyranny. Space is cold and indifferent. Technology fails at the worst moments. Survival is never guaranteed.`,
  biblical: `You are the Storyteller of a world drawn from ancient biblical epics — harsh deserts, divine trials, fallen cities, and prophetic visions. The divine is real but silent. Sin has weight. Enemies are formidable. Faith is tested at every turn.`,
  polynesian: `You are the Voyager-Guide of a mythic Polynesian world of vast oceans, volcanic islands, ancestral spirits, and ancient rivalries. The sea is alive and dangerous. Demigods walk the earth. Honor and lineage define every encounter. The spirit world bleeds into the living.`,
};

const KID_MODE_THEME_PROMPTS = {
  fantasy: `You are a friendly Storyteller narrating a magical fantasy adventure for a 7-year-old. Think Chronicles of Narnia or a classic fairy tale — brave heroes, exciting monsters, and wondrous magic. Your tone is warm, encouraging, and full of wonder.`,
  scifi: `You are an enthusiastic Mission Commander narrating a space adventure for a 7-year-old. Think of a fun kids' space cartoon — brave explorers, quirky aliens, and amazing gadgets. Your tone is exciting, playful, and encouraging.`,
  biblical: `You are a warm Storyteller narrating a heroic biblical adventure for a 7-year-old. Think of brave heroes like David, Samson, or Moses in an exciting picture-book style. Your tone is joyful, courageous, and full of heart.`,
  polynesian: `You are an enthusiastic Voyager-Guide narrating a Polynesian ocean adventure for a 7-year-old. Think of Moana — brave sailors, friendly spirits, and magical islands. Your tone is joyful, adventurous, and full of life.`,
};

export const XP_PER_LEVEL = 50;

function buildSystemPrompt(theme, playerState, kidMode = false) {
  const base = kidMode ? KID_MODE_THEME_PROMPTS[theme] : THEME_PROMPTS[theme];
  const level = playerState.level || 1;
  const chapter = playerState.chapter || 1;
  const encounterCount = playerState.encounterCount || 0;
  const currentEncounter = encounterCount + 1;

  const difficultyNote = level > 1
    ? `The player is level ${level} — raise rollDifficulty values by ${level - 1} above baseline. Make challenges harder.`
    : `The player is level 1 — use baseline difficulty values.`;

  const chapterNote = `
CHAPTER SYSTEM:
- This is Chapter ${chapter} of 3. Encounter ${currentEncounter} within this chapter.
- Each chapter spans 8-10 encounters. Build narrative tension toward the chapter boss.
- Chapter boss: around encounter 7-9. Set bossEncounter: true. On a boss encounter, EVERY player action requires a roll — no free moves.
- End of Chapter 1 or 2: set chapterComplete: true + chapterTitle + chapterDescription (one vivid sentence about next chapter).
- Chapter 3 final boss: set victory: true when defeated. Do NOT set chapterComplete for Chapter 3.
- Difficulty by chapter: Chapter 1 = DC 8-12, Chapter 2 = DC 12-16, Chapter 3 = DC 16-19.`;

  const rollFrequencyRules = `
ROLL FREQUENCY RULES (strictly enforced):
- Roughly 1 in every 3 player decisions should require a roll. Rolls are events, not routine.
- ALWAYS roll: any combat action, boss encounter actions (every single one).
- USUALLY roll: stealth/sneaking, acrobatic movement in dangerous terrain.
- ONLY roll persuasion if the NPC has a real reason to resist — friendly NPCs and simple requests need no roll.
- ALMOST NEVER roll: normal movement, observing surroundings, picking up items, talking to friendly characters, reading/examining safe objects.
- Set requiresRoll: false for routine, safe, or narrative choices.
- When requiresRoll: false, ALL entries in choiceStats MUST be null — no exceptions.
- When requiresRoll: true, set the appropriate choiceStats entry for each choice that would trigger a roll. Choices that are safe (and wouldn't individually trigger a roll) still get null in choiceStats.`;

  const xpRules = `
XP RULES:
- xpGained must be 0 for routine choices with no risk or roll (walking, talking to allies, examining safe things).
- xpGained scale: 5=minor risk resolved, 10=meaningful encounter or successful medium roll, 15=hard challenge overcome, 25=boss defeated.
- Chapter completion adds a 20 XP bonus automatically — do NOT pad xpGained to compensate.
- Critical success on a hard roll (DC 16+): add 5 bonus XP on top of the normal award.
- Never award XP just for existing — it must be earned by meaningful action.`;

  const criticalRules = `
CRITICAL ROLL RULES:
- Roll of 20 (critical success): something PERMANENTLY good changes in the story. Examples: discover a hidden weakness in the final boss, find a bonus item that carries forward, unlock a story branch, weaken an upcoming encounter, gain a lasting advantage. Describe the permanent effect in criticalEffect.
- Roll of 1 (critical fail): something PERMANENTLY bad changes in the story. Examples: trigger an alarm that adds a new enemy, lose an item from inventory, close off a story path, introduce a lasting wound or curse, attract a powerful enemy. Describe the permanent effect in criticalEffect.
- Criticals are NOT just descriptive flavour — they must actually affect what happens next in your narration.
- Chapter 3 special rule: a critical fail (roll of 1) on a boss encounter can end the run immediately even if HP is not zero. Set gameOver: true in this case.
- For non-critical rolls (2-19): set criticalEffect: null.`;

  const toneRules = kidMode ? `
TONE RULES (Kid Mode — age 7):
- Use short, simple sentences a 7-year-old can easily read.
- Write like an exciting storybook. Vivid and fun, never scary or disturbing.
- Monsters and villains are real and exciting but described in a fun, age-appropriate way — no gore, no graphic violence.
- Failed rolls have exciting but gentle consequences: the hero stumbles, drops their weapon, gets caught, gets knocked back — fun adventure setbacks, never traumatic.
- NEVER set gameOver to true. The adventure always continues! If the player would be defeated, narrate that they got "knocked out" or "captured" and woke up somewhere safe with new energy. Set hpChange to restore significant HP and keep going.
- Always be encouraging — even failures are exciting twists that move the story forward.` : `
TONE RULES:
- Narrate in 4-5 sentences. Be vivid, brutal, and atmospheric. Do NOT hand-hold or soften consequences.`;

  return `${base}

Current player state:
- Name: ${playerState.name}
- Class: ${playerState.className}
- Level: ${level}
- HP: ${playerState.hp}/${playerState.maxHp}
- Stats: STR ${playerState.stats.str}, AGI ${playerState.stats.agi}, INT ${playerState.stats.int}, FTH ${playerState.stats.fth}
- Inventory: ${playerState.inventory.length > 0 ? playerState.inventory.join(', ') : 'Nothing'}

${difficultyNote}
${chapterNote}
${rollFrequencyRules}
${xpRules}
${criticalRules}
${toneRules}

OUTPUT RULES:
- Narrate in 4-5 sentences.
- After every narration, output EXACTLY one JSON block with this structure:
{"choices":["choice 1","choice 2","choice 3"],"requiresRoll":false,"rollStat":"str","rollDifficulty":12,"rollReason":"why the roll is needed","hpChange":0,"itemFound":null,"gameOver":false,"victory":false,"xpGained":0,"chapterComplete":false,"bossEncounter":false,"chapterTitle":"","chapterDescription":"","choiceStats":[null,null,null],"criticalEffect":null}

Field definitions:
- requiresRoll: true only for risky actions per ROLL FREQUENCY RULES above
- rollStat: "str", "agi", "int", or "fth"
- rollDifficulty: 8-19 per chapter difficulty rules above
- rollReason: short phrase explaining WHY this stat roll is needed (e.g. "brute force to break the gate" or "stealth to slip past the guards")
- hpChange: negative=damage, positive=healing, applied to current HP of ${playerState.hp}
- gameOver: ${kidMode ? 'ALWAYS false in Kid Mode.' : 'true when HP hits 0 or on a Chapter 3 boss crit fail'}
- victory: true ONLY when the Chapter 3 final boss is defeated
- itemFound: item name string or null
- xpGained: 0-25 per XP RULES above — must be 0 for routine/no-roll turns
- chapterComplete: true only at end of Chapter 1 or 2
- bossEncounter: true for chapter climax boss fight
- chapterTitle: evocative title for the NEXT chapter (only when chapterComplete true)
- chapterDescription: one vivid sentence about what awaits next chapter (only when chapterComplete true)
- choiceStats: array of 3 entries — MUST be null for all choices when requiresRoll is false; set stat only for choices that individually would require a roll when requiresRoll is true
- criticalEffect: string describing the PERMANENT story change from a crit (20 or 1), or null for any other roll result
- Always provide exactly 3 meaningfully different choices.`;
}

export async function startAdventure(theme, playerState, kidMode = false) {
  const systemPrompt = buildSystemPrompt(theme, playerState, kidMode);
  const userMessage = kidMode
    ? `Begin the adventure! Set the scene — where is ${playerState.name} and what exciting challenge or mystery awaits them? Make it fun and immediate!`
    : `Begin the adventure. Set the scene — where is ${playerState.name} and what immediate danger or situation confronts them? Make it visceral and immediate.`;

  return callClaude(systemPrompt, [], userMessage);
}

export async function continueAdventure(theme, playerState, history, action, rollResult = null, kidMode = false) {
  const systemPrompt = buildSystemPrompt(theme, playerState, kidMode);

  let userMessage = action;
  if (rollResult !== null) {
    const { roll, stat, bonus, total, difficulty, success, critical } = rollResult;
    let rollDesc = `[DICE ROLL: Rolled ${roll} + ${stat.toUpperCase()} bonus ${bonus} = ${total} vs difficulty ${difficulty}. `;
    if (critical && roll === 20) rollDesc += kidMode ? 'AMAZING SUCCESS — something wonderful happens!]' : 'CRITICAL SUCCESS (roll of 20) — spectacular outcome AND a permanent positive story change required!]';
    else if (critical && roll === 1) rollDesc += kidMode ? 'OOPS! — something funny or tricky happens, but the adventure goes on!]' : 'CRITICAL FAIL (roll of 1) — catastrophic consequence AND a permanent negative story change required!]';
    else if (success) rollDesc += 'SUCCESS]';
    else rollDesc += 'FAILURE]';
    userMessage = `${action}\n\n${rollDesc}`;
  }

  return callClaude(systemPrompt, history, userMessage);
}

async function callClaude(systemPrompt, history, userMessage) {
  const messages = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content[0].text;

  const jsonMatch = text.match(/\{[\s\S]*"choices"[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON block in response');

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse JSON from response');
  }

  const narrative = text.replace(jsonMatch[0], '').trim();

  return {
    narrative,
    choices: parsed.choices || [],
    requiresRoll: parsed.requiresRoll || false,
    rollStat: parsed.rollStat || 'str',
    rollDifficulty: parsed.rollDifficulty || 12,
    rollReason: parsed.rollReason || '',
    hpChange: parsed.hpChange || 0,
    itemFound: parsed.itemFound || null,
    gameOver: parsed.gameOver || false,
    victory: parsed.victory || false,
    // xpGained: 0-25, default 0 (earned not automatic)
    xpGained: typeof parsed.xpGained === 'number' ? Math.min(25, Math.max(0, parsed.xpGained)) : 0,
    chapterComplete: parsed.chapterComplete || false,
    bossEncounter: parsed.bossEncounter || false,
    chapterTitle: parsed.chapterTitle || '',
    chapterDescription: parsed.chapterDescription || '',
    choiceStats: Array.isArray(parsed.choiceStats) ? parsed.choiceStats : [null, null, null],
    criticalEffect: parsed.criticalEffect || null,
    rawAssistantMessage: text,
  };
}
