import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import RagaChatbot from '@/components/RagaChatbot';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020c1b]">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <RagaChatbot />
    </div>
  );
}

export default MainLayout;