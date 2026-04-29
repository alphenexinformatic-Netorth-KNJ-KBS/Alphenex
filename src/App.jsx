import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import MainLayout from './layouts/MainLayout';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import BrandLoader from './components/BrandLoader';
import ErrorPage from './pages/ErrorPage';

import { LoadingProvider, useLoading } from './context/LoadingContext';
import { SessionProvider } from './context/SessionContext';

// Eagerly loaded: HomePage is the landing page, must be fast
import HomePage from './pages/HomePage';

// Lazy-load all non-homepage routes.

const ServicesPage = lazy(() => import('./pages/Services'));
const AboutPage = lazy(() => import('./pages/About'));
const PortfolioPage = lazy(() => import('./pages/Portfolio'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const Contact = lazy(() => import('./pages/Contact'));
const ThankYou = lazy(() => import('./pages/ThankYou'));

function GlobalLoader() {
  const { isLoading } = useLoading();
  return <BrandLoader isVisible={isLoading} />;
}

// Optimized loading fallback — matches the site's dark theme
// Only shows the loader if the wait is longer than 400ms to avoid flicker
function PageLoader() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(timer);
  }, []);
  return show ? <BrandLoader isVisible={true} /> : null;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LoadingProvider>
          <SessionProvider>
            <GlobalLoader />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="services" element={
                  <Suspense fallback={<PageLoader />}>
                    <ServicesPage />
                  </Suspense>
                } />
                <Route path="about" element={
                  <Suspense fallback={<PageLoader />}>
                    <AboutPage />
                  </Suspense>
                } />
                <Route path="portfolio" element={
                  <Suspense fallback={<PageLoader />}>
                    <PortfolioPage />
                  </Suspense>
                } />
                <Route path="blog" element={
                  <Suspense fallback={<PageLoader />}>
                    <BlogPage />
                  </Suspense>
                } />
                <Route path="blog/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <BlogDetailPage />
                  </Suspense>
                } />
                <Route path="contact" element={
                  <Suspense fallback={<PageLoader />}>
                    <Contact />
                  </Suspense>
                } />
                <Route path="thank-you" element={
                  <Suspense fallback={<PageLoader />}>
                    <ThankYou />
                  </Suspense>
                } />

                {/* Catch-all: redirect unknown URLs to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
            <Toaster />
          </SessionProvider>
        </LoadingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;