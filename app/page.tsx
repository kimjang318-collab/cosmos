import Link from "next/link";
import { ApodImage } from "@/components/apod-image";
import { FailureNotice } from "@/components/failure-notice";
import { FavoriteButton } from "@/components/favorite-button";
import { MIN_DATE, fetchApod, isDirectVideoFile, todayString } from "@/lib/apod";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { date } = await searchParams;
  const selectedDate = typeof date === "string" ? date : undefined;
  const today = todayString();

  const result = await fetchApod(selectedDate);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-6 bg-white px-16 py-32 text-center dark:bg-black">
        <p className="text-[20px] text-zinc-400 italic">For my son, 김시원</p>
        <form action="/" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={selectedDate ?? today}
            min={MIN_DATE}
            max={today}
            className="w-60 rounded-md border border-zinc-300 px-2 py-1 text-sm text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-1 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
          >
            보기
          </button>
        </form>
        <form action="/search" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            placeholder="키워드로 찾기 (예: mars)"
            className="w-60 rounded-md border border-zinc-300 px-2 py-1 text-sm text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-1 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
          >
            검색
          </button>
        </form>
        <Link
          href="/favorites"
          className="rounded-md bg-zinc-900 px-3 py-1 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
        >
          즐겨찾기
        </Link>
        {!result.success ? (
          <FailureNotice status={result.status} />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
                {result.photo.title}
              </h1>
              <FavoriteButton date={result.photo.date} title={result.photo.title} />
            </div>
            {result.photo.media_type === "image" ? (
              <ApodImage
                src={result.photo.hdurl ?? result.photo.url}
                fallbackSrc={result.photo.url}
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
            <p className="text-left text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {result.photo.explanation}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
