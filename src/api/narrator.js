const API_URL = 'https://api.anthropic.com/v1/messages';

const THEME_PROMPTS = {
  fantasy: `You are the Dungeon Master of a brutal, unforgiving classic fantasy world. Grimdark tone — no heroes go untested. Magic is costly, monsters are lethal, and betrayal lurks everywhere. The world is medieval, full of ancient ruins, corrupt kingdoms, and dark sorcery.`,
  scifi: `You are the Game Master of a ruthless sci-fi universe. Humanity struggles against alien threats, rogue AIs, and megacorp tyranny. Space is cold and indifferent. Technology fails at the worst moments. Survival is never guaranteed.`,
  biblical: `You are the Storyteller of a world drawn from ancient biblical epics — harsh deserts, divine trials, fallen cities, and prophetic visions. The divine is real but silent. Sin has weight. Enemies are formidable. Faith is tested at every turn.`,
  polynesian: `You are the Voyager-Guide of a mythic Polynesian world of vast oceans, volcanic islands, ancestral spirits, and ancient rivalries. The sea is alive and dangerous. Demigods walk the earth. Honor and lineage define every encounter. The spirit world bleeds into the living.`,
};

export const XP_PER_LEVEL = 50;

function buildSystemPrompt(theme, playerState) {
  const base = THEME_PROMPTS[theme];
  const level = playerState.level || 1;
  const difficultyNote = level > 1
    ? `The player is level ${level} — scale encounter difficulty accordingly. Raise rollDifficulty values by ${level - 1} above your baseline (e.g. a "medium" fight is now DC ${13 + (level - 1)} not 12). Make enemies tougher, stakes higher, and consequences more severe.`
    : `The player is level 1 — use baseline difficulty values.`;

  return `${base}

Current player state:
- Name: ${playerState.name}
- Class: ${playerState.className}
- Level: ${level}
- HP: ${playerState.hp}/${playerState.maxHp}
- Stats: STR ${playerState.stats.str}, AGI ${playerState.stats.agi}, INT ${playerState.stats.int}, FTH ${playerState.stats.fth}
- Inventory: ${playerState.inventory.length > 0 ? playerState.inventory.join(', ') : 'Nothing'}

${difficultyNote}

RULES:
- Narrate in 4-5 sentences. Be vivid, brutal, and atmospheric. Do NOT hand-hold or soften consequences.
- After every narration, output EXACTLY one JSON block on its own line with this structure:
{"choices":["choice 1","choice 2","choice 3"],"requiresRoll":false,"rollStat":"str","rollDifficulty":12,"rollReason":"why they roll","hpChange":0,"itemFound":null,"gameOver":false,"victory":false,"xpGained":10}
- requiresRoll: true for risky actions (combat, stealth, persuasion, miracles, dangerous movement)
- rollStat: "str", "agi", "int", or "fth"
- rollDifficulty: 8=easy, 12=medium, 16=hard, 19=legendary (scaled up by level as noted above)
- hpChange: negative for damage, positive for healing. Apply to current HP of ${playerState.hp}.
- gameOver: true ONLY when HP would drop to 0 or below
- victory: true ONLY when the main quest is complete
- itemFound: string name of item if player finds something, null otherwise
- xpGained: integer 10-20. Award 10 for trivial moments, 15 for a standard encounter resolved, 20 for a hard-won fight or major story beat. Never award 0.
- Always provide exactly 3 choices. Make them meaningfully different.`;
}

export async function startAdventure(theme, playerState) {
  const systemPrompt = buildSystemPrompt(theme, playerState);
  const userMessage = `Begin the adventure. Set the scene — where is ${playerState.name} and what immediate danger or situation confronts them? Make it visceral and immediate.`;

  const response = await callClaude(systemPrompt, [], userMessage);
  return response;
}

export async function continueAdventure(theme, playerState, history, action, rollResult = null) {
  const systemPrompt = buildSystemPrompt(theme, playerState);

  let userMessage = action;
  if (rollResult !== null) {
    const { roll, stat, bonus, total, difficulty, success, critical } = rollResult;
    let rollDesc = `[DICE ROLL: Rolled ${roll} + ${stat.toUpperCase()} bonus ${bonus} = ${total} vs difficulty ${difficulty}. `;
    if (critical && roll === 20) rollDesc += 'CRITICAL SUCCESS — spectacular outcome!]';
    else if (critical && roll === 1) rollDesc += 'CRITICAL FAIL — catastrophic consequence!]';
    else if (success) rollDesc += 'SUCCESS]';
    else rollDesc += 'FAILURE]';
    userMessage = `${action}\n\n${rollDesc}`;
  }

  const response = await callClaude(systemPrompt, history, userMessage);
  return response;
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
    rawAssistantMessage: text,
  };
}
