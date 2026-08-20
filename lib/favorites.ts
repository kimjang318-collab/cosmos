// 즐겨찾기는 계정 없이 이 브라우저의 로컬 저장소에만 저장한다(PRODUCT.md).
// useSyncExternalStore로 구독하도록 만들어져 있어, 이 모듈은 클라이언트
// 컴포넌트에서만 사용한다.
export type FavoriteEntry = {
  date: string;
  title: string;
};

const STORAGE_KEY = "apod-favorites";
const EMPTY_FAVORITES: FavoriteEntry[] = [];
const listeners = new Set<() => void>();

// getFavoritesSnapshot()이 매번 새 배열을 만들면 useSyncExternalStore가
// 매 렌더마다 변경된 것으로 보고 무한 렌더링에 빠진다. 그래서 원본 JSON
// 문자열이 실제로 바뀌었을 때만 배열을 새로 만들고, 아니면 이전 참조를
// 그대로 재사용한다.
let cachedRaw: string | null = null;
let cachedEntries: FavoriteEntry[] = EMPTY_FAVORITES;

function isFavoriteEntry(value: unknown): value is FavoriteEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as FavoriteEntry).date === "string" &&
    typeof (value as FavoriteEntry).title === "string"
  );
}

function parseEntries(raw: string | null): FavoriteEntry[] {
  if (!raw) {
    return EMPTY_FAVORITES;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isFavoriteEntry)
      : EMPTY_FAVORITES;
  } catch {
    return EMPTY_FAVORITES;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

// localStorage는 같은 탭의 변경을 storage 이벤트로 알려주지 않아서,
// addFavorite/removeFavorite이 쓰기 후 직접 notify한다.
export function subscribeFavorites(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getFavoritesSnapshot(): FavoriteEntry[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedEntries = parseEntries(raw);
  }
  return cachedEntries;
}

export function getServerFavoritesSnapshot(): FavoriteEntry[] {
  return EMPTY_FAVORITES;
}

export function isFavorite(entries: FavoriteEntry[], date: string): boolean {
  return entries.some((entry) => entry.date === date);
}

function persist(entries: FavoriteEntry[]) {
  const raw = JSON.stringify(entries);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedEntries = entries;
  notify();
}

export function addFavorite(entry: FavoriteEntry): void {
  const current = getFavoritesSnapshot();
  if (isFavorite(current, entry.date)) {
    return;
  }
  persist([...current, entry]);
}

export function removeFavorite(date: string): void {
  persist(getFavoritesSnapshot().filter((entry) => entry.date !== date));
}
