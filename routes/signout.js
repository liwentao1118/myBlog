const express = require('express')
const router = express.Router()
const checkLogin = require('../moddlewares/check').checkLogin

router.get('/',checkLogin,(req,res,next)=>{
    req.session.user=null
    req.flash('success',"登出成功")
    res.redirect('/posts')
})

module.exports= router