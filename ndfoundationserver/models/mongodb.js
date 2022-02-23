const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://ichris:hv29k99kzPaFMkSp@cluster0.rpaco.mongodb.net/ichris?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log("MongoDB running..."))