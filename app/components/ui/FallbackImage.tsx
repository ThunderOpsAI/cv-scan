import type { ImgHTMLAttributes } from "react";

// Next.js Image fallback for dynamic import
export default function FallbackImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt || ""} />;
}
