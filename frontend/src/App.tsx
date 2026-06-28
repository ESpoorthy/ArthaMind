import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy-loaded page groups (code-split per portal)
const CustomerPortal = lazy(() => import('@/pages/customer/CustomerPortal'));
const AgentPortal = lazy(() => import('@/pages/agent/AgentPortal'));
const ManagerPortal = lazy(() => import('@/pages/manager/ManagerPortal'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Full-page loading fallback
function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading ArthaMind…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Customer portal */}
          <Route path="/dashboard/*" element={<CustomerPortal />} />

          {/* Human Agent portal */}
          <Route path="/agent/*" element={<AgentPortal />} />

          {/* Manager dashboard */}
          <Route path="/manager/*" element={<ManagerPortal />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
