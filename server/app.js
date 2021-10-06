const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");
const multer = require("multer");
const userRoutes = require("./routes/user-routes");
const authRoutes = require("./routes/auth-routes");
const postRoutes = require("./routes/post-routes");
const convRoutes = require("./routes/conv-routes");
const messRoutes = require("./routes/mess-routes");
const HttpError = require("./models/http-error");

require("dotenv").config();
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.0vger.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express();
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE,OPTIONS"
  );

  next();
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    console.log(req.body, file);
    cb(null, req.body.name);
  },
});

const fileFilter = (req, file, cb) => {
  const isValid = !!MIME_TYPE_MAP[file.mimetype];
  let error = isValid ? null : new Error("Invalid mime type");
  cb(error, isValid);
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 4000000 },
});

app.post("/api/upload", upload.single("file"), (req, res, next) => {
  try {
    return res.status(200).json("file uploaded successfully");
  } catch (error) {
    const err = new HttpError("Could not uploads file, try again", 500);
    return next(err);
  }
});

app.use("/api/users", userRoutes.router);
app.use("/api/auth", authRoutes.router);
app.use("/api/posts", postRoutes.router);
app.use("/api/conv", convRoutes.router);
app.use("/api/message", messRoutes.router);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw next(error);
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({ message: err.message || "An unknown error" });
});

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((result) => {
    console.log("Connected");
    app.listen(process.env.PORT || 9999, "localhost");
  })
  .catch((err) => {
    console.log(err);
  });
