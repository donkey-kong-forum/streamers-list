<?php
// Runs on the DKF server

// Simple PHP to display streamers from GitHub Pages with caching

function displayStreamersFromGitHub() {
    $cache_key = 'dkf_live_streamers';
    $cache_duration = 120; // 2 minutes
    
    // Try to get from cache first
    $cached_html = getCachedStreamers($cache_key, $cache_duration);
    if ($cached_html !== false) {
        echo $cached_html;
        return;
    }
    
    // Not in cache, fetch fresh data
    $html = fetchAndRenderStreamers();
    
    // Cache the result
    setCachedStreamers($cache_key, $html);
    
    echo $html;
}

function getCachedStreamers($key, $duration) {
    // Try APCu first (in-memory)
    if (function_exists('apcu_fetch') && apcu_enabled()) {
        $cached = apcu_fetch($key);
        if ($cached !== false) {
            return $cached;
        }
    }
    
    // Fallback to file cache
    $cache_file = sys_get_temp_dir() . '/' . $key . '.cache';
    if (file_exists($cache_file) && (time() - filemtime($cache_file) < $duration)) {
        return file_get_contents($cache_file);
    }
    
    return false;
}

function setCachedStreamers($key, $data) {
    // Try APCu first (in-memory)
    if (function_exists('apcu_store') && apcu_enabled()) {
        apcu_store($key, $data, 120); // 2 minutes
    }
    
    // Also write to file cache as fallback
    $cache_file = sys_get_temp_dir() . '/' . $key . '.cache';
    file_put_contents($cache_file, $data);
}

function fetchAndRenderStreamers() {
    // Fetch the JSON from GitHub Pages
    $json_url = 'https://donkey-kong-forum.github.io/streamers-list/live-streamers.json';
    
    // Use curl for better error handling
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $json_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $json_data = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    ob_start();
    
    echo '<div style="font-family: Verdana; font-size: 12px; text-align: center;">';
    echo '<p style="font-weight: bold; margin-bottom: 0;">Active Streamers:</p>';
    
    if ($json_data === false || $http_code !== 200) {
        echo '<p style="margin: 0; color: #666;">Unable to load streamers.</p>';
        echo '</div>';
        return ob_get_clean();
    }
    
    $data = json_decode($json_data, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo '<p style="margin: 0; color: #666;">Error loading streamers.</p>';
        echo '</div>';
        return ob_get_clean();
    }
    
    if (empty($data['streamers'])) {
        echo '<p style="margin: 0;">No one is live.</p>';
    } else {
        foreach ($data['streamers'] as $streamer) {
            $display_name = htmlspecialchars($streamer['twitchUsername']);
            if (!empty($streamer['dkfUsername']) && 
                strtolower($streamer['twitchUsername']) != strtolower($streamer['dkfUsername'])) {
                $display_name .= ' (' . htmlspecialchars($streamer['dkfUsername']) . ')';
            }
            
            echo '<a href="https://twitch.tv/' . htmlspecialchars($streamer['twitchUsername']) . '" ';
            echo 'target="_blank" rel="noreferrer">';
            echo $display_name;
            echo '</a><br>';
        }
    }
    
    echo '</div>';
    
    return ob_get_clean();
}

// If called directly (for testing)
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    displayStreamersFromGitHub();
}
?>