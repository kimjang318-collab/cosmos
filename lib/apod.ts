export type ApodPhoto = {
  date: string;
  title: string;
  explanation: string;
  media_type: string;
  url: string;
  hdurl?: string;
};

export type ApodResult =
  | { success: true; photo: ApodPhoto }
  | { success: false; status: number };

export const MIN_DATE = "1995-06-16";

const DIRECT_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".ogv"];

// NASA APOD의 video url은 유튜브 등 외부 플랫폼 embed 링크이거나,
// apod.nasa.gov가 직접 호스팅하는 영상 파일(mp4 등)일 수 있다.
// 후자는 iframe이 아니라 video 태그로 재생해야 화면에 나온다.
export function isDirectVideoFile(url: string) {
  const path = url.split("?")[0].toLowerCase();
  return DIRECT_VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function apiKey() {
  return process.env.NASA_API_KEY || "DEMO_KEY";
}

export async function fetchApod(date?: string): Promise<ApodResult> {
  const params = new URLSearchParams({ api_key: apiKey() });
  if (date) {
    params.set("date", date);
  }
  const res = await fetch(`https://api.nasa.gov/planetary/apod?${params}`);

  if (!res.ok) {
    return { success: false, status: res.status };
  }

  const photo = (await res.json()) as ApodPhoto;
  return { success: true, photo };
}
