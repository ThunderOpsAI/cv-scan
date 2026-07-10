import { Sidebar } from "@/components/ui/Sidebar";

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Sidebar>{children}</Sidebar>;
}
