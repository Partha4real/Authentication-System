const mongoose = require('mongoose');

const connDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGOURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        console.log('MongoDB COnnected '+conn.connection.host)
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connDB