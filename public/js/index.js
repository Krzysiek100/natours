import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
// import { bookTour } from './stripe';

const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const bookBtn = document.getElementById('book-tour');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('adadad');
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('photo', document.getElementById('photo').files[0]);
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    updateSettings(form);
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    console.log('sas');
    const { tourId } = e.target.dataset;

    bookTour(tourId);
  });
}
