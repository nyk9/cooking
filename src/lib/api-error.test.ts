import { test, expect, describe } from "bun:test";
import { apiErrorMessage } from "@/lib/api-error";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });

describe("apiErrorMessage", () => {
  test("error が文字列ならそのまま返す", async () => {
    const res = jsonResponse({ error: "保存に失敗しました" });
    expect(await apiErrorMessage(res, "fallback")).toBe("保存に失敗しました");
  });

  test("error がオブジェクト（zod flatten 等）なら fallback", async () => {
    const res = jsonResponse({
      error: { formErrors: [], fieldErrors: { name: ["必須です"] } },
    });
    expect(await apiErrorMessage(res, "fallback")).toBe("fallback");
  });

  test("error キーが無ければ fallback", async () => {
    const res = jsonResponse({});
    expect(await apiErrorMessage(res, "fallback")).toBe("fallback");
  });

  test("非JSON本文なら fallback", async () => {
    const res = new Response("<html>500</html>", {
      headers: { "Content-Type": "text/html" },
    });
    expect(await apiErrorMessage(res, "fallback")).toBe("fallback");
  });

  test("空ボディなら fallback", async () => {
    const res = new Response("");
    expect(await apiErrorMessage(res, "fallback")).toBe("fallback");
  });
});
