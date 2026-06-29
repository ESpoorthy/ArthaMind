import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Dashboard from './Dashboard';
import Accounts from './Accounts';
import Cards from './Cards';
import Loans from './Loans';
import FixedDeposits from './FixedDeposits';
import AIChat from './AIChat';
import Notifications from './Notifications';
import Rewards from './Rewards';
import LifeEvents from './LifeEvents';
import Insights from './Insights';
import FraudAwareness from './FraudAwareness';
import BillAutopay from './BillAutopay';
import PrivacyControls from './PrivacyControls';

export default function CustomerPortal() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="cards" element={<Cards />} />
        <Route path="loans" element={<Loans />} />
        <Route path="fd" element={<FixedDeposits />} />
        <Route path="chat" element={<AIChat />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="life-events" element={<LifeEvents />} />
        <Route path="insights" element={<Insights />} />
        <Route path="fraud-awareness" element={<FraudAwareness />} />
        <Route path="bill-autopay" element={<BillAutopay />} />
        <Route path="privacy" element={<PrivacyControls />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
