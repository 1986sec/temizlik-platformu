import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ApprovalBanner from './components/common/ApprovalBanner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import JobSeekerPage from './pages/JobSeekerPage';
import EmployerPage from './pages/EmployerPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployerPaymentPage from './pages/EmployerPaymentPage';
import JobDetailPage from './pages/JobDetailPage';
import JobListPage from './pages/JobListPage';
import ProfilePage from './pages/ProfilePage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />
            <ApprovalBanner />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/is-arayan" element={<JobSeekerPage />} />
                <Route path="/isveren" element={<EmployerPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/giris" element={<LoginPage />} />
                <Route path="/kayit" element={<RegisterPage />} />
                <Route path="/employer-payment" element={<EmployerPaymentPage />} />
                <Route path="/is/:jobId" element={<JobDetailPage />} />
                <Route path="/isler" element={<JobListPage />} />
                <Route path="/profil" element={<ProfilePage />} />
                <Route path="/email-dogrula" element={<EmailVerificationPage />} />
                <Route path="/mesajlar" element={<MessagesPage />} />
                <Route path="/bildirimler" element={<NotificationsPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;