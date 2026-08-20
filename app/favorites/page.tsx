"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  removeFavorite,
  subscribeFavorites,
} from "@/lib/favorites";

export default function FavoritesPage() {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-6 bg-white px-16 py-32 text-center dark:bg-black">
        <Link
          href="/"
          className="self-start text-sm text-zinc-500 underline dark:text-zinc-400"
        >
          오늘 사진으로
        </Link>

        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          즐겨찾기
        </h1>

        {favorites.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            아직 즐겨찾기한 사진이 없어요.
          </p>
        ) : (
          <ul className="flex w-full flex-col gap-1 text-left">
            {favorites
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((favorite) => (
                <li
                  key={favorite.date}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <Link
                    href={`/?date=${favorite.date}`}
                    className="flex flex-1 items-baseline gap-3"
                  >
                    <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                      {favorite.date}
                    </span>
                    <span className="text-black dark:text-zinc-50">
                      {favorite.title}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFavorite(favorite.date)}
                    aria-label="제거"
                    className="shrink-0 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </main>
    </div>
  );
}
