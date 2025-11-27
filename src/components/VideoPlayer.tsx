import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";

interface VideoPlayerProps {
  videoUrl: string;
  modelName: string;
}

const VideoPlayer = ({ videoUrl, modelName }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize video.js player
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: "auto",
      fluid: true,
      html5: {
        vhs: {
          overrideNative: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      sources: [
        {
          src: videoUrl,
          type: "application/x-mpegURL",
        },
      ],
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-card rounded-lg overflow-hidden shadow-lg">
        <div data-vjs-player>
          <video
            ref={videoRef}
            className="video-js vjs-default-skin vjs-big-play-centered"
            playsInline
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold">{modelName}</h3>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
