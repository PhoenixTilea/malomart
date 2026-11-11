import type { infer as zinfer } from "zod";
import { literal, set, strictObject, string, union, enum as zenum } from "zod";

import { Id, MultilineText, NonnegativeInt, PlainText, PositiveInt } from "../common";

export const Category = {
  Armor: "Armor",
  Arrows: "Arrows",
  Bombs: "Bombs",
  Food: "Food",
  Gadgets: "Gadgets",
  Masks: "Masks",
  Misc: "Misc",
  Potions: "Potions",
  Shields: "Shields",
  Weapons: "Weapons"
} as const;
export const MAX_FEATURES = 10;

export const CategorySchema = zenum(Category).meta({ id: "ProductCategory" });
export type Category = (typeof Category)[keyof typeof Category];

export const Product = strictObject({
  id: Id,
  title: PlainText.min(3, { error: "Titles need at least 3 characters." })
    .max(64, { error: "Titles can't be longer than 64 characters." })
    .meta({ description: "The name of the product.", example: "Mask of Truth" }),
  description: MultilineText.min(3, { error: "Descriptions need at least 3 characters." })
    .max(500, { error: "Descriptions can't be longer than 500 characters." })
    .meta({ example: "Allows you to see into the minds of others." }),
  category: CategorySchema.meta({ example: Category.Masks }),
  price: PositiveInt.meta({ example: 80 }),
  stockCount: NonnegativeInt.meta({ example: 2 }),
  inStock: union([literal(0), literal(1)]),
  originalPrice: PositiveInt.nullish(),
  thumbnailKey: string().nonempty().nullish(),
  imageKeys: set(string().nonempty()).optional(),
  features: PlainText.nonempty({ error: "Enter a feature or remove it." })
    .max(100, { error: "Features can't be longer than 100 characters." })
    .array()
    .max(MAX_FEATURES)
});
export type Product = zinfer<typeof Product>;

export const ImageUploadStatus = {
  Pending: "Pending",
  Ready: "Ready",
  Duplicate: "Duplicate",
  Rejected: "Rejected"
} as const;
export const ImageUploadStatusSchema = zenum(ImageUploadStatus).meta({ id: "ImageUploadStatus" });
export type ImageUploadStatus = (typeof ImageUploadStatus)[keyof typeof ImageUploadStatus];

export const ImageUpload = strictObject({
  id: Id,
  productId: Id,
  status: ImageUploadStatusSchema,
  imageKey: string().nonempty().optional(),
  expiresAt: PositiveInt.meta({ description: "Epoch seconds when the record is removed by TTL." })
});
export type ImageUpload = zinfer<typeof ImageUpload>;
