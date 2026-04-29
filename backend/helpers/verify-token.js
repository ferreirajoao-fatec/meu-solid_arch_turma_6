const jwt = require('jsonwebtoken')
const getToken = require('./get-token')

const checkToken = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(401).json({
            message: "erro de Headers"
        })
    }

    const token = getToken(req)

    if (!token) {
        return res.status(401).json({
            message: "Acesso negado"
        })
    }

    try{
        const verified = jwt.verify(token, 'fatec-turma6-a2026')
        req.user = verified
        next()
    }catch(err){
        res.status(400).json({
            message: "Token inválido"
        })
    }
}

module.exports = checkToken