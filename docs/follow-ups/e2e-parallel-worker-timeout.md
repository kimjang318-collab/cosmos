# E2E 테스트를 병렬로 돌리면 일부가 30초 타임아웃으로 실패한다

**Symptom**: `bun run test:e2e`(기본 병렬, 4 workers)를 돌리면 홈 화면 테스트가 `page.goto("/")` 단계에서 30초 타임아웃으로 실패한다. 같은 스펙 파일을 `npx playwright test --workers=1`로 순차 실행하면 5개 전부 통과한다.

**Observed evidence**: `feat/apod-favorites` 브랜치에서 검색+즐겨찾기를 합친 뒤 `bun run test:e2e`를 두 번 연속 실행, 매번 같은 테스트가 정확히 30.0~30.8초 구간에서 실패. `--workers=1`로는 14.1초에 5개 전부 통과. NASA API에 직접 curl 요청은 0.57초로 정상 응답.

**Suspected cause**: 이 프로젝트의 모든 페이지가 `fetch`를 캐시 없이(`cache` 옵션 미지정, 기본 비캐시) 매 요청마다 NASA APOD API로 실제 호출한다. E2E 테스트도 각 테스트가 실제 NASA 요청을 발생시키는데, 4개 워커가 동시에 로컬 `next dev`(Turbopack) 서버 하나에 요청을 몰아넣으면 컴파일·요청 처리가 밀리면서 일부 요청이 30초 안에 끝나지 못하는 것으로 보인다. NASA 쪽이 아니라 로컬 dev 서버(단일 Node 프로세스)의 동시 처리 한계로 추정.

**What was tried**: `--workers=1`로 순차 실행하면 안정적으로 통과하는 것을 확인했다. 근본 원인(로컬 dev 서버의 동시 처리 한계, 또는 테스트마다 실제 NASA 호출이 발생하는 구조)은 손대지 않았다.

**Proposed next step**: `playwright.config.ts`의 `fullyParallel`/`workers` 설정을 낮추거나, E2E에서 NASA 응답을 모킹해 실제 외부 호출을 줄이는 방안을 검토한다. CI 환경에서도 같은 현상이 나는지 별도로 확인이 필요하다.
