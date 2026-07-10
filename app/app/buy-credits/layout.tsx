import { Sidebar } from "@/components/ui/Sidebar";

export default function BuyCreditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Sidebar>{children}</Sidebar>;
}
