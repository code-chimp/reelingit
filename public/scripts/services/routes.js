import { HomePage } from '../screens/HomePage.js';
import { MovieDetails } from '../screens/MovieDetails.js';
import { MoviePage } from '../screens/MoviePage.js';

export const routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: /\/movies\/(d+)/,
    component: MovieDetails,
  },
  {
    path: '/movies', // search
    component: MoviePage,
  },
];
