"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "レシピ名を入力してください"),
  description: z.string().optional(),
  ingredients: z.array(z.object({ name: z.string().min(1), amount: z.string() })).min(1),
  steps: z.array(z.object({ value: z.string().min(1) })).min(1),
  cookTime: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  tags: z.string().optional(),
  rating: z.union([z.coerce.number().int().min(1).max(5), z.literal("")]).optional(),
  memo: z.string().optional(),
});
interface FormValues {
  name: string;
  description?: string;
  ingredients: { name: string; amount: string }[];
  steps: { value: string }[];
  cookTime?: number | "";
  tags?: string;
  rating?: number | "";
  memo?: string;
}

export default function NewRecipePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      ingredients: [{ name: "", amount: "" }],
      steps: [{ value: "" }],
    },
  });

  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({ control, name: "ingredients" });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: "steps" });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description || undefined,
        ingredients: data.ingredients,
        steps: data.steps.map((s) => s.value),
        cookTime: data.cookTime || undefined,
        tags: data.tags ? data.tags.split(/[,、]/).map((t) => t.trim()).filter(Boolean) : [],
        rating: data.rating || undefined,
        memo: data.memo || undefined,
        source: "USER_CREATED",
      }),
    });
    if (res.ok) {
      const recipe = await res.json();
      router.push(`/recipes/${recipe.id}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">レシピを登録</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">レシピ名 *</label>
          <input
            {...register("name")}
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            placeholder="例: チキンカレー"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">説明</label>
          <textarea
            {...register("description")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[60px]"
            placeholder="このレシピの概要"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">材料 *</label>
          {ingFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`ingredients.${i}.name`)}
                placeholder="食材名"
                className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
              />
              <input
                {...register(`ingredients.${i}.amount`)}
                placeholder="量"
                className="w-24 h-9 rounded-md border bg-background px-3 text-sm"
              />
              <button
                type="button"
                onClick={() => removeIng(i)}
                className="h-9 px-2 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendIng({ name: "", amount: "" })}
            className="text-sm text-primary hover:underline"
          >
            + 材料を追加
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">作り方 *</label>
          {stepFields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="flex-shrink-0 w-6 h-9 flex items-center justify-center text-xs text-muted-foreground font-bold">
                {i + 1}
              </span>
              <input
                {...register(`steps.${i}.value`)}
                placeholder={`手順 ${i + 1}`}
                className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="h-9 px-2 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendStep({ value: "" })}
            className="text-sm text-primary hover:underline"
          >
            + 手順を追加
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">調理時間（分）</label>
            <input
              {...register("cookTime")}
              type="number"
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              placeholder="30"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">評価（1〜5）</label>
            <input
              {...register("rating")}
              type="number"
              min={1}
              max={5}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              placeholder="5"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">タグ（カンマ区切り）</label>
          <input
            {...register("tags")}
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            placeholder="例: 和食, 簡単, 時短"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">メモ</label>
          <textarea
            {...register("memo")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[60px]"
            placeholder="アレンジや気づきなど"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-10 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "保存中..." : "登録する"}
        </button>
      </form>
    </div>
  );
}
