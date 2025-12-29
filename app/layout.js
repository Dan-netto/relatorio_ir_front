"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  // Criar uma instância do QueryClient apenas uma vez
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Provider global do React Query */}
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen flex flex-col items-center p-4">
            <header className="w-full max-w-5xl mb-8">
              <h1 className="text-2xl font-bold text-center text-indigo-600">
                📊 Consolidador de Investimentos
              </h1>
            </header>

            <main className="w-full max-w-5xl">{children}</main>

            <footer className="w-full max-w-5xl mt-12 text-center text-sm text-gray-500">
              <p>Desenvolvido por Daniel • {new Date().getFullYear()}</p>
            </footer>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
