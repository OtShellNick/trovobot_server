const {connect} = require('../db');
const jwt = require('jsonwebtoken');

let users;

(async () => {
    if(!users?.isConnected()) users = (await connect()).collection('users');
})();

const generateJwt = userId => jwt.sign(userId, process.env.SECRET_KEY);

const createUser = async (data) => {
    const newUser = {...data, role: 'user', jwt: generateJwt(data.userId)};
    await users.insertOne(newUser);
    return newUser;
};

const getUserByJwt = async (jwt) => await users.findOne({jwt});

const getUserByUserId = async (userId) => await users.findOne({userId});

const getUserByAccessToken = async (access_token) => {
    return await users.findOne({access_token});
}

const updateUserByUserId = async (userId, data) => {
    const {value} = await users.findOneAndUpdate({userId}, {$set: data}, {returnDocument: 'after'});
    return value;
}

const getAllUsers = async () => await users.countDocuments();

module.exports = {createUser, getUserByUserId, getUserByAccessToken, updateUserByUserId, getUserByJwt, getAllUsers, generateJwt};