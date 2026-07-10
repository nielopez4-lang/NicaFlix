/** iPhone / iPad / Android — reproductor simplificado (sin preroll split). */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }
  return navigator.maxTouchPoints > 1 && window.innerWidth < 900;
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function youtubeEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    enablejsapi: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params}`;
}
