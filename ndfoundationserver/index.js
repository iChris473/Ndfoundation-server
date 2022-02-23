
require('dotenv').config({ path: './config.env' })
const express = require('express')
const app = express()
require("./models/mongodb");
const cors = require("cors")

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const routes = require("./router/routes")
const private = require("./router/private")
const path = require('path')

app.use("/api", routes)
app.use("/api/private", private)

const port = process.env.PORT || 3000


app.listen(port, (err) => {
  if (err) throw err
  console.log(`> Ready on ${port}`)
})
  

// app.listen(port, () => console.log("Backend Running..."))
