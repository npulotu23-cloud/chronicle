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
  const currentEncounter = encounterCount + 1; // 1-based encounter number in this chapter

  const difficultyNote = level > 1
    ? `The player is level ${level} — scale encounter difficulty accordingly. Raise rollDifficulty values by ${level - 1} above your baseline. Make challenges bigger and harder.`
    : `The player is level 1 — use baseline difficulty values.`;

  const chapterNote = `
CHAPTER SYSTEM:
- This is Chapter ${chapter} of 3. Encounter ${currentEncounter} within this chapter.
- Each chapter spans 8-10 encounters. Build narrative tension toward the chapter boss.
- Chapter boss encounter: happens around encounter 7-9. Set bossEncounter: true for the climactic fight. Boss encounters have rollDifficulty +2 above normal.
- When the chapter's story arc resolves (encounter 8+): set chapterComplete: true. Provide a chapterTitle (short, evocative) and chapterDescription (one vivid sentence about what lies ahead in the next chapter).
- Chapter 3 is the final chapter. Its boss is the last challenge of the entire adventure — set victory: true when the player defeats it. Do NOT set chapterComplete: true for Chapter 3.
- Only Chapters 1 and 2 use chapterComplete. Chapter 3 ends only via victory.`;

  const toneRules = kidMode ? `
TONE RULES (Kid Mode — age 7):
- Use short, simple sentences a 7-year-old can easily read.
- Write like an exciting storybook. Vivid and fun, never scary or disturbing.
- Monsters and villains are real and exciting but described in a fun, age-appropriate way — no gore, no graphic violence.
- Failed rolls have exciting but gentle consequences: the hero stumbles, drops their weapon, gets caught, gets knocked back — fun adventure setbacks, never traumatic.
- NEVER set gameOver to true. The adventure always continues! If the player would be defeated, narrate that they got "knocked out" or "captured" and woke up somewhere safe with new energy. Set hpChange to restore significant HP and keep going.
- Always be encouraging — even failures are exciting twists that move the story forward.
- Keep the tone like a kids' movie: action-packed but always hopeful.` : `
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
${toneRules}

RULES:
- Narrate in 4-5 sentences.
- After every narration, output EXACTLY one JSON block with this structure:
{"choices":["choice 1","choice 2","choice 3"],"requiresRoll":false,"rollStat":"str","rollDifficulty":12,"rollReason":"why they roll","hpChange":0,"itemFound":null,"gameOver":false,"victory":false,"xpGained":10,"chapterComplete":false,"bossEncounter":false,"chapterTitle":"","chapterDescription":"","choiceStats":[null,null,null]}
- requiresRoll: true for risky actions (combat, stealth, persuasion, miracles, dangerous movement)
- rollStat: "str", "agi", "int", or "fth" — the primary stat for the roll
- rollDifficulty: 8=easy, 12=medium, 16=hard, 19=legendary (scaled up by level)
- hpChange: negative for damage, positive for healing. Apply to current HP of ${playerState.hp}.
- gameOver: ${kidMode ? 'ALWAYS false — NEVER set to true in Kid Mode.' : 'true ONLY when HP would drop to 0 or below'}
- victory: true ONLY when the final Chapter 3 boss is defeated
- itemFound: string name of item found, or null
- xpGained: integer 10-20. 10=trivial, 15=standard encounter, 20=boss or major beat. Never 0.
- chapterComplete: true only at the END of Chapter 1 or Chapter 2 (not Chapter 3)
- bossEncounter: true for the chapter's climactic boss fight
- chapterTitle: short title for the NEXT chapter (e.g. "The Betrayal" or "Into the Void") — only when chapterComplete is true
- chapterDescription: one vivid sentence about what awaits in the next chapter — only when chapterComplete is true
- choiceStats: array matching choices — each entry is the stat tag for that choice ("str","agi","int","fth") if it requires a roll, or null if it does not. Even when requiresRoll is false, individual risky choices can have a stat tag.
- Always provide exactly 3 choices. Make them meaningfully different.`;
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
    if (critical && roll === 20) rollDesc += kidMode ? 'AMAZING SUCCESS — something wonderful happens!]' : 'CRITICAL SUCCESS — spectacular outcome!]';
    else if (critical && roll === 1) rollDesc += kidMode ? 'OOPS! — something funny or tricky happens, but the adventure goes on!]' : 'CRITICAL FAIL — catastrophic consequence!]';
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
    xpGained: typeof parsed.xpGained === 'number' ? Math.min(20, Math.max(10, parsed.xpGained)) : 10,
    chapterComplete: parsed.chapterComplete || false,
    bossEncounter: parsed.bossEncounter || false,
    chapterTitle: parsed.chapterTitle || '',
    chapterDescription: parsed.chapterDescription || '',
    choiceStats: Array.isArray(parsed.choiceStats) ? parsed.choiceStats : [null, null, null],
    rawAssistantMessage: text,
  };
}
