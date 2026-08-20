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
  const failureNotice = page.getByText("NASA 우주 사진을 가져오지 못했어요");

  await expect(photo.or(video).or(failureNotice)).toBeVisible();
});

test("날짜를 선택하면 그 날짜의 사진으로 바뀌고 주소에 남는다", async ({
  page,
}) => {
  await page.goto("/");

  await page.locator('input[type="date"]').fill("2020-01-01");
  await page.getByRole("button", { name: "보기" }).click();

  await expect(page).toHaveURL(/date=2020-01-01/);
  await expect(page.locator('input[type="date"]')).toHaveValue(
    "2020-01-01",
    { timeout: 30_000 }
  );
});

test("키워드로 검색하면 결과 목록에서 그 날짜의 사진으로 이동한다", async ({
  page,
}) => {
  await page.goto("/search?q=galaxy");

  const noResult = page.getByText("일치하는 사진을 찾지 못했어요");
  const results = page.locator('a[href^="/?date="]');

  await expect(noResult.or(results.first())).toBeVisible({ timeout: 30_000 });

  if (await results.count()) {
    const href = await results.first().getAttribute("href");
    await results.first().click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/[/?]/g, "\\$&")));
  }
});

test("일치하지 않는 검색어는 결과 없음 안내를 보여준다", async ({ page }) => {
  await page.goto(
    "/search?q=zzzznonexistentkeywordthatshouldneverappearzzzz"
  );

  await expect(
    page.getByText("일치하는 사진을 찾지 못했어요")
  ).toBeVisible({ timeout: 30_000 });
});

test("즐겨찾기에 추가하면 목록에 나타나고, 제거하면 사라진다", async ({
  page,
}) => {
  await page.goto("/");

  const addButton = page.getByRole("button", { name: "즐겨찾기에 추가" });
  await expect(addButton).toBeVisible({ timeout: 30_000 });
  const title = await page.getByRole("heading", { level: 1 }).textContent();
  await addButton.click();

  await expect(
    page.getByRole("button", { name: "즐겨찾기 됨" })
  ).toBeVisible();

  await page.getByRole("link", { name: "즐겨찾기" }).click();
  await expect(page).toHaveURL(/\/favorites/);
  await expect(page.getByText(title ?? "")).toBeVisible();

  await page.getByRole("button", { name: "제거" }).click();
  await expect(page.getByText("아직 즐겨찾기한 사진이 없어요")).toBeVisible();

  await page.getByRole("link", { name: "오늘 사진으로" }).click();
  await expect(
    page.getByRole("button", { name: "즐겨찾기에 추가" })
  ).toBeVisible({ timeout: 30_000 });
});
