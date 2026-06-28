/**
 * LoginPage — entry point for all three user roles.
 * Full implementation in Phase 8.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-950 to-brand-700 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ArthaMind</h1>
          <p className="mt-1 text-sm text-gray-500">AI Banking Simulator</p>
        </div>

        {/* Placeholder — wired up in Phase 8 */}
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-center text-sm text-brand-700">
          Authentication UI — Phase 8
        </div>
      </div>
    </div>
  );
}
