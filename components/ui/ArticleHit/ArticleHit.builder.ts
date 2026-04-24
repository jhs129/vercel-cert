import type { RegisteredComponent } from "@builder.io/sdk-react";
import { ArticleHit } from ".";

export const ArticleHitRegistration: RegisteredComponent = {
  component: ArticleHit,
  name: "ArticleHit",
  inputs: [
    {
      name: "title",
      type: "string",
      required: true,
      defaultValue: "Article Title",
      helperText: "The title of the article",
    },
    {
      name: "slug",
      type: "string",
      required: true,
      defaultValue: "hello-world",
      helperText: "The URL the article title links to",
    },
  ],
};
