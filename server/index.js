require("dotenv").config();
const express = require("express");
const usersRoutes = require("./routes/auth.route");

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());

app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
