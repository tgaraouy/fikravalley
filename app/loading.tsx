export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center">
        {/* Simple spinner */}
        <div
          className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"
          aria-label="Chargement en cours"
        />
        <p className="text-sm font-medium text-slate-600">Chargement...</p>
      </div>
    </div>
  );
}
