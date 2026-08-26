# Independent project audit

This branch is intentionally isolated from `main`. No game or social project is integrated into the production app here.

## Current candidates

### Social
- SupaSocial: React + TypeScript + Supabase + Zustand + Tailwind; MIT; auth, profiles, friends, realtime. Source: https://github.com/koji0701/supabase-react-social-media-starter

### Games
- Bull 'Em: multiplayer/local bot card game; MIT; server-authoritative; Socket.IO; strict TypeScript; build/test scripts. Source: https://github.com/jvmarten/bullem
- LUDO: multiplayer Ludo using Node.js + Socket.IO + Vanilla JS; MIT; Docker configuration present. Source: https://github.com/CyberCitizen01/LUDO
- Card Room: Texas Hold'em + Blackjack + Spades; React + Node + Socket.IO; README claims MIT, but the repository tree currently has no LICENSE file. It is therefore **not approved for integration** until licensing is independently clarified. Source: https://github.com/hrashid13/card-room

## Rule
Nothing in this branch is approved for production integration until the candidate's source, license, dependency/build status, and runtime behavior are verified.