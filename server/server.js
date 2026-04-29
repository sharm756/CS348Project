import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import express from "express";
import cors from "cors";
import records from "./routes/record.js";
import mongoSanitize from "express-mongo-sanitize";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body);
  next();
});
app.use("/record", records);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
