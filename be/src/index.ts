import { app } from "./app";
import mongoose from "mongoose";

const start = async () => {

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${process.env.PORT}.`);
  });
};

start();
