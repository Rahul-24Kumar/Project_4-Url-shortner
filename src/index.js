const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const route = require('./routes/route');
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true }));

mongoose.connect("mongodb+srv://taabish:lkmgsyjhwbQYgkvX@cluster0.cp3ka.mongodb.net/group15-Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})

.then( () => console.log("mongoDb Is Connected"))
.catch ( () => console.log(err) )

app.use('/',route)

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app in running on PORT ' + (process.env.PORT || 3000))

});