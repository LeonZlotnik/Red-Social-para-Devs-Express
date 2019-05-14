const express = require('express');
const router = express();

router.get('/', (req,res) =>{
    res.send('Router de perfil');
});

module.exports = router;