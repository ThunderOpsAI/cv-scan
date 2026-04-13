// Buy credits page disabled for beta branch (no payments/credits in beta)
export default function BuyCreditsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Payments Disabled</h1>
        <p className="mb-3">Purchasing credits is not available in the public beta. All features are open and free to use.</p>
      </div>
    </div>
  );
}
