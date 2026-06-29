import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './store/authStore';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const CustomerPortal = lazy(() => import('./pages/customer/CustomerPortal'));
const AgentPortal = lazy(() => import('./pages/agent/AgentPortal'));
const ManagerPortal = lazy(() => import('./pages/manager/ManagerPortal'));

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center bg-blue-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard/*" element={<CustomerPortal />} />
            <Route path="/agent" element={<AgentPortal />} />
            <Route path="/manager" element={<ManagerPortal />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
