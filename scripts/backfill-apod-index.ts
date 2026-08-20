import { MIN_DATE, todayString } from "../lib/apod";
import {
  fetchApodRange,
  writeIndex,
  type ApodIndexEntry,
} from "../lib/apod-index";

// 검색 인덱스를 처음 채우는 1회성 스크립트. `bun run backfill:apod`로 실행한다.
// NASA APOD range 조회는 구간이 넓으면 느려지거나 실패해서(관련 근거:
// docs/decisions/apod-search-scope.md), 60일 단위로 나눠 순차 요청한다.
const CHUNK_DAYS = 60;

function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function fetchChunkWithRetry(
  start: string,
  end: string,
  retries = 3
): Promise<ApodIndexEntry[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchApodRange(start, end);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.warn(
        `  재시도 ${attempt}/${retries}: ${start}~${end} 실패 (${
          (error as Error).message
        }), 3초 후 다시 시도`
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw new Error("unreachable");
}

async function main() {
  const today = todayString();
  const all: ApodIndexEntry[] = [];

  let start = MIN_DATE;
  while (start <= today) {
    const rawEnd = addDays(start, CHUNK_DAYS - 1);
    const end = rawEnd > today ? today : rawEnd;

    console.log(`가져오는 중: ${start} ~ ${end}`);
    const chunk = await fetchChunkWithRetry(start, end);
    all.push(...chunk);

    start = addDays(end, 1);
  }

  console.log(`총 ${all.length}건 수집, Blob에 저장 중...`);
  await writeIndex(all);
  console.log("완료!");
}

main().catch((error) => {
  console.error("백필 실패:", error);
  process.exit(1);
});
