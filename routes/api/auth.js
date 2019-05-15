const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/Users');
const auth = require('../../middleware/auth');

router.get('/',auth, async (req,res) =>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.log(err);
        res.status(500).json({msg:"Error en Servidor"});
    }
});

router.post('/', [

    check('email','Introduzca mail valido').isEmail(),
    check('password','La contraseña es necesaria').exists()
],
async (req,res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

const {email,password} = req.body;

try{
    let user = await User.findOne({email});

    if(!user){
        res.status(400)
        .json({error: [{msg : "Invalido!"}]});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        res.status(400)
        .json({error: [{msg : "Invalido!"}]});
    }

    const payload = {
        user : {
            id : user.id
        }
    }

    jwt.sign(
        payload, 
        config.get('jwtSecret'),
        {expiresIn: 360000},
        (err,token) => {
            if(err) throw err;
            res.json({token});
        });

}catch(err){
    console.log(err.message);
}

   
});

module.exports = router;
