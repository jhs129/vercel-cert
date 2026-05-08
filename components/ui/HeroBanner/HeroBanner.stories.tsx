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
    autoPlayInterval: {
      control: { type: "number", min: 0, step: 500 },
      description: "Auto-play interval in ms. 0 disables auto-play.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof HeroBanner>;

export const SingleSlideWithImage: Story = {
  name: "Single Slide — No Controls",
  args: {
    slides: [
      {
        backgroundImage: "https://placehold.co/1920x1080.png",
        headline: "Build Something Amazing",
        body: "Our platform gives you the tools to create, ship, and scale products your customers will love — faster than ever before.",
        ctaLabel: "Get Started",
        ctaHref: "/sign-up",
        overlayEnabled: true,
      },
    ],
    theme: "light",
    autoPlayInterval: 0,
  },
};

export const MultiSlideAutoPlay: Story = {
  name: "Multi-Slide — Auto-Play",
  args: {
    slides: [
      {
        backgroundImage: "https://placehold.co/1920x1080.png",
        headline: "Slide One: Build at Speed",
        body: "Deploy globally in seconds with zero configuration. From local development to production in a single push.",
        ctaLabel: "Start Building",
        ctaHref: "/start",
        overlayEnabled: true,
      },
      {
        backgroundImage: "https://placehold.co/1920x1080/0070f3/ffffff.png",
        headline: "Slide Two: Scale Effortlessly",
        body: "Auto-scaling infrastructure that grows with your traffic. No DevOps required.",
        ctaLabel: "See How It Works",
        ctaHref: "/how-it-works",
        overlayEnabled: true,
      },
      {
        backgroundImage: "https://placehold.co/1920x1080/111111/ffffff.png",
        headline: "Slide Three: Collaborate Faster",
        body: "Share preview deployments with your team. Get feedback before you ship.",
        ctaLabel: "Explore Previews",
        ctaHref: "/previews",
        overlayEnabled: true,
      },
    ],
    theme: "light",
    autoPlayInterval: 3000,
  },
};

export const MultiSlideManualNav: Story = {
  name: "Multi-Slide — Manual Navigation Only",
  args: {
    slides: [
      {
        backgroundImage: "https://placehold.co/1920x1080.png",
        headline: "First Slide",
        body: "Auto-play is disabled. Use the arrow buttons or dot indicators to navigate between slides.",
        ctaLabel: "Learn More",
        ctaHref: "/learn",
        overlayEnabled: true,
      },
      {
        headline: "Second Slide — No Background",
        body: "This slide has no background image, using the theme background color instead.",
        ctaLabel: "Explore",
        ctaHref: "/explore",
        overlayEnabled: false,
      },
      {
        backgroundImage: "https://placehold.co/1920x1080/0070f3/ffffff.png",
        headline: "Third Slide",
        body: "Overlay disabled on a colored placeholder image.",
        ctaLabel: "Get Started",
        ctaHref: "/start",
        overlayEnabled: false,
      },
    ],
    theme: "light",
    autoPlayInterval: 0,
  },
};

export const DarkTheme: Story = {
  name: "Dark Theme — Multi-Slide",
  args: {
    slides: [
      {
        headline: "Dark Theme — First Slide",
        body: "Hero carousel rendered with the dark theme. No background image — uses the theme-dark CSS class.",
        ctaLabel: "Explore Now",
        ctaHref: "/explore",
      },
      {
        backgroundImage: "https://placehold.co/1920x1080/222222/ffffff.png",
        headline: "Dark Theme — With Image",
        body: "Dark background image with overlay and dark theme class applied at the carousel level.",
        ctaLabel: "View Details",
        ctaHref: "/details",
        overlayEnabled: true,
      },
    ],
    theme: "dark",
    autoPlayInterval: 4000,
  },
};

export const SingleSlideNoImage: Story = {
  name: "Single Slide — No Background Image",
  args: {
    slides: [
      {
        headline: "Clean Hero, No Image",
        body: "A minimal hero with no background image, relying solely on theme background color. Ideal for content-focused pages.",
        ctaLabel: "View All Articles",
        ctaHref: "/articles",
      },
    ],
    theme: "light",
    autoPlayInterval: 0,
  },
};
