import { beforeEach, describe, expect, test } from "vitest";
import {
  addFavorite,
  getFavoritesSnapshot,
  isFavorite,
  removeFavorite,
} from "./favorites";

describe("favorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("즐겨찾기를 추가하면 목록에 나타나고, isFavorite이 true를 반환한다", () => {
    addFavorite({ date: "2026-01-01", title: "새해 사진" });

    expect(isFavorite(getFavoritesSnapshot(), "2026-01-01")).toBe(true);
    expect(getFavoritesSnapshot()).toEqual([
      { date: "2026-01-01", title: "새해 사진" },
    ]);
  });

  test("이미 있는 날짜를 다시 추가해도 중복되지 않는다", () => {
    addFavorite({ date: "2026-01-01", title: "새해 사진" });
    addFavorite({ date: "2026-01-01", title: "새해 사진" });

    expect(getFavoritesSnapshot()).toHaveLength(1);
  });

  test("즐겨찾기를 제거하면 목록에서 사라진다", () => {
    addFavorite({ date: "2026-01-01", title: "새해 사진" });
    removeFavorite("2026-01-01");

    expect(isFavorite(getFavoritesSnapshot(), "2026-01-01")).toBe(false);
    expect(getFavoritesSnapshot()).toEqual([]);
  });

  test("저장된 값이 깨져 있으면 빈 목록으로 취급한다", () => {
    window.localStorage.setItem("apod-favorites", "{ 이건 JSON이 아님");

    expect(getFavoritesSnapshot()).toEqual([]);
  });
});
