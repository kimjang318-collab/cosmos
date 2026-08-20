import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 오늘의 우주 사진 또는 안내 문구가 보인다", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle("오늘의 우주 사진");

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible({ timeout: 30_000 });

  const photo = page.getByRole("img", { name: await heading.textContent() ?? "" });
  const video = page.locator("video, iframe");
  const failureNotice = page.getByText("오늘의 우주 사진을 가져오지 못했어요");

  await expect(photo.or(video).or(failureNotice)).toBeVisible();
});
