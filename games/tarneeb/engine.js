// Tarneeb rules engine — pure game state, no UI or network dependencies.
export const SUITS = ['♠','♥','♦','♣'];
export const RANKS = ['7','8','9','10','J','Q','K','A'];
const VALUE = { '7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13,A:14 };

export function createDeck(){
  return SUITS.flatMap(s => RANKS.map(r => ({s,r,v:VALUE[r]})));
}

export function isSameCard(a,b){ return !!a && !!b && a.s === b.s && a.r === b.r; }

export function isLegalBid(state, player, bid){
  if (state.phase !== 'bid' || state.bidTurn !== player) return false;
  if (bid === null) return true;
  if (!Number.isInteger(bid) || bid < 7 || bid > 13) return false;
  return bid > (state.highBid ?? 6);
}

export function applyBid(state, player, bid){
  if (!isLegalBid(state, player, bid)) throw new Error('Illegal bid');
  const next = structuredClone(state);
  next.bids[player] = bid;
  if (bid !== null && bid > next.highBid) {
    next.highBid = bid;
    next.bidWinner = player;
  }
  next.bidTurn = (player + 1) % 4;
  if (next.bidTurn === next.bidStart) {
    const active = next.bids.filter(v => v !== null);
    if (!active.length) throw new Error('At least one bid is required');
    next.phase = 'trump';
    next.turn = next.bidWinner;
  }
  return next;
}

export function isLegalTrump(state, player, trump){
  return state.phase === 'trump' && player === state.bidWinner && SUITS.includes(trump);
}

export function setTrump(state, player, trump){
  if (!isLegalTrump(state, player, trump)) throw new Error('Illegal trump');
  const next = structuredClone(state);
  next.trump = trump;
  next.phase = 'play';
  next.turn = next.bidWinner;
  next.leadSuit = null;
  next.trick = [];
  next.trickNo = 0;
  return next;
}

export function legalCards(state, player){
  if (state.phase !== 'play' || state.turn !== player) return [];
  const hand = state.players[player].hand;
  if (!state.leadSuit) return hand.slice();
  const following = hand.filter(c => c.s === state.leadSuit);
  return following.length ? following : hand.slice();
}

export function isLegalCard(state, player, card){
  return legalCards(state, player).some(c => isSameCard(c,card));
}

export function cardBeats(candidate, currentWinner, leadSuit, trump){
  if (!currentWinner) return true;
  const cTrump = candidate.s === trump;
  const wTrump = currentWinner.s === trump;
  if (cTrump !== wTrump) return cTrump;
  if (candidate.s === currentWinner.s) return candidate.v > currentWinner.v;
  if (candidate.s === leadSuit && currentWinner.s !== leadSuit) return true;
  return false;
}

export function trickWinner(trick, leadSuit, trump){
  if (!trick.length) throw new Error('Cannot score empty trick');
  let best = trick[0];
  for (const play of trick.slice(1)) {
    if (cardBeats(play.card, best.card, leadSuit, trump)) best = play;
  }
  return best.player;
}

export function applyCard(state, player, card){
  if (!isLegalCard(state, player, card)) throw new Error('Illegal card');
  const next = structuredClone(state);
  const hand = next.players[player].hand;
  const idx = hand.findIndex(c => isSameCard(c,card));
  if (idx < 0) throw new Error('Card not in hand');
  const played = hand.splice(idx,1)[0];
  if (!next.leadSuit) next.leadSuit = played.s;
  next.trick.push({player, card:played});
  if (next.trick.length === 4) {
    const winner = trickWinner(next.trick, next.leadSuit, next.trump);
    next.players[winner].tricks++;
    next.lastTrickWinner = winner;
    next.turn = winner;
    next.trick = [];
    next.leadSuit = null;
    next.trickNo++;
    if (next.trickNo === 13) {
      next.phase = 'round_end';
      next.roundResult = scoreRound(next);
    }
  } else {
    next.turn = (player + 1) % 4;
  }
  return next;
}

export function scoreRound(state){
  if (state.phase !== 'round_end') throw new Error('Round is not finished');
  const bid = state.highBid;
  const bidder = state.bidWinner;
  const team = state.players[bidder].team;
  const made = state.players[bidder].tricks + state.players[(bidder+2)%4].tricks;
  const other = 13 - made;
  const scores = state.scores.slice();
  if (made >= bid) scores[team] += bid + made;
  else scores[team] -= bid;
  scores[1-team] += other;
  return {bidder,team,bid,made,other,scores};
}

export function newState(players, bidStart=0, scores=[0,0]){
  if (!Array.isArray(players) || players.length !== 4) throw new Error('Tarneeb requires four players');
  return {
    phase:'bid', players:players.map((hand,i)=>({team:i%2,hand:hand.slice(),tricks:0})),
    bidStart, bidTurn:bidStart, highBid:6, bids:[null,null,null,null], bidWinner:null,
    trump:null, turn:bidStart, leadSuit:null, trick:[], trickNo:0, scores:scores.slice()
  };
}

export function nextRound(previous){
  if (previous.phase !== 'round_end') throw new Error('Round is not finished');
  const hands = previous.players.map(p => p.hand.slice());
  const scores = previous.roundResult?.scores ?? previous.scores;
  return newState(hands, (previous.bidStart + 1) % 4, scores);
}
