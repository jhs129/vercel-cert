import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardImage from "./index";

const meta: Meta<typeof CardImage> = {
  title: "UI/CardImage",
  component: CardImage,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "select",
      options: ["light", "dark"],
    },
    slug: {
      control: "text",
    },
    headingLevel: {
      control: "select",
      options: [2, 3, 4],
    },
  },
};

export default meta;

type Story = StoryObj<typeof CardImage>;

export const AllSlotsFilled: Story = {
  args: {
    src: "https://placehold.co/600x338.png",
    alt: "A placeholder image showing a card with all content slots filled",
    headline: "Introducing the Next Generation Platform",
    slug: "next-generation-platform",
    body: "Our platform brings together cutting-edge technology and intuitive design to help teams ship faster, collaborate better, and build products their customers love.",
    headingLevel: 3,
    theme: "light",
    children: (
      <a
        href="#"
        className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
      >
        Learn More
      </a>
    ),
  },
};

export const DarkTheme: Story = {
  args: {
    src: "https://placehold.co/600x338.png",
    alt: "A placeholder image for a dark-themed card",
    headline: "Dark Theme Variant",
    slug: "dark-theme-variant",
    body: "This card uses the dark theme, providing high contrast against dark backgrounds while maintaining WCAG AA compliance.",
    headingLevel: 3,
    theme: "dark",
    children: (
      <a
        href="#"
        className="inline-block rounded-md bg-background text-foreground text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
      >
        Learn More
      </a>
    ),
  },
};

export const LongContent: Story = {
  name: "Long Content (Truncated)",
  args: {
    src: "https://placehold.co/600x338.png",
    alt: "A placeholder image for a card with long content",
    headline: "This is a Very Long Headline That Should Be Truncated After Two Lines of Text",
    slug: "very-long-headline-truncation-example",
    body: "This is a very long body text that should be clamped after three lines. It keeps going and going to demonstrate the line-clamp behavior. The text will be cut off with an ellipsis after three lines regardless of how much content is provided.",
    headingLevel: 3,
    theme: "light",
    children: (
      <a
        href="#"
        className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
      >
        Read More
      </a>
    ),
  },
};

export const DecorativeImage: Story = {
  name: "Decorative Image (Empty Alt)",
  args: {
    src: "https://placehold.co/600x338.png",
    alt: "",
    headline: "Decorative Image Card",
    slug: "decorative-image-card",
    body: "This card uses an empty alt string, marking the image as decorative so screen readers skip it.",
    headingLevel: 3,
    theme: "light",
  },
};

export const H2Heading: Story = {
  name: "H2 Heading Level",
  args: {
    src: "https://placehold.co/600x338.png",
    alt: "A feature card image",
    headline: "Feature Section Heading",
    slug: "feature-section-heading",
    body: "Using an h2 heading level for cards that are primary section headings on the page.",
    headingLevel: 2,
    theme: "light",
    children: (
      <a
        href="#"
        className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
      >
        Explore
      </a>
    ),
  },
};

export const MultiCardRow: Story = {
  name: "Multi-Card Row (Equal Height + CTA Alignment)",
  render: () => (
    <div className="flex flex-row gap-6 items-stretch">
      <CardImage
        src="https://placehold.co/600x338.png"
        alt="First card image"
        headline="Short Headline"
        slug="short-headline"
        body="Brief body."
        theme="light"
      >
        <a
          href="#"
          className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
        >
          CTA
        </a>
      </CardImage>
      <CardImage
        src="https://placehold.co/600x338.png"
        alt="Second card image"
        headline="Medium Length Headline That Takes Two Lines"
        slug="medium-length-headline-two-lines"
        body="This card has a moderately long body text that takes up more vertical space than the first card, demonstrating equal height behavior."
        theme="light"
      >
        <a
          href="#"
          className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
        >
          CTA
        </a>
      </CardImage>
      <CardImage
        src="https://placehold.co/600x338.png"
        alt="Third card image"
        headline="Another Card"
        slug="another-card"
        body="Short body text."
        theme="light"
      >
        <a
          href="#"
          className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
        >
          CTA
        </a>
      </CardImage>
    </div>
  ),
};
