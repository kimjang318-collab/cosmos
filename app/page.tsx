type ApodPhoto = {
  date: string;
  title: string;
  media_type: string;
  url: string;
  hdurl?: string;
};

type ApodResult =
  | { success: true; photo: ApodPhoto }
  | { success: false; status: number };

const DIRECT_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".ogv"];

// NASA APOD의 video url은 유튜브 등 외부 플랫폼 embed 링크이거나,
// apod.nasa.gov가 직접 호스팅하는 영상 파일(mp4 등)일 수 있다.
// 후자는 iframe이 아니라 video 태그로 재생해야 화면에 나온다.
function isDirectVideoFile(url: string) {
  const path = url.split("?")[0].toLowerCase();
  return DIRECT_VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

async function fetchTodayApod(): Promise<ApodResult> {
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
  const res = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`
  );

  if (!res.ok) {
    return { success: false, status: res.status };
  }

  const photo = (await res.json()) as ApodPhoto;
  return { success: true, photo };
}

export default async function Home() {
  const result = await fetchTodayApod();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-6 bg-white px-16 py-32 text-center dark:bg-black">
        {!result.success ? (
          <>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              오늘의 우주 사진을 가져오지 못했어요
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              잠시 후 다시 시도해 주세요. (오류 코드: {result.status})
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {result.photo.date}
            </p>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              {result.photo.title}
            </h1>
            {result.photo.media_type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- NASA APOD 이미지는 매일 임의의 외부 도메인에서 오므로 next/image 도메인 허용 목록으로 다루지 않는다.
              <img
                src={result.photo.hdurl ?? result.photo.url}
                alt={result.photo.title}
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
            ) : result.photo.media_type === "video" ? (
              isDirectVideoFile(result.photo.url) ? (
                <video
                  src={result.photo.url}
                  controls
                  className="aspect-video w-full rounded-lg"
                />
              ) : (
                <iframe
                  src={result.photo.url}
                  title={result.photo.title}
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full rounded-lg"
                />
              )
            ) : (
              <p className="text-zinc-600 dark:text-zinc-400">
                오늘은 사진도 영상도 아닌 형식이에요. 다음에 다시 확인해
                주세요.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
