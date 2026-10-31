export default async function handler(req, res) {
  const API_KEY = process.env.TMDB_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: "TMDB API Key belum dipasang di server.",
    });
  }

  try {
    const {
      genre = "",
      runtimeMin = "0",
      runtimeMax = "300",
      page = "1",
    } = req.query;

    const params = new URLSearchParams({
      api_key: API_KEY,
      language: "id-ID",
      watch_region: "ID",
      with_watch_providers: "8",
      with_watch_monetization_types: "flatrate",
      include_adult: "false",
      sort_by: "popularity.desc",
      page: page,
    });

    if (genre) {
      params.set("with_genres", genre);
    }

    if (runtimeMin) {
      params.set("with_runtime.gte", runtimeMin);
    }

    if (runtimeMax) {
      params.set("with_runtime.lte", runtimeMax);
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${params}`,
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gagal mengambil data dari TMDB.",
      });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server.",
    });
  }
}
