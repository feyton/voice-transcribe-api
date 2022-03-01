const express= require ('express');
const  router= require('./app/routes/index');
const cors = require('cors');
const app = express();
const path = require('path');





app.use(express.json());
app.use(cors())
app.use(router);
app.use(express.static(path.join(__dirname, '')));

const port  = 8500;

app.listen(port,()=>{
     
    console.log(`🔥 app is running on port  ${port}`);
})


