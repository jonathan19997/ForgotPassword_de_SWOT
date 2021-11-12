const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");
const mailSender = require("../../../utils/mailer");
let SecModelClass = require('./sec.model.js');
let SecModel = new SecModelClass();

router.post('/login', async (req, res, next)=>{
  try {
    const {email, pswd} = req.body;
    //Validar los datos
    let userLogged = await SecModel.getByEmail(email);
    if (userLogged) {
      const isPswdOk = await SecModel.comparePassword(pswd, userLogged.password);
      if (isPswdOk) {
        // podemos validar la vigencia de la contraseña
        delete userLogged.password;
        delete userLogged.oldpasswords;
        delete userLogged.lastlogin;
        delete userLogged.lastpasswordchange;
        delete userLogged.passwordexpires;
        let payload = {
          jwt: jwt.sign(
            {
              email: userLogged.email,
              _id: userLogged._id,
              roles: userLogged.roles
            },
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
          ),
          user: userLogged
        };
        return res.status(200).json(payload);
      }
    }
    console.log({email, userLogged});
    return res.status(400).json({msg: "Credenciales no son Válidas"});
  }catch (ex){
    console.log(ex);
    res.status(500).json({"msg":"Error"});
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const {email, pswd} = req.body;
    let userAdded = await SecModel.createNewUser(email, pswd);
    delete userAdded.password;
    console.log(userAdded);
    res.status(200).json({"msg":"Usuario Creado Satisfactoriamente"});
  } catch (ex) {
    res.status(500).json({ "msg": "Error" });
  }
});

router.put('/passsrecovery/:email', async (req, res, next) => {
  try{ 
  const{email} = req.params;
  let user = await SecModel.getByEmail(email);
  console.log(user);
  if(user){
    const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn:'20m'});
    SecModel.updateResetToken(token, user._id);
    mailSender(
      email,
      "Recuperar contraseña",
      '<h1>Este es un correo de confimación para cambio de contraseña</h1><p> Click aquí para setear contraseña <a href="`http://localhost:3000/${token}">CLICK ME.</></hp>'
      );
      return res.status(200).json({msg: "El enlace para la recuperación de la contraseña ha sido enviado a su correo.", token: token});
    }else{
      return res.status(200).json({msg: "No se ha encontrado una cuenta vinculada con el correo brindado."});
    }
  }catch (ex) {
    console.log(ex);
    return res.status(500).json({ "msg": "Error" });
  }
  
});

router.put('/newpassword', async (req, res, next) => {
 try{
   const {token, newPass} = req.body;

   jwt.verify(token, process.env.JWT_SECRET, async (error, decodeOne) =>{
     if (error){
       return res. status(200).json({msg:"Token inválido o expirado."});
     }else{
       let user = await SecModel.getByResetToken(token);
       if (user){
         SecModel.updatePassword(user._id, newPass);
         SecModel.deleteResetToken(user._id);
         return res.status(200).json({msg:"¡La contraseña se ha actualizado con éxito!"});

       }else{
         return res.status(200).json({msg:"Token inválido."});
       }
     }
   });
 }catch (ex) {
  console.log(ex);
  return res.status(500).json({ "msg": "Error" });
 }
});

module.exports = router;
