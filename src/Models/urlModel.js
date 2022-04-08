const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({

    urlCode: {
        type:String,
        require:true,
        unique:true,
        //lowerCase:true,
        trim:true
    },

    longUrl: {
        type:String,
        require:true,
        trim:true
    },

    shortUrl : {
        type:String,
        unique:true,
        require:true,
        trim:true

    },

},{timestamps:true})

module.exports = mongoose.model('url',urlSchema)

