// ==========================================
// NONTONAPA - FRONTEND
// ==========================================

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/original";

const answers = {
  mood: null,
  watch: null,
  level: null,
};

// ==========================================
// MOOD -> GENRE
// ==========================================

const moodGenre = {
  happy: "35",
  sad: "18",
  romantic: "10749",
  scared: "27",
  thinking: "9648|53",
  action: "28",
  chill: "35|10751",
  adventure: "12",
};

// ==========================================
// PILIH JAWABAN
// ==========================================

const options = document.querySelectorAll(".option");

options.forEach((option) => {
  option.addEventListener("click", function () {
    const group = this.dataset.group;
    const value = this.dataset.value;

    document.querySelectorAll(`[data-group="${group}"]`).forEach((button) => {
      button.classList.remove("selected");
    });

    this.classList.add("selected");

    answers[group] = value;

    document.getElementById("message").textContent = "";
  });
});

// ==========================================
// TOMBOL CARI
// ==========================================

document.getElementById("searchBtn").addEventListener("click", searchMovies);

// ==========================================
// CARI FILM
// ==========================================

async function searchMovies() {
  const message = document.getElementById("message");

  if (!answers.mood || !answers.watch || !answers.level) {
    message.textContent = "Pilih semua jawaban dulu 👀";
    return;
  }

  message.textContent = "";

  showLoading();

  try {
    const genre = moodGenre[answers.mood];

    let runtimeMin = 0;
    let runtimeMax = 300;

    // Ringan
    if (answers.level === "light") {
      runtimeMax = 110;
    }

    // Sedang
    if (answers.level === "medium") {
      runtimeMin = 90;
      runtimeMax = 150;
    }

    // Berat
    if (answers.level === "heavy") {
      runtimeMin = 110;
      runtimeMax = 300;
    }

    const params = new URLSearchParams({
      genre: genre,
      runtimeMin: runtimeMin,
      runtimeMax: runtimeMax,
      page: 1,
    });

    // API milik website kita sendiri
    const response = await fetch(`/api/movies?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil film");
    }

    const data = await response.json();

    hideLoading();

    displayMovies((data.results || []).slice(0, 12));
  } catch (error) {
    console.error(error);

    hideLoading();

    message.textContent = "Film gagal dimuat. Coba lagi sebentar.";
  }
}

// ==========================================
// TAMPILKAN FILM
// ==========================================

function displayMovies(movies) {
  const container = document.getElementById("movieContainer");

  container.innerHTML = "";

  const moviesWithPoster = movies.filter((movie) => movie.poster_path);

  if (moviesWithPoster.length === 0) {
    container.innerHTML = `
            <div class="no-result">
                <h3>😭 Film belum ketemu</h3>
                <p>
                    Coba pilih mood atau tingkat film
                    yang berbeda.
                </p>
            </div>
        `;

    showResult();

    return;
  }

  moviesWithPoster.forEach((movie, index) => {
    const match = calculateMatch(movie, index);

    const year = movie.release_date ? movie.release_date.substring(0, 4) : "-";

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "-";

    const overview =
      movie.overview || "Sinopsis Bahasa Indonesia belum tersedia.";

    const card = document.createElement("div");

    card.className = "movie-card";

    card.innerHTML = `
            <div class="poster-container">

                <img
                    src="${IMAGE_URL}${movie.poster_path}"
                    alt="${escapeHTML(movie.title)}"
                    loading="lazy"
                >

                <div class="match">
                    ${match}% Match
                </div>

                <div
                    class="netflix"
                    title="Netflix">
                    N
                </div>

            </div>


            <div class="movie-info">

                <h3>
                    ${escapeHTML(movie.title)}
                </h3>

                <div class="meta">
                    ${year} • ⭐ ${rating}
                </div>

                <p class="overview">
                    ${escapeHTML(overview)}
                </p>

            </div>
        `;

    card.addEventListener("click", () => {
      openMovieDetail(movie, match);
    });

    container.appendChild(card);
  });

  showResult();
}

// ==========================================
// HASIL
// ==========================================

function showResult() {
  const result = document.getElementById("result");

  result.style.display = "block";

  result.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ==========================================
// MATCH SCORE
// ==========================================

function calculateMatch(movie, index) {
  let score = 96 - index * 2;

  if (movie.vote_average >= 8) {
    score += 3;
  } else if (movie.vote_average >= 7) {
    score += 1;
  }

  if (score > 99) {
    score = 99;
  }

  if (score < 72) {
    score = 72;
  }

  return score;
}

// ==========================================
// DETAIL FILM
// ==========================================

function openMovieDetail(movie, match) {
  const modal = document.getElementById("movieModal");

  const body = document.getElementById("modalBody");

  modal.style.display = "block";

  document.body.style.overflow = "hidden";

  const backdrop = movie.backdrop_path
    ? `${BACKDROP_URL}${movie.backdrop_path}`
    : movie.poster_path
      ? `${IMAGE_URL}${movie.poster_path}`
      : "";

  const year = movie.release_date ? movie.release_date.substring(0, 4) : "-";

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "-";

  const overview =
    movie.overview || "Sinopsis Bahasa Indonesia belum tersedia.";

  body.innerHTML = `

        ${
          backdrop
            ? `
                    <img
                        class="modal-backdrop"
                        src="${backdrop}"
                        alt="${escapeHTML(movie.title)}"
                    >
                `
            : ""
        }


        <div class="modal-info">

            <div class="match">
                ${match}% cocok buat lu
            </div>

            <h2>
                ${escapeHTML(movie.title)}
            </h2>

            <div class="meta">
                ${year} • ⭐ ${rating}
            </div>

            <p>
                ${escapeHTML(overview)}
            </p>

            <p>
                🔴 Film dicari berdasarkan provider
                Netflix untuk wilayah Indonesia.
            </p>

        </div>
    `;
}

// ==========================================
// TUTUP MODAL
// ==========================================

document.getElementById("closeModal").addEventListener("click", closeModal);

function closeModal() {
  document.getElementById("movieModal").style.display = "none";

  document.body.style.overflow = "auto";
}

document
  .getElementById("movieModal")
  .addEventListener("click", function (event) {
    if (event.target === this) {
      closeModal();
    }
  });

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// ==========================================
// LOADING
// ==========================================

function showLoading() {
  document.getElementById("loading").style.display = "block";

  document.getElementById("result").style.display = "none";

  document.getElementById("loading").scrollIntoView({
    behavior: "smooth",
  });
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

// ==========================================
// FILM LAIN
// ==========================================

document
  .getElementById("loadMoreBtn")
  .addEventListener("click", loadMoreMovies);

async function loadMoreMovies() {
  if (!answers.mood) {
    return;
  }

  const button = document.getElementById("loadMoreBtn");

  const oldText = button.textContent;

  button.textContent = "Nyari film lain...";
  button.disabled = true;

  try {
    const genre = moodGenre[answers.mood];

    const page = Math.floor(Math.random() * 4) + 2;

    const params = new URLSearchParams({
      genre: genre,
      runtimeMin: 0,
      runtimeMax: 300,
      page: page,
    });

    const response = await fetch(`/api/movies?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil film");
    }

    const data = await response.json();

    displayMovies((data.results || []).slice(0, 12));
  } catch (error) {
    console.error(error);

    alert("Gagal mengambil film lain.");
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

// ==========================================
// KEAMANAN TEXT
// ==========================================

function escapeHTML(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");
}
