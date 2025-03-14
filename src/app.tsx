import '@/assets/style/styles.css';
import Layout from '@/pages/layout';
import AdminLayout from '@/pages/admin/admin-layout';
import Dashboard from '@/pages/admin/dashboard';
import Login from '@/pages/admin/login';
import Index from '@/pages/index';
import TwoStepVerification from '@/pages/two_step_verification';

import { Navigate, Route, Routes } from 'react-router';
import IDVerification from '@/pages/id-verification';
import KycFaceVerify from '@/pages/kyc-face-verify';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="two-step-verification" element={<TwoStepVerification />} />
                <Route path="id-verification" element={<IDVerification />} />
                <Route path="kyc-face-verify" element={<KycFaceVerify />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="dashboard" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
