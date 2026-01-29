export async function getDramaHome(classify = 'terpopuler') {
  const res = await fetch(`https://api.sansekai.my.id/api/dramabox/dubindo?classify=${classify}`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error('Gagal mengambil data');
  return res.json();
}

export async function getDramaDetail(bookId: string) {
  const res = await fetch(`https://api.sansekai.my.id/api/dramabox/detail?bookId=${bookId}`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error('Gagal mengambil detail drama');
  return res.json();
}

const BASE_URL = 'https://api.sansekai.my.id/api/dramabox';

export async function getDramaData(endpoint: string, query: string = '') {
  const url = query ? `${BASE_URL}/${endpoint}?query=${query}` : `${BASE_URL}/${endpoint}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

export async function searchDramaBox(query: string) {
  const res = await fetch(`https://api.sansekai.my.id/api/dramabox/search?query=${encodeURIComponent(query)}`, {
    cache: 'no-store' // Hasil pencarian sebaiknya tidak dicache terlalu lama
  });

  if (!res.ok) throw new Error('Gagal melakukan pencarian');
  return res.json(); // Mengembalikan array objek drama
}

export async function getDramaDub(classify = 'terpopuler') {
  const res = await fetch(`${BASE_URL}/dubindo?classify=${classify}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getDramaEpisodes(bookId: string) {
  const res = await fetch(`https://api.sansekai.my.id/api/dramabox/allepisode?bookId=${bookId}`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error('Gagal mengambil daftar episode');
  return res.json();
}