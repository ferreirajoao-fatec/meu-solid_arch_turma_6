const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { model } = require('mongoose')

const getUserToken = async (token) =>{
    const decoded = jwt.verify(token, 'fatec-turma6-a2026')
    const userId = decoded.id
    const user = await User.findById({_id: userId})
    return user
}

module.exports = getUserToken