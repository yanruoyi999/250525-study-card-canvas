
import React from "react";
import SmartForm from "../components/SmartForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-blue-50 to-white flex flex-col items-center">
      <header className="w-full bg-white/80 shadow-sm py-3 px-0 mb-2 flex justify-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{letterSpacing:"-.02em"}}>
          生成学习卡片
        </h1>
      </header>
      <main className="flex-1 w-full flex justify-center">
        <div className="w-full">
          <SmartForm />
        </div>
      </main>
      <footer className="py-4 text-xs text-gray-400">
        <span>© {new Date().getFullYear()} 由 Lovable ✦ 生成</span>
      </footer>
    </div>
  );
};

export default Index;
