import { guid, number, string } from "zod";

export const Id = guid().meta({
  id: "ID",
  description: "A UUID-shaped identifier. Cognito user IDs don't always use a standard UUID version or variant."
});
export const NonnegativeInt = number().int().nonnegative();
export const PositiveInt = number().int().positive();

export const PlainText = string()
  .trim()
  .normalize("NFC")
  .regex(/^[^\p{Cc}\u202A-\u202E\u2066-\u2069]*$/u, {
    error: "Remove any line breaks or hidden formatting characters."
  });

export const MultilineText = string()
  .trim()
  .normalize("NFC")
  .regex(/^(?:\n|[^\p{Cc}\u202A-\u202E\u2066-\u2069])*$/u, {
    error: "Remove any tabs or hidden formatting characters."
  });
