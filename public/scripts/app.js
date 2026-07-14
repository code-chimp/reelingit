import './screens/HomePage.js';
import { API } from './services/API.js';
import { Router } from './services/Router.js';
import { HomePage } from './screens/HomePage.js';
import './components/AnimatedLoading.js';

window.addEventListener('DOMContentLoaded', e => {
  document.querySelector('main').appendChild(new HomePage());
});

window.app = {
  API,
  Router,
  search: e => {
    e.preventDefault();

    const q = document.querySelector('input[type=search]').value;
    console.log(`Query: ${q}`);
  },
};
