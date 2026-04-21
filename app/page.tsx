'use client';

import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-[#050814] text-white">
      <div className="text-center">
        <div className="text-4xl mb-4">⚡</div>
        <div className="text-xl font-bold">LojistikAI yükleniyor...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <Dashboard />;
}