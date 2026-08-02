import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-6xl mb-4" aria-hidden="true">🔍</p>
      <h1 className="text-3xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-gray-400 mb-8">That page doesn't exist or has been moved.</p>
      <Link
        href="/"
        className="text-accent hover:underline font-medium"
      >
        Back to Markets →
      </Link>
    </div>
  );
}
