require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DB_URI, {
    useUnifiedTopology: true,
});

module.exports = {
    ObjectId,
    client,
    connect: async () => {
        await client.connect();
        return await client.db("users");
    },
    close: async () => {
        await client.close();
    }
};