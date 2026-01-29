'use client';

import { useState, useEffect, use } from 'react';
import { getDramaEpisodes, getDramaDetail } from '@/lib/api';

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle {
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  }

  interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemWritableFileStream {
    write(data: Blob): Promise<void>;
    close(): Promise<void>;
  }
}

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [episodes, setEpisodes] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [currentEpIndex, setCurrentEpIndex] = useState(0);
  const [currentQuality, setCurrentQuality] = useState(720);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isAutoNext, setIsAutoNext] = useState(true);

  const handleNextEpisode = () => {
    if (currentEpIndex < episodes.length - 1) {
      setCurrentEpIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert("Anda telah mencapai episode terakhir.");
    }
  };
  
  const onVideoEnded = () => {
    if (isAutoNext) {
      handleNextEpisode();
    }
  };
  
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const [detailData, episodesData] = await Promise.all([
          getDramaDetail(id),
          getDramaEpisodes(id)
        ]);
        
        setDetail(detailData);
        setEpisodes(episodesData);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white italic">Menyiapkan tontonan...</div>;
  if (!episodes.length || !detail) return <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white">Data tidak ditemukan.</div>;

  const currentEpisode = episodes[currentEpIndex];
  const videoSources = currentEpisode?.cdnList?.[0]?.videoPathList || [];
  const activeSource = videoSources.find((v: any) => v.quality === currentQuality) || videoSources[0];

  const downloadSingle = async (videoUrl: string, fileName: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Gagal mendownload video. Pastikan koneksi stabil.");
    } finally {
      setIsDownloading(false);
    }
  };

  const bulkDownload = async () => {
    if (!window.showDirectoryPicker) {
      alert("Browser Anda tidak mendukung fitur pilih folder (Gunakan Chrome/Edge terbaru).");
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker();
      setIsDownloading(true);
      
      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        const source = ep.cdnList[0]?.videoPathList.find((v: any) => v.quality === currentQuality) || ep.cdnList[0]?.videoPathList[0];
        
        setDownloadProgress(Math.round(((i + 1) / episodes.length) * 100));

        const proxyUrl = `/api/proxy?url=${encodeURIComponent(source.videoPath)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) throw new Error(`Gagal mengunduh Episode ${ep.chapterName}`);
        
        const blob = await response.blob();
        
        const fileHandle = await directoryHandle.getFileHandle(`${detail.bookName} - ${ep.chapterName}.mp4`, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      }
      
      alert("Download Selesai!");
    } catch (error) {
      console.error(error);
      alert("Download dibatalkan atau terjadi kesalahan.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1014] text-gray-200 pb-12">
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* PLAYER & INFO KIRI */}
          <div className="flex-1">
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/5 relative group/player">
    <video 
      key={`${currentEpIndex}-${currentQuality}`}
      controls 
      autoPlay
      onEnded={onVideoEnded} //
      className="w-full aspect-video"
      poster={detail.coverWap}
    >
      <source src={activeSource?.videoPath} type="video/mp4" />
      Browser Anda tidak mendukung player ini.
    </video>

    {/* Overlay Button Manual Next (Opsional - Muncul saat hover) */}
    <button 
      onClick={handleNextEpisode}
      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-pink-600 p-3 rounded-full opacity-0 group-hover/player:opacity-100 transition-opacity"
      title="Episode Selanjutnya"
    >
      <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
    </button>
  </div>

  {/* TOGGLE AUTO NEXT */}
  <div className="mt-4 flex items-center justify-end gap-3">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
      Auto Next Episode
    </span>
    <button 
      onClick={() => setIsAutoNext(!isAutoNext)}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isAutoNext ? 'bg-pink-600' : 'bg-gray-700'}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full transition-transform duration-300 ${isAutoNext ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>

                    {/* SECTION DOWNLOAD */}
        <div className="mt-8 bg-[#1a1c22] p-6 rounded-2xl border border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-white font-bold text-lg uppercase tracking-wider">Download Area</h3>
              <p className="text-gray-500 text-xs mt-1 italic">*Bulk download akan menyimpan semua episode dengan kualitas {currentQuality}p</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => downloadSingle(activeSource.videoPath, `${detail.bookName} - ${currentEpisode.chapterName}`)}
                disabled={isDownloading}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-gray-700"
              >
                {isDownloading ? 'Processing...' : '📥 DOWNLOAD'}
              </button>
              
              <button 
                onClick={bulkDownload}
                disabled={isDownloading}
                className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-pink-600/20"
              >
                {isDownloading ? `DOWNLOADING ${downloadProgress}%` : '🚀 BULK DOWNLOAD'}
              </button>
            </div>
          </div>
        </div>

            {/* DETAIL DRAMA */}
            <div className="mt-8 bg-[#1a1c22]/50 p-6 rounded-2xl border border-gray-800">
              <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-gray-800 pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    {detail.bookName}
                  </h1>
                  <p className="text-pink-500 font-bold mt-1 uppercase text-sm tracking-widest">
                    Episode {currentEpisode.chapterName} • {activeSource?.quality}P
                  </p>
                </div>
                
                {/* Selector Kualitas */}
                <div className="flex gap-2 items-center bg-black/40 p-1.5 rounded-xl border border-gray-700 h-fit">
                  {videoSources.map((v: any) => (
                    <button
                      key={v.quality}
                      onClick={() => setCurrentQuality(v.quality)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${currentQuality === v.quality ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                      {v.quality}P
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags & Sinopsis */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {detail.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-800 text-[10px] font-bold text-gray-300 rounded-full border border-gray-700">
                      # {tag}
                    </span>
                  ))}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">Sinopsis</h3>
                  <p className="text-gray-400 text-sm leading-relaxed text-justify">
                    {detail.introduction}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PLAYLIST EPISODE KANAN */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-[#1a1c22] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
              <div className="p-5 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-700">
                <h2 className="text-sm font-black text-white flex justify-between items-center tracking-widest">
                  DAFTAR EPISODE
                  <span className="bg-pink-600 text-[10px] px-2 py-1 rounded-md text-white">{episodes.length} TOTAL</span>
                </h2>
              </div>
              
              <div className="max-h-[700px] overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#0f1014]/30">
                {episodes.map((ep: any, index: number) => (
                  <button
                    key={ep.chapterId}
                    onClick={() => {
                      setCurrentEpIndex(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full p-4 text-left border-b border-gray-800/30 flex items-center gap-4 transition-all group ${currentEpIndex === index ? 'bg-pink-600/10 border-l-4 border-l-pink-600' : 'hover:bg-white/5'}`}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${currentEpIndex === index ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-white'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${currentEpIndex === index ? 'text-pink-500' : 'text-gray-300'}`}>
                        {ep.chapterName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}