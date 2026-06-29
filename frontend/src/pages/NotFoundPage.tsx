import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Go home
        </Link>
      </div>
    </div>
  );
}
