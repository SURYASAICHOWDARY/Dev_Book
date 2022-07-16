const express = require("express");
const connectDB = require("./config/db");

const app = express();

//midleware 
app.use(express.json({ extended: true }));

//connecting mongoDB
connectDB();

app.get("/", (req, res) => res.send('hello world'));

//define routers
app.use('/api/users', require('./routers/api/users'));
app.use('/api/auth', require('./routers/api/auth'));
app.use('/api/profile', require('./routers/api/profile'));
app.use('/api/posts', require('./routers/api/posts'));

const PORT = process.env.PORT ||5000;

app.listen(PORT, ()=> console.log(`server started on port ${PORT}`));