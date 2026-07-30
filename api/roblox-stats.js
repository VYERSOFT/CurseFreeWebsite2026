const GAMES = {
  carpet: '9991421325',
  drain: '10403437074',
  window: '10143340324',
  fitcheck: '5836185226',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const universeIds = Object.values(GAMES).join(',');
    const r = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds}`);
    if (!r.ok) throw new Error(`Roblox API ${r.status}`);
    const json = await r.json();
    if (!Array.isArray(json.data)) throw new Error('Invalid Roblox API response');

    // Roblox can return an id: 0 placeholder when a single universe is
    // moderated or otherwise unavailable. Keep the other games usable instead
    // of failing the entire response because one requested id is missing.
    const byId = new Map(json.data.map((game) => [String(game.id), game]));
    const games = Object.fromEntries(
      Object.entries(GAMES).map(([key, id]) => {
        const game = byId.get(id);
        return [key, game ? { playing: game.playing, visits: game.visits } : null];
      })
    );

    // Preserve the original top-level Carpet Cleaning fields for compatibility.
    res.status(200).json({ ...(games.carpet || { playing: null, visits: null }), games });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
