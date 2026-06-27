import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { AccountPage } from '@/pages/AccountPage';
import { LessonPage } from '@/pages/LessonPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { MasteryQuizPage } from '@/pages/MasteryQuizPage';
import { MasteryTestPage } from '@/pages/MasteryTestPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <ErrorBoundary>
            <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>

            <Route
              path="/lesson/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <ReviewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quiz/:lessonId"
              element={
                <ProtectedRoute>
                  <MasteryQuizPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mastery-test"
              element={
                <ProtectedRoute>
                  <MasteryTestPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
