// Next.js Image fallback for dynamic import
export default function FallbackImage(props: any) {
  // fallback to <img> if next/image import fails
  return <img {...props} />;
}
