const fs = require('fs');
const path = require('path');

// Read streamers list
const streamersPath = path.join(__dirname, '..', 'streamers.json');
const streamers = JSON.parse(fs.readFileSync(streamersPath, 'utf8'));

// Twitch API credentials from environment
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_ACCESS_TOKEN = process.env.TWITCH_ACCESS_TOKEN;

async function checkLiveStreamers() {
  const liveStreamers = [];
  
  // Batch requests (up to 100 usernames per request)
  const chunks = [];
  for (let i = 0; i < streamers.length; i += 100) {
    chunks.push(streamers.slice(i, i + 100));
  }
  
  for (const chunk of chunks) {
    // Build URL with multiple user_login parameters
    const params = chunk.map(s => `user_login=${encodeURIComponent(s.twitchUsername)}`).join('&');
    const url = `https://api.twitch.tv/helix/streams?${params}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TWITCH_ACCESS_TOKEN}`,
          'Client-Id': TWITCH_CLIENT_ID
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Match live streams with our streamers list
        for (const stream of data.data) {
          const streamer = chunk.find(s => 
            s.twitchUsername.toLowerCase() === stream.user_login.toLowerCase()
          );
          
          if (streamer) {
            liveStreamers.push({
              ...streamer,
              streamData: {
                title: stream.title,
                game: stream.game_name,
                viewers: stream.viewer_count,
                thumbnail: stream.thumbnail_url,
                startedAt: stream.started_at
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  }
  
  // Write result to file
  const output = {
    streamers: liveStreamers,
    updated: new Date().toISOString(),
    totalStreamers: streamers.length,
    liveCount: liveStreamers.length
  };
  
  // Write to /tmp/ for the workflow to pick up
  fs.writeFileSync('/tmp/live-streamers.json', JSON.stringify(output, null, 2));
  
  console.log(`Found ${liveStreamers.length} live streamers out of ${streamers.length} total`);
}

checkLiveStreamers().catch(console.error);