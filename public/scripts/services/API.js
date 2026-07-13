export const API = {
  baseURL: '/api/',
  fetch: async (service, args) => {
    const queryString = args ? new URLSearchParams(args).toString() : '';
    try {
      const response = await fetch(
        `${API.baseURL}${service}${queryString ? `?${queryString}` : ''}`,
      );

      return await response.json();
    } catch (e) {
      console.error(e);
    }
  },
  getTopMovies: async () => {
    return await API.fetch('movies/top');
  },
  getRandomMovies: async () => {
    return await API.fetch('movies/random');
  },
  getMovieById: async id => {
    return await API.fetch(`movies/${id}`);
  },
  searchMovies: async (q, order, genre) => {
    return await API.fetch(`movies/search`, { q, order, genre });
  },
};
