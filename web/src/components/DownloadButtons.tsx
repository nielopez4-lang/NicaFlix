const ANDROID_URL = process.env.NEXT_PUBLIC_ANDROID_APK_URL ?? "#descargar-android";
const IOS_URL = process.env.NEXT_PUBLIC_IOS_APP_URL ?? "#descargar-ios";

export function DownloadButtons({ size = "lg" }: { size?: "lg" | "sm" }) {
  const btnClass =
    size === "lg"
      ? "rounded-2xl px-6 py-4 text-base"
      : "rounded-xl px-4 py-2.5 text-sm";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={ANDROID_URL}
        className={`${btnClass} flex items-center justify-center gap-2 bg-white font-semibold text-black transition hover:bg-gray-100`}
      >
        Android
      </a>
      <a
        href={IOS_URL}
        className={`${btnClass} flex items-center justify-center gap-2 glass font-semibold text-white transition hover:bg-white/10`}
      >
        iOS
      </a>
    </div>
  );
}
