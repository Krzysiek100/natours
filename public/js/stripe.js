const stripe = Stripe(
  'pk_test_51MdbowKl147Dzt0oQ2dT5Moe5AzvZy7gwrEeAOgzE4cUPmTheQnPgYU58mEuZVPrxbdOUMETFKjs635xr2mLo86400OnLKtffR'
);

export const bookTour = async (tourId) => {
  //1) get checkout-seesion from the server API
  const session = await fetch(
    `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
  );

  console.log(session);
  //2 use strpe object to autmaticly
};
