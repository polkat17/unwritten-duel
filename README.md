# The Unwritten Duel

A turn-based magic duel where you write your own spells. Claude referees every spell.

- `index.html` is the whole game. The same file also runs as a Claude artifact.
- `api/referee.js` is a Vercel function that sends written spells to Claude with the owner's API key.

## Settings (Vercel → Project → Settings → Environment Variables)

- `ANTHROPIC_API_KEY`: the owner's Anthropic API key. It stays on the server and never reaches the browser.
- `PLAY_CODE`: the passcode players type before they can write spells.
- `ANTHROPIC_MODEL` (optional): the model to use instead of the default.

Change a variable, then redeploy for it to take effect.
