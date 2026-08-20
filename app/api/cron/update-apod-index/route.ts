import { NextResponse, type NextRequest } from "next/server";
import { todayString } from "@/lib/apod";
import { fetchApodRange, readIndex, writeIndex } from "@/lib/apod-index";

function nextDay(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// 검색 인덱스를 하루 1회 최신 날짜까지 채워 넣는다. Vercel Cron Job이 이 라우트를
// 매일 호출한다(vercel.json). 로컬 개발 서버는 Cron 스케줄을 지원하지 않아,
// 이 라우트를 직접 호출해서만 동작을 확인할 수 있다.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await readIndex();
  const today = todayString();
  const latestDate = existing.at(-1)?.date;

  if (latestDate === today) {
    return NextResponse.json({ updated: false, latestDate });
  }

  const startDate = latestDate ? nextDay(latestDate) : today;
  const fresh = await fetchApodRange(startDate, today);

  await writeIndex([...existing, ...fresh]);

  return NextResponse.json({
    updated: true,
    added: fresh.length,
    startDate,
    endDate: today,
  });
}
