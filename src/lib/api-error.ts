// APIのエラーレスポンス（{ error: string }）からメッセージを取り出す。
// 非JSONレスポンスや error が文字列でない場合（zodのflatten等）は fallback を返す
export async function apiErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // 非JSONレスポンス
  }
  return fallback;
}
