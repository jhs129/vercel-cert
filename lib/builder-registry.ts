import type { RegisteredComponent } from "@builder.io/sdk-react";
import { CardImageRegistration } from "@/components/ui/CardImage/CardImage.builder";
import { ButtonRegistration } from "@/components/ui/Button/Button.builder";
import { ArticleHitRegistration } from "@/components/ui/ArticleHit/ArticleHit.builder";
import { CategoryBrowseRegistration } from "@/components/ui/CategoryBrowse/CategoryBrowse.builder";

export const customComponents: RegisteredComponent[] = [
  CardImageRegistration,
  ButtonRegistration,
  ArticleHitRegistration,
  CategoryBrowseRegistration,
];
