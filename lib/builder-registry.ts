import type { RegisteredComponent } from "@builder.io/sdk-react";
import { CardImageRegistration } from "@/components/ui/CardImage/CardImage.builder";
import { ButtonRegistration } from "@/components/ui/Button/Button.builder";

export const customComponents: RegisteredComponent[] = [
  CardImageRegistration,
  ButtonRegistration,
];
