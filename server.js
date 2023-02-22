const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

///Global function which wil handle all unhandled exceptions
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION . SHUTING DOWN');
  process.exit(1);
});
const app = require('./app');

const port = process.env.PORT;

///////////////////////////////////////////////////////////////////////////////
//////////////DATABASE CONNECTION
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    //returns promise so then()
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Start DB'));

//start server listening
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

//////////////////////////////////////UNHANDELED REJECTED PROMISES
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION . SHUTING DOWN');
  server.close(() => {
    process.exit(1);
  });
});
