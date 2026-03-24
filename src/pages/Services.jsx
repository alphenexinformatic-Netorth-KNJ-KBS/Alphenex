import React, { useState, Suspense, Component, lazy } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Services, { servicesData } from '../components/Services';
import ServiceDetails from '../components/ServiceDetails';

// Lazy-load Three.js 3D background — only fetches when Services page is visited
const Services3DBackground = lazy(() => import('../components/Services3DBackground'));

class ServicesErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Services 3D Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />
      );
    }
    return this.props.children;
  }
}

function ServicesPage() {
  const [activeServiceId, setActiveServiceId] = useState(servicesData[0].id);

  const handleServiceSelect = (serviceId) => {
    setActiveServiceId(serviceId);
    
    // Smooth scroll to details section
    setTimeout(() => {
      const detailsSection = document.getElementById('service-details');
      if (detailsSection) {
        window.scrollTo({
          top: detailsSection.offsetTop - 100, // Offset for header
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Social Media Marketing Services",
    "provider": {
      "@type": "Organization",
      "name": "Alphenex Informatic"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Social Media Services",
      "itemListElement": servicesData.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.title,
          "description": service.description
        }
      }))
    }
  };

  return (
    <>
      <Helmet>
        <title>Our Services - Social Media Strategy & Management | Alphenex Informatic</title>
        <meta
          name="description"
          content="Comprehensive social media marketing services: Strategy, Content Creation, Community Management, Analytics, Paid Ads, and Influencer Partnerships."
        />
        <meta name="keywords" content="social media services, content creation, community management, paid advertising, influencer marketing" />
        <link rel="canonical" href="https://alphenex.com/services" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div>
        {/* Page Header with 3D Background */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <ServicesErrorBoundary>
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />}>
              <Services3DBackground />
            </Suspense>
          </ServicesErrorBoundary>

          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#020c1b] via-[#020c1b]/50 to-transparent pointer-events-none" />

          <div className="container relative z-10 px-4 text-center mt-20">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight"
            >
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] to-[#0992C2]">Expertise</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light"
            >
              Data-driven social media growth solutions tailored for ambitious brands.
            </motion.p>
          </div>
        </section>

        <Services onServiceSelect={handleServiceSelect} />
        
        <ServiceDetails 
          services={servicesData} 
          activeServiceId={activeServiceId} 
          onServiceChange={setActiveServiceId}
        />
      </div>
    </>
  );
}

export default ServicesPage;