import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
      <div className="max-w-md w-full text-center bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20">
        <h1 className="text-3xl font-bold mb-4 text-white">Sign-in Disabled</h1>
        <p className="mb-8 text-blue-200">
          Authentication is completely disabled for the public beta. You have full access to all features immediately!
        </p>
        <div className="flex flex-col gap-4">
          <Link 
            href="/dashboard" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Access Platform
          </Link>
          <Link 
            href="/" 
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
