# DKF Streamers List

This repository maintains the list of Twitch streamers for the Donkey Kong Forum community. It automatically checks which streamers are live and displays them on the forum.

## How to Update the Streamers List

### Adding a New Streamer

1. Edit the `streamers.json` file
2. Add a new entry in the array:
   ```json
   { "twitchUsername": "their_twitch_username", "dkfUsername": "their_forum_username" }
   ```
   - `twitchUsername` is required (their Twitch channel name)
   - `dkfUsername` is optional (their forum display name, if different)

3. Commit and push your changes to the `main` branch
4. The list will automatically update within 2 minutes

### Removing a Streamer

1. Edit the `streamers.json` file
2. Remove the streamer's entry from the array
3. Commit and push your changes

### Example

```json
[
  { "twitchUsername": "example_streamer" },
  { "twitchUsername": "another_streamer", "dkfUsername": "ForumName" }
]
```

## How It Works

1. **GitHub Actions** runs every 2 minutes to check which streamers are live
2. It fetches the `streamers.json` list and queries the Twitch API
3. Results are saved to `live-streamers.json` on GitHub Pages
4. The forum displays this pre-computed list (no server load!)

## Technical Details

- **Automatic Token Refresh**: The GitHub Action automatically gets fresh Twitch tokens
- **Zero Server Load**: All processing happens on GitHub's infrastructure
- **Fast Loading**: The forum only needs to fetch a small JSON file
- **Caching**: Results are cached for 2 minutes to reduce requests

## Files

- `streamers.json` - The master list of all streamers (edit this file!)
- `live-streamers.json` - Auto-generated list of currently live streamers (do not edit)
- `.github/workflows/update-live-streamers.yml` - GitHub Action that checks who's live
- `scripts/check-live-streamers.js` - Script that queries the Twitch API

## Live Data

The current list of live streamers is available at:
https://donkey-kong-forum.github.io/streamers-list/live-streamers.json