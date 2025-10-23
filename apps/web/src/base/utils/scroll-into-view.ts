export function scrollIntoView(ref: React.RefObject<HTMLDivElement | null>) {
  ref.current?.scrollIntoView({ behavior: "smooth" });
}
