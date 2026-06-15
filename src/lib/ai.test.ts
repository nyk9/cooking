import { test, expect, describe } from "bun:test";
import { MODEL_IDS, DEFAULT_MODEL, MODELS } from "@/lib/ai";

// MODEL_IDS / DEFAULT_MODEL / MODELS の間に齟齬が生まれないようガードする。
// （モデル一覧をいじったときに片方だけ更新するミスを検知）
describe("AI model 定義の整合性", () => {
  test("DEFAULT_MODEL は MODEL_IDS に含まれる", () => {
    expect(MODEL_IDS).toContain(DEFAULT_MODEL);
  });

  test("MODELS の各 id は MODEL_IDS に含まれる", () => {
    for (const m of MODELS) {
      expect(MODEL_IDS).toContain(m.id);
    }
  });

  test("MODELS の id に重複がない", () => {
    const ids = MODELS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("MODELS は MODEL_IDS をすべて網羅する", () => {
    expect(MODELS.length).toBe(MODEL_IDS.length);
  });

  test("各 MODELS エントリに label がある", () => {
    for (const m of MODELS) {
      expect(m.label.length).toBeGreaterThan(0);
    }
  });
});
