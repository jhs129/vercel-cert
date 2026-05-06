import type { RegisteredComponent } from "@builder.io/sdk-react";
import { themeInput } from "@/lib/builder-inputs";
import CategoryBrowse from ".";

export const CategoryBrowseRegistration: RegisteredComponent = {
  component: CategoryBrowse,
  name: "CategoryBrowse",
  inputs: [
    {
      name: "title",
      type: "string",
      defaultValue: "Browse Articles",
      helperText: "Heading displayed above the category navigation bar.",
    },
    themeInput,
  ],
};
