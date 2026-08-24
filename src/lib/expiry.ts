// 食材の消費期限ロジック。表示（getExpiryStatus）とグルーピング（isExpiringSoon）で
// 同一の基準時刻 now を共有し、判定がぶれないようにする。

// expiresAt から now までの残り日数（切り上げ）。expiresAt が無い場合は null。
function diffDaysUntil(expiresAt: string, now: number): number {
  return Math.ceil((new Date(expiresAt).getTime() - now) / (1000 * 60 * 60 * 24));
}

// 「消費期限が近い」かどうか。期限なしは false。残り3日以内（期限切れ含む）で true。
export function isExpiringSoon(expiresAt: string | null, now: number): boolean {
  if (!expiresAt) return false;
  return diffDaysUntil(expiresAt, now) <= 3;
}

// now: 期限判定の基準時刻（ms）。グルーピング（isExpiringSoon）と同じ値を渡して表示と判定を一致させる
export function getExpiryStatus(
  expiresAt: string | null,
  now: number
): { label: string; className: string } | null {
  if (!expiresAt) return null;
  const diffDays = diffDaysUntil(expiresAt, now);
  if (diffDays < 0) return { label: "期限切れ", className: "text-red-600 bg-red-50 dark:bg-red-950/30" };
  if (diffDays === 0) return { label: "今日まで", className: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" };
  if (diffDays <= 3) return { label: `あと${diffDays}日`, className: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30" };
  return { label: `あと${diffDays}日`, className: "text-muted-foreground bg-muted/50" };
}
