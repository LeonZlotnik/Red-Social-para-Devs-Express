const express = require('express');
const router = express();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

router.get('/me', auth, async (req,res) =>{
    try{
        const profile = await Profile.findOne({user : req.user.id}).populate('user',
        ['name','avatar']);

        if(!profile){
            return res.status(400).json({msg: "No hay perfil para este usuario"});
        }

        res.json(profile);
    }catch(err){
        console.log(err)
        res.status(500).send({msg:"Error de Servidor"})
    }
});

router.post('/',[auth, [
    check('status','El estatus es requerido')
    .not()
    .isEmpty(),
    check('skills','las habilidades son requeridad')
    .not()
    .isEmpty(),
    ]
], 
async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;
    
    
    //Construir objetos de profile  
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = websire;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    
    //Construir social objetos
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(facebook) profileFields.social.facebook = facebook;
    if(twitter) profileFields.social.twitter = twitter;
    if(instagram) profileFields.social.instagram = instagram;
    if(linkedin) profileFields.social.linkedin = linkedin;
    
    
    try{
        let profile = await Profile.findOne({ user : req.user.id });
        console.log(profile);
        if(profile){
            profile = await Profile.findOneAndUpdate(
                { user : req.user.id },
                {$set : profileFields},
                { new : true}
                );
        
                return res.json(profile);
            }
            profile = new Profile(profileFields);
    
            await profile.save();
            res.json(profile);
        
    }catch(err){
        console.error(err.message);
        res.status(500).send("Error en servidor")
    }

    }
);

router.get('/', async (req,res) =>{
    try{
        const profile = await Profile.find().populate('user', ['name','avatar']);

        res.json(profile);
    }catch{
        console.error(err.message);
        res.status(500).send("Error en Servidor")
    }
});

router.get('/user/:user_id', async (req,res) =>{
    try{
        const profile = await Profile.findOne({ user : req.params.user_id}).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).json({msg: "Perfil no encontrado"})
        }

        res.json(profile);
    }catch{
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: "Perfil no encontrado"})
        }
        res.status(500).send("Error en Servidor")
    }
});


// Delete
router.delete('/', auth, async (req,res) =>{
    try{
        await Profile.findOneAndRemove({ user : req.user.id });

        await User.findOneAndRemove({ _id : req.user.id });

        res.json({msg: "Borrado"})

    }catch{
        console.error(err.message);
        res.status(500).send("Error en Servidor")
    }
});

router.put('/experience', 
[auth, 
    [
        check('title','El titulo es requerido')
        .not()
        .isEmpty(),
        check('company','La compañia es requerida')
        .not()
        .isEmpty(),
        check('from','La fecha de inicio es requerida')
        .not()
        .isEmpty()

    ],
],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(400).json({ errors : errors.array() })
        }

        const {
            title,
            company,
            location,
            fron,
            to,
            current,
            descriptin
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            fron,
            to,
            current,
            descriptin
        }

        try{
            const profile = await Profile.findeOne({user : req.user.id});

            profile.experience.unshift(newExp);

            await profile.save();

            res.json(profile);

        }catch{
            console.error(err.message);
            res.status(500).send('Error en servidor');
        }
});

module.exports = router;

