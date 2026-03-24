import React, { useState, useEffect, Suspense, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Contact3DBackground from './Contact3DBackground';

class TestimonialsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Testimonials 3D Error:", error, errorInfo);
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

const testimonials = [
  {
    id: 1,
    name: "Emily Watson",
    role: "Marketing Director, TechFlow",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    rating: 5,
    quote: "Alphenex completely transformed our social media presence. Their data-driven approach helped us increase engagement by 200% in just three months. Highly recommended!"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "CEO, StartUp Inc.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    rating: 5,
    quote: "The team's creativity and attention to detail are unmatched. They truly understand our brand voice and consistently deliver content that resonates with our audience."
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    role: "Founder, Glow Beauty",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    rating: 5,
    quote: "Working with Alphenex felt like having an in-house team. They are responsive, proactive, and genuinely care about our business growth. The ROI has been incredible."
  },
  {
    id: 4,
    name: "James Wilson",
    role: "VP of Sales, GrowthCo",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    rating: 5,
    quote: "We've worked with several agencies before, but none compare to Alphenex. Their strategic insights into paid advertising lowered our CAC significantly."
  },
  {
    id: 5,
    name: "Jessica Lee",
    role: "Owner, Urban Cafe",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    rating: 4,
    quote: "Fantastic community management services. They handled our customer inquiries professionally and helped build a loyal community around our brand."
  }
];

function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <section className="py-32 relative overflow-hidden bg-[#020c1b]">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
        <TestimonialsErrorBoundary>
           <Suspense fallback={<div className="absolute inset-0 bg-transparent" />}>
              <Contact3DBackground />
           </Suspense>
        </TestimonialsErrorBoundary>
      </div>
      
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#020c1b] via-[#020c1b]/80 to-[#020c1b]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-[#0992C2]/10 border border-[#0992C2]/20 text-[#4dc8f0] text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#09c4f0] rounded-full animate-pulse" />
            Testimonials
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] via-[#0992C2] to-[#09c4f0]">Clients Say</span>
          </h2>
          <p className="font-sans text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            Don't just take our word for it. Here is what industry leaders have to say about working with us.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto h-[450px] md:h-[400px]">
          {/* Controls */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 w-full"
            >
              <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-14 h-full flex flex-col justify-center relative shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0992C2]/5 to-transparent pointer-events-none" />
                <Quote className="absolute top-10 left-10 text-[#0992C2]/20 w-24 h-24 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-[#09c4f0] rounded-full blur-[20px] opacity-20" />
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/10 relative z-10 shadow-2xl">
                      <img 
                        src={testimonials[currentIndex].image} 
                        alt={testimonials[currentIndex].name} 
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start gap-1.5 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          className={i < testimonials[currentIndex].rating ? "fill-[#09c4f0] text-[#09c4f0] drop-shadow-[0_0_8px_rgba(9,196,240,0.5)]" : "text-gray-600"} 
                        />
                      ))}
                    </div>
                    
                    <p className="font-sans text-xl md:text-2xl text-gray-200 italic mb-8 leading-relaxed font-light">
                      "{testimonials[currentIndex].quote}"
                    </p>
                    
                    <div>
                      <h4 className="font-heading text-xl font-bold text-white mb-1">{testimonials[currentIndex].name}</h4>
                      <p className="font-sans text-sm text-[#09c4f0] tracking-wide font-medium uppercase">{testimonials[currentIndex].role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-3 mt-12 relative z-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-[#09c4f0] w-8 shadow-[0_0_10px_rgba(9,196,240,0.5)]" : "bg-white/20 w-2.5 hover:bg-white/40"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;