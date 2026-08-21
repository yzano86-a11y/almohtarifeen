// Open-source game integration registry for Al-Mohtarifeen.
// Only engines with a compatible license should be wired into production.
// Commercial/proprietary game code is intentionally excluded.
export const GAME_INTEGRATIONS = {
  tarneeb: { status: 'native', adapter: '../tarneeb/engine.js', online: true },
  backgammon: { status: 'candidate', license: 'MIT', adapter: null, online: true },
  chess: { status: 'candidate', license: 'MIT', adapter: null, online: true },
  uno: { status: 'candidate', license: 'MIT', adapter: null, online: true },
  domino: { status: 'candidate', license: 'BSD-3-Clause', adapter: null, online: false },
  basra: { status: 'candidate', license: 'MIT', adapter: null, online: false },
  hokm: { status: 'candidate', license: 'CC0-1.0', adapter: null, online: true },
  belote: { status: 'candidate', license: 'MIT', adapter: null, online: true },
  ludo: { status: 'blocked', reason: 'AGPL-3.0 candidate not suitable for direct closed-source commercial integration' },
  billiards: { status: 'blocked', reason: 'GPL-3.0 candidate not suitable for direct closed-source commercial integration' }
};

export function getGameIntegration(gameId) {
  return GAME_INTEGRATIONS[gameId] ?? { status: 'native-required', adapter: null, online: false };
}
