import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import MainLayout from './layouts/MainLayout';
import { Toaster } from '@/components/ui/toaster';

// Eagerly loaded: HomePage is the landing page, must be fast
import HomePage from './pages/HomePage';

// Lazy-load all non-homepage routes.
// This means the JS for Services, About, Portfolio, Blog, Contact pages
// is NOT downloaded until the user navigates to those routes.
// Reduces initial bundle from ~600KB to ~250KB.
const ServicesPage = lazy(() => import('./pages/Services'));
const AboutPage = lazy(() => import('./pages/About'));
const PortfolioPage = lazy(() => import('./pages/Portfolio'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const Contact = lazy(() => import('./pages/Contact'));

// Page loading fallback — matches the site's dark theme
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#020c1b' }}>
      <div className="w-12 h-12 border-4 border-[#0992C2] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
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
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;