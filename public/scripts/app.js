import './screens/HomePage.js';
import { API } from './services/API.js';
import { HomePage } from './screens/HomePage.js';

window.addEventListener('DOMContentLoaded', e => {
  document.querySelector('main').appendChild(new HomePage());
});

window.app = {
  API,
  search: e => {
    e.preventDefault();

    const q = document.querySelector('input[type=search]').value;
    console.log(`Query: ${q}`);
  },
};
