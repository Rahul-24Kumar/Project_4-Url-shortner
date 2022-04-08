const mongoose = require('mongoose')
const urlModel = require("../Models/urlModel")
const shortid = require('shortid')
const redis = require("redis");
const { promisify } = require("util");


//Connect to redis
const redisClient = redis.createClient(
    16368,
    "redis-16368.c15.us-east-1-2.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("Y52LH5DG1XbiVCkNC2G65MvOFswvQCRQ", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Redis is Connected Successfully");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//


const urlShortner = async (req, res) => {
    try {
        let baseUrl = 'http://localhost:3000';
        
        let urlCode = shortid.generate().toLowerCase().substring(0,6);

        // Math.random(urlCode).toLowerCase()
        // console.log(urlCode)
        //.Math.random().toLowerCase()
        let body = req.body;
        let longUrl = body.longUrl;

        let urlFind = await urlModel.findOne({ longUrl: longUrl }).select({_id: 0, __v: 0, createdAt: 0, updatedAt: 0});
       
        if(urlFind) {
            return res.status(200).send({status: true, message: "successfully", data: urlFind})
        }

        let shortUrl = baseUrl + '/' + urlCode;
        let data = { urlCode, longUrl, shortUrl } //packing

        // Validation for BaseUrl :
        if (!(/^https?:\/\/\w/).test(baseUrl)) {
            return res.status(400).send({ status: false, message: "Please check your Base Url, Provide a valid One." })
        }

        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide data" })
        }


        // Validation for Long Url :
        if (!longUrl) {
            return res.status(400).send({ status: false, message: "Please Provide the URL" })
        }

        // if (!Object.values(longUrl)) {
        //     return res.status(400).send({ status: false, msg: "Please Provide the URL details" })
        // }

        if (!(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%\+.~#?&//=]*)/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Please provide a valid Url" })
        }

        // Validation for Short Url :
        if (!shortUrl) {
            return res.status(400).send({ status: false, message: "No shortUrl found, please check again" })
        }

        let urlDetails = await urlModel.create(data)
        let result = {
            urlCode: urlDetails.urlCode.trim(),
            longUrl: urlDetails.longUrl.trim(),
            shortUrl: urlDetails.shortUrl.trim()
        }
        return res.status(201).send({ status: true, url: result })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}
const getShortUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode.trim()
        let cacheData = await GET_ASYNC(`${urlCode}`)

        // if((req.params).length==0) {
        //     return res.status(400).send({status: false, message: "Please Provide url code"})
        // }
        if (cacheData) {
            let datatype = JSON.parse(cacheData)
            //console.log(datatype)
            return res.status(302).redirect(datatype.longUrl)
        } else {
            const urlFindInDb = await urlModel.findOne({ urlCode: urlCode });
            if (urlFindInDb) {
                await SET_ASYNC(`${urlCode}`, JSON.stringify(urlFindInDb))
                return res.status(302).redirect(urlFindInDb.longUrl)
            } else{
                return res.status(404).send({ status:false,message:"no url found with this urlCode"})
            }

        }
    }
    catch (err) {
        //console.log(err);
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports.urlShortner = urlShortner;
module.exports.getShortUrl = getShortUrl;


// const getUrl = async function (req, res) {
//     try {
//         let urlCode = req.params.urlCode
//         // if (urlCode.length != 6) {
//         //     return res.status(400).send({ status: false, msg: "Please provide a valid urlCode" }) }

//         let url = await urlModel.findOne({ urlCode: urlCode })

//         if (!url) {
//             return res.status(404).send({ status: false, msg: "No url found with this urlCode" }) }
//         if (url) {
//             return res.status(302).redirect(url.longUrl) }

//     } catch (err) {
//         return res.status(500).send({ status: false, message: err.message })
//     }
// }