"use client";

import { useState } from "react";

export function ApodImage({
  src,
  fallbackSrc,
  alt,
  className,
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- NASA APOD 이미지는 매일 임의의 외부 도메인에서 오므로 next/image 도메인 허용 목록으로 다루지 않는다.
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        // NASA API가 hdurl 필드를 주더라도 실제 파일은 404일 수 있다(2026-08-20 실사례로 확인).
        // 그럴 때 일반 화질 url로 자동 전환한다.
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
