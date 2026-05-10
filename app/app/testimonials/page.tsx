import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";

export const metadata = {
  title: "Testimonials | AICVScan",
  description: "See what our users are saying about AICVScan.",
};

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Senior Product Manager",
    content: "AICVScan completely transformed my job hunt. The ATS scanner highlighted exactly what I was missing, and the generated cover letter was indistinguishable from my own writing style. Landed my dream role in 3 weeks!",
    accent: "cyan" as const,
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    content: "As an engineer, I struggled to translate my technical skills into business impact on my resume. The Career Copilot helped me structure my STAR stories, and the bullet point generator made my experience shine.",
    accent: "blue" as const,
  },
  {
    name: "Elena Rodriguez",
    role: "Marketing Director",
    content: "The Job Fit tool saved me so much time. Instead of applying to 100 jobs, I focused on the 10 where I had a 90%+ match. The tailored job packs gave me the confidence I needed for my interviews.",
    accent: "violet" as const,
  },
  {
    name: "David Smith",
    role: "Recent Graduate",
    content: "I had no idea how to write a professional resume. AICVScan guided me through building my profile from scratch and generated a polished, professional ATS-friendly resume that actually got me callbacks.",
    accent: "emerald" as const,
  },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-16 w-56 transition-transform duration-300 group-hover:scale-105">
            <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <Link href="/auth/signin" className="text-[#757575] hover:text-[#1A237E] transition-colors font-medium">
          Sign in
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] text-[#1A237E] mb-4">
            Loved by job seekers everywhere
          </h1>
          <p className="text-lg text-[#757575] max-w-2xl mx-auto">
            Join thousands of professionals who have accelerated their career with AI-powered resume tailoring and interview prep.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, i) => (
            <GlassCard key={i} accent={testimonial.accent} className="p-8">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-white/60 border border-black/[0.06] flex items-center justify-center text-[#1A237E] font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A237E]">{testimonial.name}</h3>
                    <p className="text-sm text-[#757575]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-[#1A237E] leading-relaxed flex-grow italic">
                  "{testimonial.content}"
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
}
