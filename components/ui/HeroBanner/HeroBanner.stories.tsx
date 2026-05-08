import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroBanner from "./index";

const meta: Meta<typeof HeroBanner> = {
  title: "UI/HeroBanner",
  component: HeroBanner,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "select",
      options: ["light", "dark"],
    },
    overlayEnabled: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof HeroBanner>;

export const WithBackgroundImage: Story = {
  args: {
    backgroundImage: "https://placehold.co/1920x1080.png",
    headline: "Build Something Amazing",
    body: "Our platform gives you the tools to create, ship, and scale products your customers will love — faster than ever before.",
    ctaLabel: "Get Started",
    ctaHref: "/sign-up",
    overlayEnabled: true,
    theme: "light",
  },
};

export const OverlayDisabled: Story = {
  args: {
    backgroundImage: "https://placehold.co/1920x1080.png",
    headline: "No Overlay Variant",
    body: "This variant shows the background image without a dark overlay. Best used with lighter images where text contrast is sufficient.",
    ctaLabel: "Learn More",
    ctaHref: "/learn",
    overlayEnabled: false,
    theme: "light",
  },
};

export const DarkThemeNoImage: Story = {
  name: "Dark Theme — No Background Image",
  args: {
    headline: "Dark Theme Fallback",
    body: "When no background image is provided, the component falls back to the theme background color. This dark variant uses the theme-dark CSS class.",
    ctaLabel: "Explore Now",
    ctaHref: "/explore",
    overlayEnabled: true,
    theme: "dark",
  },
};

export const LightThemeNoImage: Story = {
  name: "Light Theme — No Background Image",
  args: {
    headline: "Light Theme Fallback",
    body: "Clean hero section with no background image, using the light theme background. Ideal for content-focused pages without a hero visual.",
    ctaLabel: "View All Articles",
    ctaHref: "/articles",
    overlayEnabled: true,
    theme: "light",
  },
};

export const LongContent: Story = {
  name: "Long Content (Overflow Check)",
  args: {
    backgroundImage: "https://placehold.co/1920x1080.png",
    headline: "This Is a Very Long Headline That Spans Multiple Lines to Verify the Layout Handles Overflow Correctly Without Obscuring the CTA",
    body: "This is an intentionally long body paragraph to verify that the hero layout handles extended content gracefully. The text should wrap naturally, maintain proper line height, and the call-to-action button should remain fully visible and accessible below the body copy regardless of how much text is present above it.",
    ctaLabel: "Read the Full Story",
    ctaHref: "/story",
    overlayEnabled: true,
    theme: "light",
  },
};
