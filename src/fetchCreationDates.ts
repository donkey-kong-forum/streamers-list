import { streamers } from "./streamers";
import urlcat from "urlcat";

export const fetchCreationDates = async () => {
  const apiBaseUrl = "https://api.twitch.tv/helix";

  const creationDates: any[] = [];
  let count = 1;

  for (const streamer of streamers.filter(
    (streamer) => !!streamer.dkfUsername
  )) {
    console.log(
      `Query ${streamer.twitchUsername}, ${count}/${streamers.length}`
    );
    count += 1;

    const requestUrl = urlcat(apiBaseUrl, "/users", {
      login: streamer.twitchUsername,
    });

    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${process.env["TWITCH_ACCESS_TOKEN"]}`,
        "Client-Id": process.env["TWITCH_CLIENT_ID"] ?? "",
      },
    }).then((res) => res.json());

    if (response.data && response.data.length > 0) {
      creationDates.push({
        dkfUsername: streamer.dkfUsername,
        twitchUsername: streamer.twitchUsername,
        twitchCreatedAt: response.data[0].created_at,
      });
    }
  }

  return creationDates.sort((a, b) => {
    const aDate = new Date(a.twitchCreatedAt);
    const bDate = new Date(b.twitchCreatedAt);

    return aDate - bDate;
  });
};
