const express = require('express');
const audioConcat = require('audioconcat');
const uuid = require('uuid');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();
const axios = require('axios');
const matchContent = require('../utils/processing');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, uuid.v4() + '.wav')
  }
})

// ################ text to specch audio controller #####################
const audioController = async(req, res) => {
  const fileName = uuid.v4() + '.mp3';
  const sentence = "a ba na";
  const words = sentence.split(' ');
  const audioArray = await words.map(word => {
        return `voices/${word}.mp3`;
  });
  audioConcat(audioArray).concat(fileName).on("start", function (command) {
      console.log("Started converting files started ");
    })
    .on("error", function (err, stdout, stderr) {
      console.log("Error: ", err);
    })
    .on("end", function (output) {
      console.log("Finished converting files");
      const filepath = 'http://'+req.headers.host + '/' + fileName;
     const matched =  matchContent(req.data.message);
     console.log('matched', matched.desc.replace(/<[^>]*>?/gm, ''));
     const textIncludes = matched.desc.includes("simbashije kubona");
      return res.send({audioUrl: filepath,...req.data,html:matched.desc,noMatch:textIncludes});
    });
}

// ################ controller to send data to mbaza api #####################

const sendDataController = async (req,res,next) => {
  try {
    const formData = new FormData();
    formData.append('audio',fs.createReadStream(req.file.path));
    const {data} = await  axios.post('https://mbaza.dev.cndp.org.rw/deepspeech/api/api/v1/stt/http', formData,{
      headers:{
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxOCwiZXhwIjoxNjQ4NTM1ODQxLjQyOTE2N30.5SKpmL4dR4GcziIaHN0IVVeF0LONQcPuPaNgldIWJEg',
        ...formData.getHeaders()
      }
    });
    // ######## add your logic here ##############
    


    req.data = data;
    next();
    
  } catch (error) {
    res.send({
      error: error.message
    });
  }
}


const upload = multer({ storage: storage })
router.post('/playSentence',upload.single('audio'),sendDataController,audioController);
module.exports = router;