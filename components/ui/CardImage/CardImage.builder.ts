import { register } from "@builder.io/sdk-react";
import { themeInput, STYLABLE_BUILDER_INPUT } from "@/lib/builder-inputs";
import CardImage from ".";

register("component", {
  component: CardImage,
  name: "CardImage",
  canHaveChildren: true,
  inputs: [
    {
      name: "src",
      type: "file",
      allowedFileTypes: ["jpeg", "jpg", "png", "webp", "gif", "svg"],
      required: true,
      defaultValue: "https://placehold.co/600x338.png",
      helperText: "Card image (16:9 aspect ratio recommended)",
    },
    {
      name: "alt",
      type: "string",
      defaultValue: "",
      required: true,
      helperText: "Alt text for the image. Leave empty for decorative images.",
    },
    {
      name: "headline",
      type: "string",
      defaultValue: "Card Headline",
      required: true,
      helperText: "The card headline (clamped to 2 lines)",
    },
    {
      name: "body",
      type: "longText",
      defaultValue: "Card body text goes here. Longer text will be truncated after three lines.",
      required: true,
      helperText: "Body text (clamped to 3 lines)",
    },
    {
      name: "headingLevel",
      type: "number",
      enum: [2, 3, 4],
      defaultValue: 3,
      helperText: "Semantic heading level for the headline (h2, h3, or h4)",
    },
    themeInput,
    STYLABLE_BUILDER_INPUT,
  ],
});
