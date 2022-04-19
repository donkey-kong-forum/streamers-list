import urlcat from "urlcat";

import { streamers as streamerListEntities } from "./streamers";
import type { Streamer } from "./streamer.model";

export const fetchOnlineStreamers = async () => {
  const onlineStreamers: Streamer[] = [];

  for (const streamerListEntity of streamerListEntities) {
    const isStreamerLive = await getIsStreamerLive(
      streamerListEntity.twitchUsername
    );

    if (isStreamerLive) {
      onlineStreamers.push(streamerListEntity);
    }
  }

  return onlineStreamers;
};

const getIsStreamerLive = async (twitchUsername: string) => {
  const apiBaseUrl = "https://api.twitch.tv/helix";

  const requestUrl = urlcat(apiBaseUrl, "/streams", {
    user_login: twitchUsername,
  });

  const response = await fetch(requestUrl, {
    headers: {
      Authorization: `Bearer ${process.env["TWITCH_ACCESS_TOKEN"]}`,
      "Client-Id": process.env["TWITCH_CLIENT_ID"] ?? "",
    },
  }).then((res) => res.json());

  if (response.data && response.data.length > 0) {
    return true;
  }

  return false;
};
