import type { NextPage } from "next";

import type { Streamer } from "../streamer.model";
import { fetchOnlineStreamers } from "../fetchOnlineStreamers";

interface HomePageProps {
  liveStreamers: Streamer[];
}

const Home: NextPage<HomePageProps> = ({ liveStreamers }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Verdana",
      }}
    >
      <p style={{ fontWeight: "bold", marginBottom: 0 }}>Active Streamers:</p>
      {liveStreamers.length > 0 ? (
        <>
          {liveStreamers.map((liveStreamer) => (
            <a
              key={liveStreamer.twitchUsername}
              target="_blank"
              rel="noreferrer"
            >
              {liveStreamer.dkfUsername ?? liveStreamer.twitchUsername}
            </a>
          ))}
        </>
      ) : (
        <p style={{ margin: 0 }}>No one is live.</p>
      )}
    </div>
  );
};

export async function getStaticProps() {
  const liveStreamers = await fetchOnlineStreamers();

  return {
    props: {
      liveStreamers,
    },
    revalidate: 120, // Refresh every two minutes
  };
}

export default Home;