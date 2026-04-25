const UNIVERSE_ID = '9991421325';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const r = await fetch(`https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`);
    if (!r.ok) throw new Error(`Roblox API ${r.status}`);
    const json = await r.json();
    const game = json.data[0];
    res.status(200).json({ playing: game.playing, visits: game.visits });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
