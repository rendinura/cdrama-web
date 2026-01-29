import { getDramaData, getDramaDub } from '@/lib/api';
import Link from 'next/link';

export default async function HomePage() {
  // Fetch data secara paralel untuk performa maksimal
  const [trending, latest, forYou, dubIndo, popularSearch] = await Promise.all([
    getDramaData('trending'),
    getDramaData('latest'),
    getDramaData('foryou'),
    getDramaDub('terpopuler'),
    getDramaData('populersearch'),
  ]);

  return (
    <main className="min-h-screen bg-[#0f1014] text-gray-200 font-sans pb-20">
      
      {/* 1. NAVBAR & SEARCH SECTION */}
      <header className="sticky top-0 z-50 bg-[#0f1014]/90 backdrop-blur-md border-b border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-2xl font-black italic tracking-tighter text-white">
            DRAMA<span className="text-pink-600">CHINA.</span>
          </div>
          
          <form action="/search" className="relative w-full md:w-96">
            <input 
              name="query"
              type="text" 
              placeholder="Cari drama, judul, atau genre..." 
              className="w-full bg-[#1a1c22] border border-gray-700 rounded-full py-2 px-5 text-sm focus:outline-none focus:border-pink-600 transition"
            />
            <button type="submit" className="absolute right-3 top-2 text-gray-400">🔍</button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
        
        {/* 2. TRENDING MARQUEE (Infinite Scroll) */}
        <section className="overflow-hidden py-10">
          <div className="flex items-center gap-2 mb-8 px-4 max-w-7xl mx-auto">
            <div className="w-2 h-8 bg-pink-600 rounded-full"></div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white italic">
              Trending
            </h2>
          </div>

          {/* Container Marquee */}
          <div className="relative flex overflow-hidden">
            {/* Track Animasi */}
            <div className="flex animate-marquee gap-6 whitespace-nowrap py-4" style={{ animationDuration: '500s' }}>
              {/* Kita render 2 kali agar loop tidak terputus */}
              {[...trending, ...trending].map((drama: any, index: number) => (
                <Link 
                  href={`/watch/${drama.bookId}`} 
                  key={`${drama.bookId}-${index}`}
                  className="min-w-[300px] md:min-w-[400px] aspect-video relative rounded-2xl overflow-hidden group border border-white/5 shadow-2xl transition-all duration-300 hover:border-pink-500/50"
                >
                  <img 
                    src={drama.coverWap} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={drama.bookName} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-transparent flex flex-col justify-end p-5">
                    <h3 className="text-sm md:text-sm font-black text-white italic uppercase line-clamp-1 drop-shadow-md">
                      {drama.bookName}
                    </h3>
                    <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mt-1">
                      {drama.playCount} Views
                    </p>
                  </div>
                </Link>
              ))}
              {[...trending, ...trending].map((drama: any, index: number) => (
                <Link 
                  href={`/watch/${drama.bookId}`} 
                  key={`${drama.bookId}-${index}`}
                  className="min-w-[300px] md:min-w-[400px] aspect-video relative rounded-2xl overflow-hidden group border border-white/5 shadow-2xl transition-all duration-300 hover:border-pink-500/50"
                >
                  <img 
                    src={drama.coverWap} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={drama.bookName} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-transparent flex flex-col justify-end p-5">
                    <h3 className="text-sm md:text-sm font-black text-white italic uppercase line-clamp-1 drop-shadow-md">
                      {drama.bookName}
                    </h3>
                    <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mt-1">
                      {drama.playCount} Views
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Overlay Fade Kiri & Kanan agar halus */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0f1014] to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0f1014] to-transparent"></div>
          </div>
        </section>

        {/* 3. POPULAR SEARCH (Tag Style) */}
        <section className="bg-[#1a1c22] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">Pencarian Populer</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearch.map((drama: any) => (
              <Link key={drama.bookId} href={`/watch/${drama.bookId}`} className="px-4 py-2 bg-[#0f1014] hover:bg-pink-600 text-[11px] font-bold rounded-full border border-gray-700 transition">
                # {drama.bookName}
              </Link>
            ))}
          </div>
        </section>

        {/* 4. DUB INDO (Grid ala platform premium) */}
        <DramaSection title="Dubbing Indonesia" data={dubIndo} badge="Hot" />

        {/* 5. FOR YOU (Personalized) */}
        <DramaSection title="Rekomendasi Untukmu" data={forYou} badge="For You" />

        {/* 6. LATEST DRAMA */}
        <DramaSection title="Drama Terbaru" data={latest} badge="New" />

      </div>
    </main>
  );
}

// KOMPONEN REUSABLE UNTUK GRID DRAMA
function DramaSection({ title, data, badge }: { title: string, data: any[], badge: string }) {
  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold text-white border-l-4 border-pink-600 pl-4 uppercase tracking-tighter italic">{title}</h2>
        <button className="text-[10px] font-black uppercase text-pink-500 hover:underline">Lihat Semua</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.map((drama: any) => (
          <Link 
            href={`/watch/${drama.bookId}`} 
            key={drama.bookId}
            className="group relative bg-[#1a1c22] rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-gray-800"
          >
              {/* Thumbnail Container */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src={drama.coverWap} 
                  alt={drama.bookName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay Kualitas/Badge (Corner Data) */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-bold text-pink-400 border border-pink-500/30">
                  {drama.corner?.name || 'HD'}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                    <svg fill="white" viewBox="0 0 24 24" className="w-6 h-6"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>

                {/* Play Count di pojok bawah */}
                <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1">
                  <span className="text-gray-300">👁 {drama.playCount}</span>
                </div>
              </div>

              {/* Info Drama */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 leading-tight group-hover:text-pink-500 transition-colors">
                  {drama.bookName}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">{drama.chapterCount} Episode</span>
                  <span className="text-[10px] text-gray-500 italic">Sub Indo</span>
                </div>
              </div>
          </Link>
        ))}
      </div>
    </section>
  );
}