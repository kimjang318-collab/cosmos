import Link from "next/link";
import { FailureNotice } from "@/components/failure-notice";
import { readIndex, searchIndex } from "@/lib/apod-index";

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  let matches: ReturnType<typeof searchIndex> | null = null;
  let failureStatus: number | null = null;

  if (query) {
    try {
      const index = await readIndex();
      matches = searchIndex(index, query);
    } catch {
      failureStatus = 500;
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-6 bg-white px-16 py-32 text-center dark:bg-black">
        <Link
          href="/"
          className="self-start text-sm text-zinc-500 underline dark:text-zinc-400"
        >
          오늘 사진으로
        </Link>
        <form action="/search" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="키워드로 찾기 (예: mars)"
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-1 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
          >
            검색
          </button>
        </form>

        {failureStatus !== null ? (
          <FailureNotice status={failureStatus} />
        ) : matches === null ? null : matches.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            &quot;{query}&quot;와 일치하는 사진을 찾지 못했어요.
          </p>
        ) : (
          <ul className="flex w-full flex-col gap-1 text-left">
            {matches.map((photo) => (
              <li key={photo.date}>
                <Link
                  href={`/?date=${photo.date}`}
                  className="flex items-baseline gap-3 rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                    {photo.date}
                  </span>
                  <span className="text-black dark:text-zinc-50">
                    {photo.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
