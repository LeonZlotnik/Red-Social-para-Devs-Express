const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongooseURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, { 
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false  /*Solo aplica para versiones viejas de mongoose*/
        });
        console.log('MongoDB conectado')
    }catch(err){
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;