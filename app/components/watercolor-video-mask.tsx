"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type WatercolorVideoMaskProps = {
  src: string;
  type?: string;
  poster?: string;
  className?: string;
  preload?: "none" | "metadata" | "auto";
  seed?: number;
};

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function hashStringToSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rnd(rand: () => number, min: number, max: number) {
  return min + rand() * (max - min);
}

function rndInt(rand: () => number, minInclusive: number, maxExclusive: number) {
  return Math.floor(rnd(rand, minInclusive, maxExclusive));
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  cx: number,
  cy: number,
  vertices: number,
  rx: number,
  ry: number,
  rotation: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000";
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();

  for (let i = 0; i < vertices; i += 1) {
    const angle = (i / vertices) * Math.PI * 2;
    const jx = rx * rnd(rand, 0.3, 1.4);
    const jy = ry * rnd(rand, 0.3, 1.4);
    const x = Math.cos(angle) * jx;
    const y = Math.sin(angle) * jy;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRotatedRect(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  rotation: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000";
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.restore();
}

function drawGeometricMask(ctx: CanvasRenderingContext2D, rand: () => number, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  const cx = width * 0.72;
  const cy = height * 0.5;
  const alphaBoost = 3.2;

  const boost = (alpha: number) => Math.min(1, alpha * alphaBoost);

  for (let i = 0; i < 22; i += 1) {
    drawPolygon(
      ctx,
      rand,
      cx + rnd(rand, -width * 0.14, width * 0.14),
      cy + rnd(rand, -height * 0.18, height * 0.18),
      rndInt(rand, 4, 8),
      rnd(rand, width * 0.08, width * 0.22),
      rnd(rand, height * 0.07, height * 0.2),
      rnd(rand, 0, Math.PI),
      boost(rnd(rand, 0.1, 0.22)),
    );
  }

  for (let i = 0; i < 28; i += 1) {
    drawPolygon(
      ctx,
      rand,
      cx + rnd(rand, -width * 0.28, width * 0.24),
      cy + rnd(rand, -height * 0.32, height * 0.32),
      rndInt(rand, 3, 7),
      rnd(rand, width * 0.04, width * 0.16),
      rnd(rand, height * 0.03, height * 0.14),
      rnd(rand, 0, Math.PI),
      boost(rnd(rand, 0.05, 0.14)),
    );
  }

  for (let i = 0; i < 20; i += 1) {
    drawRotatedRect(
      ctx,
      cx + rnd(rand, -width * 0.32, width * 0.22),
      cy + rnd(rand, -height * 0.36, height * 0.36),
      rnd(rand, width * 0.06, width * 0.32),
      rnd(rand, 3, height * 0.06),
      rnd(rand, 0, Math.PI),
      boost(rnd(rand, 0.04, 0.1)),
    );
  }

  for (let i = 0; i < 22; i += 1) {
    const bx = cx + rnd(rand, -width * 0.36, width * 0.28);
    const by = cy + rnd(rand, -height * 0.42, height * 0.42);
    const length = rnd(rand, width * 0.1, width * 0.4);
    const angle = rnd(rand, 0, Math.PI);

    drawTriangle(
      ctx,
      bx,
      by,
      bx + Math.cos(angle) * length,
      by + Math.sin(angle) * length,
      bx + Math.cos(angle + rnd(rand, 0.1, 0.7)) * rnd(rand, 8, 50),
      by + Math.sin(angle + rnd(rand, 0.1, 0.7)) * rnd(rand, 8, 50),
      boost(rnd(rand, 0.04, 0.11)),
    );
  }

  for (let i = 0; i < 50; i += 1) {
    drawPolygon(
      ctx,
      rand,
      cx + rnd(rand, -width * 0.44, width * 0.36),
      cy + rnd(rand, -height * 0.46, height * 0.46),
      rndInt(rand, 3, 5),
      rnd(rand, 2, width * 0.04),
      rnd(rand, 2, height * 0.04),
      rnd(rand, 0, Math.PI),
      boost(rnd(rand, 0.04, 0.16)),
    );
  }
}

function drawCoverFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
) {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  if (!videoWidth || !videoHeight) {
    return;
  }

  const scale = Math.max(width / videoWidth, height / videoHeight);
  const drawWidth = videoWidth * scale;
  const drawHeight = videoHeight * scale;
  const dx = (width - drawWidth) / 2;
  const dy = (height - drawHeight) / 2;

  ctx.drawImage(video, dx, dy, drawWidth, drawHeight);
}

export function WatercolorVideoMask({
  src,
  type = "video/mp4",
  poster,
  className,
  preload = "metadata",
  seed,
}: WatercolorVideoMaskProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const stableSeed = useMemo(() => seed ?? hashStringToSeed(src), [seed, src]);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const maskCanvas = maskCanvasRef.current;
    const compositeCanvas = compositeCanvasRef.current;

    if (!container || !video || !maskCanvas || !compositeCanvas) {
      return undefined;
    }

    const compositeCtx = compositeCanvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");

    if (!compositeCtx || !maskCtx) {
      return undefined;
    }

    const blurCanvas = document.createElement("canvas");
    const blurCtx = blurCanvas.getContext("2d");

    compositeCtx.imageSmoothingEnabled = true;
    compositeCtx.imageSmoothingQuality = "high";
    maskCtx.imageSmoothingEnabled = true;
    maskCtx.imageSmoothingQuality = "high";
    if (blurCtx) {
      blurCtx.imageSmoothingEnabled = true;
      blurCtx.imageSmoothingQuality = "high";
    }

    let frameId: number | null = null;
    let resizeId: number | null = null;
    let width = 0;
    let height = 0;
    let isDestroyed = false;
    let isPaused = false;
    let hasFirstFrame = false;

    const resizeAndMask = () => {
      if (!container || !maskCtx || !compositeCtx || !blurCtx) {
        return;
      }

      const cssWidth = container.clientWidth;
      const cssHeight = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      const nextWidth = Math.max(1, Math.round(cssWidth * dpr));
      const nextHeight = Math.max(1, Math.round(cssHeight * dpr));

      if (nextWidth === width && nextHeight === height) {
        return;
      }

      width = nextWidth;
      height = nextHeight;

      compositeCanvas.width = width;
      compositeCanvas.height = height;

      maskCanvas.width = width;
      maskCanvas.height = height;

      blurCanvas.width = width;
      blurCanvas.height = height;

      const rand = createSeededRandom(stableSeed);
      drawGeometricMask(maskCtx, rand, width, height);

      blurCtx.clearRect(0, 0, width, height);
      blurCtx.drawImage(maskCanvas, 0, 0);

      maskCtx.clearRect(0, 0, width, height);
      maskCtx.filter = "blur(18px)";
      maskCtx.globalAlpha = 1;
      maskCtx.drawImage(blurCanvas, 0, 0);
      maskCtx.filter = "none";
      maskCtx.globalAlpha = 0.88;
      maskCtx.drawImage(blurCanvas, 0, 0);
      maskCtx.globalAlpha = 1;

      maskCtx.globalCompositeOperation = "destination-in";

      const size = Math.min(width, height);
      const focusX = width * 0.72;
      const focusY = height * 0.5;
      const edgeGradient = maskCtx.createRadialGradient(
        focusX,
        focusY,
        size * 0.16,
        focusX,
        focusY,
        size * 0.66,
      );
      edgeGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
      edgeGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      maskCtx.fillStyle = edgeGradient;
      maskCtx.fillRect(0, 0, width, height);

      const sideGradient = maskCtx.createLinearGradient(0, 0, width, 0);
      sideGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      sideGradient.addColorStop(0.22, "rgba(0, 0, 0, 0.04)");
      sideGradient.addColorStop(0.46, "rgba(0, 0, 0, 1)");
      sideGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
      maskCtx.fillStyle = sideGradient;
      maskCtx.fillRect(0, 0, width, height);

      maskCtx.globalCompositeOperation = "source-over";
    };

    const scheduleResize = () => {
      if (resizeId !== null) {
        cancelAnimationFrame(resizeId);
      }
      resizeId = requestAnimationFrame(() => {
        resizeId = null;
        resizeAndMask();
      });
    };

    scheduleResize();

    const resizeObserver = new ResizeObserver(() => {
      scheduleResize();
    });

    resizeObserver.observe(container);

    const render = () => {
      frameId = null;

      if (isDestroyed || isPaused) {
        return;
      }

      if (!width || !height) {
        if (!isPaused && !isDestroyed) {
          frameId = requestAnimationFrame(render);
        }
        return;
      }

      compositeCtx.clearRect(0, 0, width, height);
      drawCoverFrame(compositeCtx, video, width, height);
      compositeCtx.globalCompositeOperation = "destination-in";
      compositeCtx.drawImage(maskCanvas, 0, 0);
      compositeCtx.globalCompositeOperation = "source-over";

      if (!hasFirstFrame) {
        hasFirstFrame = true;
        setIsReady(true);
      }

      if (!isPaused && !isDestroyed) {
        frameId = requestAnimationFrame(render);
      }
    };

    const start = () => {
      isPaused = false;
      if (frameId !== null) {
        return;
      }
      frameId = requestAnimationFrame(render);
    };

    const stop = () => {
      isPaused = true;
      if (frameId === null) {
        return;
      }
      cancelAnimationFrame(frameId);
      frameId = null;
    };

    const onVideoReady = () => {
      resizeAndMask();
      start();
    };

    const visibilityHandler = () => {
      if (document.visibilityState === "hidden") {
        stop();
      } else {
        start();
      }
    };

    const intersectionObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              const [entry] = entries;
              if (!entry) {
                return;
              }
              if (entry.isIntersecting) {
                start();
              } else {
                stop();
              }
            },
            { threshold: 0.12 },
          )
        : null;

    intersectionObserver?.observe(container);

    video.addEventListener("loadeddata", onVideoReady);
    document.addEventListener("visibilitychange", visibilityHandler);

    if (video.readyState >= 2) {
      onVideoReady();
    }

    return () => {
      isDestroyed = true;

      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", visibilityHandler);
      video.removeEventListener("loadeddata", onVideoReady);

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      if (resizeId !== null) {
        cancelAnimationFrame(resizeId);
      }
    };
  }, [src, stableSeed]);

  const mergedClassName = [
    "watercolor-video",
    isReady ? "watercolor-video--ready" : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={mergedClassName} ref={containerRef}>
      <video
        className="watercolor-video__source"
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload={preload}
        crossOrigin="anonymous"
        poster={poster}
      >
        <source src={src} type={type} />
      </video>
      <canvas className="watercolor-video__mask" ref={maskCanvasRef} aria-hidden="true" />
      <canvas className="watercolor-video__canvas" ref={compositeCanvasRef} aria-hidden="true" />
    </div>
  );
}
