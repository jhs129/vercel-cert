import type { RegisteredComponent } from "@builder.io/sdk-react";
import { themeInput, STYLABLE_BUILDER_INPUT } from "@/lib/builder-inputs";
import Button from ".";

export const ButtonRegistration: RegisteredComponent = {
  component: Button,
  name: "Button",
  inputs: [
    {
      name: "label",
      type: "string",
      defaultValue: "Click me",
      helperText: "The text displayed inside the button.",
    },
    {
      name: "href",
      type: "url",
      required: false,
      helperText: "When provided, the button renders as an <a> tag linking to this URL.",
    },
    {
      name: "variant",
      type: "string",
      enum: ["primary", "secondary"],
      defaultValue: "primary",
      helperText: "Controls the visual style of the button.",
    },
    themeInput,
    STYLABLE_BUILDER_INPUT,
  ],
};
