import Link from 'next/link';

export default function PricingBetaPlaceholder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-xl mx-auto space-y-6 bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-2">CVScan Public Beta</h1>
        <p className="text-xl text-blue-300 font-semibold">
          Pricing plans are disabled.
        </p>
        <p className="text-gray-300">
          All premium features, job packs, and AI generators are currently 100% free and unlocked. We've removed our payment tiers during this beta phase to gather feedback!
        </p>
        <div className="pt-6">
          <Link 
            href="/dashboard" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Access Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
