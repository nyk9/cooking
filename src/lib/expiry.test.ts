import { test, expect, describe } from "bun:test";
import { getExpiryStatus, isExpiringSoon } from "@/lib/expiry";

// 基準時刻を固定し、そこから相対的に期限日を作る
const NOW = new Date("2026-06-15T00:00:00.000Z").getTime();
const DAY = 1000 * 60 * 60 * 24;
// now から daysFromNow 日後の ISO 文字列
const at = (daysFromNow: number) => new Date(NOW + daysFromNow * DAY).toISOString();

describe("getExpiryStatus", () => {
  test("expiresAt が null なら null", () => {
    expect(getExpiryStatus(null, NOW)).toBeNull();
  });

  test("期限切れ（過去）", () => {
    const status = getExpiryStatus(at(-1), NOW);
    expect(status?.label).toBe("期限切れ");
    expect(status?.className).toContain("red");
  });

  test("今日まで（残り0日）", () => {
    const status = getExpiryStatus(at(0), NOW);
    expect(status?.label).toBe("今日まで");
    expect(status?.className).toContain("orange");
  });

  test("残り1日は警告表示", () => {
    const status = getExpiryStatus(at(1), NOW);
    expect(status?.label).toBe("あと1日");
    expect(status?.className).toContain("yellow");
  });

  test("残り3日は警告表示の境界内", () => {
    const status = getExpiryStatus(at(3), NOW);
    expect(status?.label).toBe("あと3日");
    expect(status?.className).toContain("yellow");
  });

  test("残り4日は通常表示（muted）", () => {
    const status = getExpiryStatus(at(4), NOW);
    expect(status?.label).toBe("あと4日");
    expect(status?.className).toContain("muted");
  });
});

describe("isExpiringSoon", () => {
  test("expiresAt が null なら false", () => {
    expect(isExpiringSoon(null, NOW)).toBe(false);
  });

  test("期限切れは true", () => {
    expect(isExpiringSoon(at(-1), NOW)).toBe(true);
  });

  test("残り3日以内は true（境界: 3日）", () => {
    expect(isExpiringSoon(at(3), NOW)).toBe(true);
  });

  test("残り4日は false（境界の外）", () => {
    expect(isExpiringSoon(at(4), NOW)).toBe(false);
  });

  test("表示とグルーピングが同じ基準で一致する", () => {
    // isExpiringSoon が true の食材は、表示側でも警告系（期限切れ/今日まで/あとN日 警告）になる
    const soon = at(2);
    expect(isExpiringSoon(soon, NOW)).toBe(true);
    expect(getExpiryStatus(soon, NOW)?.label).toBe("あと2日");
  });
});
