// Sign-in page disabled for beta branch (no authentication)
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Sign-in Disabled</h1>
        <p className="mb-3">Authentication is not required in the public beta. All features are open.</p>
      </div>
    </div>
  );
}
