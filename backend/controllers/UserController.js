const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const createUserToken = require('../helpers/create-user-tokens')
const getTokens = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const { get } = require('mongoose')

module.exports = class UserController {
   static async register(req, res) {
      const { name, email, phone, password, confirmpassword } = req.body

      if (!name) {
         res.status(422).json({ message: "Nome é obrigatório" })
         return
      }
      if (!email) {
         res.status(422).json({ message: "Email é obrigatório" })
         return
      }
      if (!phone) {
         res.status(422).json({ message: "Telefone é obrigatório" })
         return
      }
      if (!password) {
         res.status(422).json({ message: "Senha é obrigatório" })
         return
      }
      if (!confirmpassword) {
         res.status(422).json({ message: "Confirmação de senha é obrigatório" })
         return
      }
      if (password !== confirmpassword) {
         res.status(422).json({ message: "Senhas não são iguais" })
         return
      }

      const userExist = await User.findOne({ email: email })

      if (userExist) {
         res.status(422)({ message: "O usuário já existe!" })
      }

      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)

      const user = new User({
         name,
         email,
         phone,
         password: passwordHash
      })

      try {
         const newUser = await user.save()
         await createUserToken(newUser, req, res)
      }
      catch (err) {
         res.status(503).json({ message: err })
      }
   }

   static async login(req, res) {
      const { email, password } = req.body

      if (!email) {
         res.status(422).json({ message: "Email é obrigatório" })
         return
      }
      if (!password) {
         res.status(422).json({ message: "Senha é obrigatório" })
         return
      }

      const userExist = await User.findOne({ email: email })

      if (!userExist) {
         res.status(401).json({ message: "Usuário não autoriazado a login!" })
         return
      }

      const checkPassword = await bcrypt.compare(password, userExist.password)

      if (!checkPassword) {
         res.status(401).json({ message: "Usuário não autoriazado a login!" })
         return
      }

      await createUserToken(userExist, req, res)
   }

   static async checkUser(req, res) {
      let currentUser

      console.log(req.headers.authorization)

      if (req.headers.authorization) {
         const token = getTokens(req)
         const decoded = jwt.verify(token, 'fatec-turma6-a2026')

         currentUser = await User.findById(decoded.id)
         currentUser.password = undefined
      } else {
         currentUser = null
      }

      res.status(200).send(currentUser)
   }

   static async getUserById(req, res) {
      const id = req.params.id

      const user = await User.findById(id)

      if (!user) {
         res.status(404).json({
            message: "Usuário não encontrado!"
         })
         return
      }

      res.status(200).json(user)
   }

   static async editUser(req, res) {

      const token = getTokens(req)
      const user = await getUserByToken(token)

      const { name, email, phone, password, confirmpassword } = req.body

      let image = ''

      if(req.file){
         image = req.file.filename
      }

      if (!name) {
         res.status(422).json({ message: "Nome é obrigatório" })
         return
      }
      user.name = name

      if (!email) {
         res.status(422).json({ message: "Email é obrigatório" })
         return
      }
      if (!phone) {
         res.status(422).json({ message: "Telefone é obrigatório" })
         return
      }
      user.phone = phone

      const userExist = await User.findOne({ email: email })
      if (user.email !== email && userExist) {
         res.status(422).json({ message: "Existe um problema de chave de e-mail com a edição." })
         return
      }
      user.email = email

      if (password !== confirmpassword) {
         res.status(422).json({ message: "Senhas não são iguais" })
         return
      }
      else if (password === confirmpassword && password != null) {
         const salt = await bcrypt.genSalt(12)
         const password = await bcrypt.hash(password, salt)
         user.password = passwordHash
      }

      try {
         const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: user },
            { new: true }
         )
         res.status(202).json({
            message: "Dados aceitos e processados",
            updatedUser
         })
      } catch (err) {
         res.status(500).json({ message: err })
         return
      }

   }
}
