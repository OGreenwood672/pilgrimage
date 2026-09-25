import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | Bryn Jones Pilgrimage",
  description: "Secure management console for subscribers, progress broadcasts, and campaign settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 antialiased selection:bg-orange-500 selection:text-white">
      {children}
    </div>
  );
}

