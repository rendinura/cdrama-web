'use client';

import { useState, useEffect, use } from 'react';
import { searchDramaBox } from '@/lib/api';
import Link from 'next/link';

export default function SearchPage({ searchParams }: { searchParams: Promise<{ query: string }> }) {
  const resolvedParams = use(searchParams);
  const query = resolvedParams.query;

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchDramaBox(query);
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query]);

  return (
    <main className="min-h-screen bg-[#0f1014] text-gray-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Header Hasil Pencarian */}
        <div className="mb-10 border-b border-gray-800 pb-6">
          <h1 className="text-xl font-medium text-gray-400">
            Hasil pencarian untuk: <span className="text-pink-600 font-bold italic text-2xl ml-2">"{query}"</span>
          </h1>
          <p className="text-xs text-gray-600 mt-2 uppercase tracking-widest">
            Ditemukan {results.length} drama yang relevan
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse font-bold italic uppercase text-xs">Mencari di database...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((drama: any) => (
              <Link 
              href={`/watch/${drama.bookId}`} 
              key={drama.bookId}
                className="group relative bg-[#1a1c22] rounded-xl overflow-hidden shadow-lg border border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:border-pink-500/50"
              >
                {/* Thumbnail dengan Aspect Ratio 3:4 */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={drama.cover} 
                    alt={drama.bookName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay Tag Pertama */}
                  {drama.tagNames && drama.tagNames.length > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-pink-600/90 backdrop-blur-md rounded text-[9px] font-black text-white uppercase shadow-lg">
                      {drama.tagNames[0]}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                      <span className="text-2xl">▶</span>
                    </div>
                  </div>
                </div>

                {/* Info Detail */}
                <div className="p-3 bg-gradient-to-b from-[#1a1c22] to-[#121418]">
                  <h3 className="text-xs font-bold text-gray-100 line-clamp-2 leading-tight group-hover:text-pink-500 transition-colors uppercase italic">
                    {drama.bookName}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {drama.tagNames?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-[8px] text-gray-500 border border-gray-800 px-1.5 py-0.5 rounded italic">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#1a1c22]/30 rounded-3xl border border-dashed border-gray-800">
            <span className="text-6xl mb-4 block">🚫</span>
            <h2 className="text-xl font-bold text-gray-400">Maaf, drama tidak ditemukan</h2>
            <p className="text-gray-600 text-sm mt-2">Coba gunakan kata kunci lain atau periksa ejaan Anda.</p>
            <Link href="/" className="inline-block mt-6 px-6 py-2 bg-pink-600 text-white rounded-full font-bold text-xs uppercase hover:bg-pink-700 transition">
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}