const express = require('express');
const router = express();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/Users');

router.get('/me', auth, async (req,res) =>{
    try{
        const profile = await Profile.findOne({user : req.user.id}).populate('user',
        ['name','avatar']);

        if(!profile){
            return res.status(400).json({msg: "No hay perfil para este usuario"});
        }
    }catch(err){
        console.log(err)
        res.status(500).json({msg:"Error de Servidor"})
    }
});

module.exports = router;