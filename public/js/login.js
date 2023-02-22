/* eslint-disable  */
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    console.log('dad');
    const res = await fetch('http://127.0.0.1:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(
          'Invalid email or password. probably error from server'
        );
      }
      return res.json();
    });
    console.log(res);
    console.log(res.status);

    if (res.status === 'succes') {
      showAlert('succes', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const logout = async () => {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/v1/users/logout', {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
    });

    console.log(res);
    if (res.ok) {
      location.assign('/'); //reload from the server not from browser cache
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Try agains');
  }
};
