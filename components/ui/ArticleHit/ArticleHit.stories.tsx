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
    title: "This Is a Much Longer Article Title That Might Wrap to Multiple Lines in Narrow Containers",
    slug: "long-title-article",
  },
};

export const WithMetadata: Story = {
  args: {
    title: "Getting Started with Next.js",
    slug: "getting-started-with-nextjs",
    publishDate: new Date("2024-03-15").getTime(),
    description: "A comprehensive guide to building modern web applications with Next.js App Router.",
    categories: ["Next.js", "React", "Web Development"],
  },
};

export const WithDateAndDescription: Story = {
  args: {
    title: "Understanding Tailwind CSS v4",
    slug: "tailwind-css-v4",
    publishDate: new Date("2025-01-20").getTime(),
    description: "Explore the major changes in Tailwind CSS v4 and how to migrate your project.",
  },
};

export const MultipleResults: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-96">
      <ArticleHit
        title="Introduction to TypeScript"
        slug="intro-to-typescript"
        publishDate={new Date("2024-01-10").getTime()}
        description="Learn the basics of TypeScript and why it improves developer experience."
        categories={["TypeScript", "JavaScript"]}
      />
      <ArticleHit
        title="React Server Components Explained"
        slug="react-server-components"
        publishDate={new Date("2024-02-05").getTime()}
        categories={["React", "Next.js"]}
      />
      <ArticleHit
        title="Tailwind CSS Best Practices"
        slug="tailwind-css-best-practices"
      />
    </div>
  ),
};
