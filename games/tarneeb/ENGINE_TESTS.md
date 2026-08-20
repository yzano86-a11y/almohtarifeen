# Tarneeb engine acceptance tests

These are the minimum rules tests for the pure engine before wiring it into the UI/network layer.

- A bid below 7 or above 13 is rejected.
- A bid that does not exceed the current high bid is rejected.
- Only the player whose bid turn it is may bid.
- Only the player whose turn it is may play a card.
- If a player holds the lead suit, every other suit is illegal.
- If a player has no lead-suit card, any card in hand is legal.
- A card not in the player's hand is rejected.
- A trump card beats a non-trump card in the same trick.
- When no trump is played, the highest card of the lead suit wins.
- A card from a different non-trump/non-lead suit cannot win a trick.
- The winning player leads the next trick.
- Exactly one card is removed from a hand per legal play.
- After four legal plays, exactly one trick is awarded.
- After 13 tricks the round enters `round_end`.
- No client-side UI is allowed to bypass the engine's legality checks.

Next integration gate: route every UI card/bid action through this engine and make the server authoritative for ranked online games.
