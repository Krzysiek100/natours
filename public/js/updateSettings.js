import { showAlert } from './alerts';

export const updateSettings = async (form) => {
  try {
    console.log(form);
    const res = await fetch('http://127.0.0.1:3000/api/v1/users/updateMe', {
      method: 'PATCH',

      body: form,
    });

    if (res.ok) {
      location.assign('/me'); //reload from the server not from browser cache
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Try agains');
  }
};
