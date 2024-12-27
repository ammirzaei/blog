const mongoose = require('mongoose');
const debug = require('debug')('weblog');

module.exports = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGO_URI);

        debug(`Mongodb Connected : ${conn.connection.host}`)
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}