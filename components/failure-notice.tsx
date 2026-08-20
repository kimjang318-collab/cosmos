export function FailureNotice({ status }: { status: number }) {
  return (
    <>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        NASA 우주 사진을 가져오지 못했어요
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        잠시 후 다시 시도해 주세요. (오류 코드: {status})
      </p>
    </>
  );
}
