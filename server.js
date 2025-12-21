const mongoose = require('mongoose');

const dotenv = require('dotenv');
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  // we don't need server.close here because server have nothing to do with sync errors
  process.exit(1); // Exit the process
});
dotenv.config({ path: './config.env' }); // read our variables from the file and save them into nodejs environment variable
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  });

const app = require('./app');
const port = 3000;
const server = app.listen(port, () => {
  console.log('start getting requests');
});

// like if promise not catched
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // Exit with failure
  });
});
