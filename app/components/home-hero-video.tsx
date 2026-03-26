"use client";

import { useState } from "react";

type HomeHeroVideoProps = {
  poster: string;
  src: string;
};

export function HomeHeroVideo({ poster, src }: HomeHeroVideoProps) {
  const [hasVideoError, setHasVideoError] = useState(false);

  if (hasVideoError) {
    return null;
  }

  return (
    <video
      className="home-page__hero-background-video"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
      onError={() => setHasVideoError(true)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
