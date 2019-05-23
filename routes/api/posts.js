const express = require('express');
const router = express();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Posts');

router.post('/',
[
    auth, 
    [ 
        check('text','el texto es requqrido')
        .not()
        .isEmpty(),
    ]
],
    async (req,res) =>{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({errors : errors.array()})
            }

    try{
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post ({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save();

        res.json(post);

    }catch(err){
        console.error(err.message);
        res.status(500).send("Error en servidor")
    }

router.get('/', auth, async (req,res)=>{
    try{
        const post = await Post.find().sort({date: -1});

        res.json(post);
    }catch(err){
        console.error(err.message);
        return res.status(500).send("Error en servidor")
    }
})  

router.get('/:id', auth, async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg: "Post no encontrado"})
        }

        res.json(post);
    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Post no encontrado"})
        }
        return res.status(500).send("Error en servidor")
    }
})  

router.delete('/:id', auth, async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg: "Post no encontrado"})
        }

        if(post.user.toString !== req.user.id){
            return res.status(401).json({msg: "Usuario no autorizado"});
        }

        await post.remove();

        res.json({msg : "Post Borrado"});
    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Post no encontrado"})
        }
        return res.status(500).send("Error en servidor")
    }
})  

router.put('/like/:id',auth, async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString() === req.user.id.length > 0)){
            return res.status(400).json({msg: "El Post ha recibido like"});
        }

        post.likes.unshift({user : req.user.id});

        await post.save();

        res.json(post.likes);

    }catch(err){
        console.error(err.message);
        return res.status(500).send("Error en servidor")
    }
})

router.put('/unlike/:id',auth, async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString() === req.user.id.length === 0)){
            return res.status(400).json({mgg: "El Post no ha recibido like"});
        }

       const removeIndext = post.likes.map(like =>like.useryoString()).indexOf(req.user.id)

       post.likes = splice(removeIndext,1);

        await post.save();

        res.json(post.likes);

    }catch{
        console.error(err.message);
        return res.status(500).send("Error en servidor")
    }
})

router.post('/comments/:id',
[
    auth, 
    [ 
        check('text','el texto es requqrido')
        .not()
        .isEmpty(),
    ]
],
    async (req,res) =>{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({errors : errors.array()})
            }

    try{
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComments = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }

        post.comments.unshift({newComments})

        await post.save();

        res.json(post.comments);

    }catch(err){
        console.error(err.message);
        res.status(500).send("Error en servidor")
    }
    })

router.delete('/comment/:id/:comment_id', auth, async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);

        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        if(!comment){
            return res.status(404).json({msg:"no existe el comentario"});
        }

        if(comment.user.toString !== req.user.id){
            return res.status(404).json({msg:" Usuario no autorizado"});
        }

        const removeIndext = post.comments.map(comment =>comment.user.toString()).indexOf(req.user.id)

        post.comments = splice(removeIndext,1);
 
         await post.save();
 
         res.json(post.comment);

    }catch(err){
        console.error(err.message);
        res.status(500).send("Error en servidor")
    }
})    

});

module.exports = router;