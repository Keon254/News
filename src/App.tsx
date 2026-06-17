import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ArticlePage } from '@/pages/ArticlePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { TagPage } from '@/pages/TagPage';
import { SearchPage } from '@/pages/SearchPage';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { ArticleList } from '@/pages/admin/ArticleList';
import { ArticleEditor } from '@/pages/admin/ArticleEditor';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/article/:slug"
              element={
                <PublicLayout>
                  <ArticlePage />
                </PublicLayout>
              }
            />
            <Route
              path="/category/:slug"
              element={
                <PublicLayout>
                  <CategoryPage />
                </PublicLayout>
              }
            />
            <Route
              path="/tag/:slug"
              element={
                <PublicLayout>
                  <TagPage />
                </PublicLayout>
              }
            />
            <Route
              path="/search"
              element={
                <PublicLayout>
                  <SearchPage />
                </PublicLayout>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/new" element={<ArticleEditor />} />
              <Route path="articles/:id" element={<ArticleEditor />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
