import './screens/HomePage.js';
import { API } from './services/API.js';
import { HomePage } from './screens/HomePage.js';
import { MovieDetails } from './screens/MovieDetails.js';
import './components/AnimatedLoading.js';

window.addEventListener('DOMContentLoaded', e => {
  document.querySelector('main').appendChild(new HomePage());
  document.querySelector('main').appendChild(new MovieDetails());
});

window.app = {
  API,
  search: e => {
    e.preventDefault();

    const q = document.querySelector('input[type=search]').value;
    console.log(`Query: ${q}`);
  },
};
