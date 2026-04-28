import { getImageProps } from "next/image";

export interface PictureSource {
  src: string;
  width: number;
  height: number;
  /** CSS media query string, e.g. "(min-width: 768px)" */
  media: string;
}

export interface PictureProps {
  /** Fallback source rendered when no <source> media query matches */
  defaultSrc: string;
  defaultWidth: number;
  defaultHeight: number;
  alt: string;
  /** Responsive sources listed from largest to smallest breakpoint */
  sources?: PictureSource[];
  className?: string;
  quality?: number;
  priority?: boolean;
}

/**
 * Art-direction <picture> element using Next.js getImageProps().
 * Each source gets an optimized srcSet; the default <img> is the smallest crop.
 * Use when different viewport sizes need different image crops or aspect ratios.
 */
export default function Picture({
  defaultSrc,
  defaultWidth,
  defaultHeight,
  alt,
  sources = [],
  className,
  quality = 80,
  priority = false,
}: PictureProps) {
  const { props: defaultProps } = getImageProps({
    src: defaultSrc,
    alt,
    width: defaultWidth,
    height: defaultHeight,
    quality,
    priority,
  });

  return (
    <picture className={className}>
      {sources.map(({ src, width, height, media }) => {
        const { props } = getImageProps({ src, alt, width, height, quality });
        return (
          <source
            key={media}
            srcSet={props.srcSet}
            media={media}
          />
        );
      })}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...defaultProps} />
    </picture>
  );
}
