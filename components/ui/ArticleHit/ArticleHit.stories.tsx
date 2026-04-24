import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArticleHit } from "./index";

const meta: Meta<typeof ArticleHit> = {
  title: "UI/ArticleHit",
  component: ArticleHit,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ArticleHit>;

export const Default: Story = {
  args: {
    title: "Article Title",
    slug: "hello-world",
  },
};

export const LongTitle: Story = {
  args: {
    title:
      "This Is a Much Longer Article Title That Might Wrap to Multiple Lines in Narrow Containers",
    slug: "long-title-article",
  },
};

export const MultipleResults: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ArticleHit title="Introduction to TypeScript" slug="intro-to-typescript" />
      <ArticleHit title="React Server Components Explained" slug="react-server-components" />
      <ArticleHit title="Tailwind CSS Best Practices" slug="tailwind-css-best-practices" />
    </div>
  ),
};
