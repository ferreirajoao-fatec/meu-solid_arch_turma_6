const User = require('../models/User')
const bcrypt = require('bcrypt')
const createUserToken = require('../helpers/create-user-tokens')

module.exports = class UserController {
    static async register(req, res) {
       const{ name, email, phone, password, confirmpassword } = req.body

       if(!name){
        res.status(422).json({message: "Nome é obrigatório"})
        return
       }
       if(!email){
        res.status(422).json({message: "Email é obrigatório"})
        return
       }
       if(!password){
        res.status(422).json({message: "Senha é obrigatório"})
        return
       }
       if(!phone){
        res.status(422).json({message: "Telefone é obrigatório"})
        return
       }
       if(!confirmpassword){
        res.status(422).json({message: "Confirmação de senha é obrigatório"})
        return
       }
       if(password !== confirmpassword){
        res.status(422).json({message: "Senhas não são iguais"})
        return
       }

       const userExist = await User.findOne({email: email})

       if(userExist){
        res.status(422)({message: "O usuário já existe!"})
       }

       const salt = await bcrypt.genSalt(12)
       const passwordHash = await bcrypt.hash(password, salt)

       const user = new User({
        name,
        email,
        phone,
        password: passwordHash
       })

         try{
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
         }
         catch(err){
            res.status(503).json({message: err})
         }
    }

   static async login(req, res) {
    const {email, password} = req.body

    if(!email){
        res.status(422).json({message: "Email é obrigatório"})
        return
       }
       if(!password){
        res.status(422).json({message: "Senha é obrigatório"})
        return
       }

       const userExist = await User.findOne({email: email})

       if(!userExist){
        res.status(401).json({message: "Usuário não autoriazado a login!"})
        return
       }

       const checkPassword = await bcrypt.compare(password, userExist.password)

       if(!checkPassword){
        res.status(401).json({message: "Usuário não autoriazado a login!"})
        return
       }

       await createUserToken(userExist, req, res)
   }

}

