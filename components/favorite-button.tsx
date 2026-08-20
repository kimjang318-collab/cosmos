"use client";

import { Star } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  addFavorite,
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  isFavorite,
  removeFavorite,
  subscribeFavorites,
} from "@/lib/favorites";

export function FavoriteButton({
  date,
  title,
}: {
  date: string;
  title: string;
}) {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot
  );
  const favorited = isFavorite(favorites, date);

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-label={favorited ? "즐겨찾기 됨" : "즐겨찾기에 추가"}
      onClick={() => {
        if (favorited) {
          removeFavorite(date);
        } else {
          addFavorite({ date, title });
        }
      }}
    >
      <Star
        size={22}
        className={
          favorited ? "fill-yellow-400 text-yellow-400" : "text-zinc-400"
        }
      />
    </button>
  );
}
