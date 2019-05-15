const express = require('express');
const router = express();
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/Users');


router.post('/', [
    check('name','El nombre es requerido')
        .not()
        .isEmpty(),
    check('email','Introduzca mail valido').isEmail(),
    check('password','La contraseña debe contener 6 o mas caracteres').isLength({min: 6})
],
async (req,res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

const {name,email,password} = req.body;

try{
    let user = await User.findOne({email});

    if(user){
        res.status(400).json({error: [{msg : "El usuario ya existe"}]});
    }

    const avatar = gravatar.url(email,{
        s: '200',
        r: 'pg',
        d: 'mm'
    }) 

    user = new User({
        name,
        email,
        password,
        avatar
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password,salt);

    await user.save();

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