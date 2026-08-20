import { get, put } from "@vercel/blob";

export type ApodIndexEntry = {
  date: string;
  title: string;
  explanation: string;
};

const INDEX_PATHNAME = "apod-index.json";

function blobToken() {
  return process.env.KJ_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
}

function apiKey() {
  return process.env.NASA_API_KEY || "DEMO_KEY";
}

// NASA APOD API는 키워드 검색을 지원하지 않고, 검색 시점마다 넓은 기간을
// 직접 조회하면 매우 느리거나 실패한다(docs/decisions/apod-search-scope.md 참고).
// 그래서 start_date/end_date로 받아온 항목을 검색용 인덱스에 미리 쌓아둔다.
export async function fetchApodRange(
  startDate: string,
  endDate: string
): Promise<ApodIndexEntry[]> {
  const params = new URLSearchParams({
    api_key: apiKey(),
    start_date: startDate,
    end_date: endDate,
  });
  const res = await fetch(`https://api.nasa.gov/planetary/apod?${params}`);

  if (!res.ok) {
    throw new Error(
      `NASA APOD range 요청 실패: ${res.status} (${startDate}~${endDate})`
    );
  }

  const photos = (await res.json()) as Array<{
    date: string;
    title: string;
    explanation: string;
  }>;

  return photos.map(({ date, title, explanation }) => ({
    date,
    title,
    explanation,
  }));
}

export async function readIndex(): Promise<ApodIndexEntry[]> {
  // get()은 blob이 없을 때 null을 반환하고(정상적인 "아직 백필 전" 상태),
  // 인증 실패·네트워크 오류 등 진짜 문제일 때는 예외를 던진다. 그 예외는
  // 여기서 삼키지 않고 호출자에게 그대로 전달해서, 실패를 "빈 인덱스"로
  // 오인해 인덱스를 통째로 덮어쓰는 일이 없게 한다.
  const result = await get(INDEX_PATHNAME, {
    access: "private",
    token: blobToken(),
    useCache: false,
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return [];
  }

  return (await new Response(result.stream).json()) as ApodIndexEntry[];
}

export async function writeIndex(entries: ApodIndexEntry[]): Promise<void> {
  await put(INDEX_PATHNAME, JSON.stringify(entries), {
    access: "private",
    token: blobToken(),
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export function searchIndex(entries: ApodIndexEntry[], query: string) {
  const needle = query.toLowerCase();
  return entries
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(needle) ||
        entry.explanation.toLowerCase().includes(needle)
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
