"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
      <p className="text-zinc-600 dark:text-zinc-400">
        오늘의 우주 사진을 가져오는 동안 문제가 생겼어요.
      </p>
      <Button onClick={() => retry()}>다시 시도하기</Button>
    </div>
  );
}
