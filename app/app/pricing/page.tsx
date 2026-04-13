// Pricing page disabled for beta branch (no payments/credits in beta)
export default function PricingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Pricing Disabled</h1>
        <p className="mb-3">All features are free and open in the public beta. No payments or credits required.</p>
      </div>
    </div>
  );
}
