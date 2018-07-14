const express = require('express')
const router = express.Router()
const fs = require('fs')
const sha1 = require('sha1')
const path = require('path')
const UserModel = require('../models/users')
const checkNotLogin = require('../moddlewares/check').checkNotLogin

router.get('/',checkNotLogin,(req,res,next)=>{
    res.render('signup')
})


router.post('/',checkNotLogin,(req,res,next)=>{
    const name = req.fields.name
    const gender = req.fields.gender
    const bio = req.fields.bio
    const avatar = req.files.avatar.path.split(path.sep).pop()
    let password = req.fields.password
    const repassword = req.fields.repassword

    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error("名字请在1-10个字符之内")
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error("请选择正确的性别")
        }
        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error("个人简介请限制在1-30字符之间")
        }
        if (password.length < 6) {
            throw new Error('密码的长度请在6位以上')
        }
        if (password !== repassword) {
            throw new Error("两次输入的密码不一致")
        }
    } catch (e) {
        fs.unlink(req.files.avatar.path)
        req.flash('error',e.message)
        return res.redirect('signup')
    }
    password = sha1(password)
    let user = {
        name:name,
        gender:gender,
        bio:bio,
        password:password,
        avatar:avatar
    }

    UserModel.create(user).then((result)=>{
        user=result.ops[0]
        delete user.password
        req.session.user = user
        req.flash('success','注册成功')
        res.redirect('/posts')

    }).catch((e)=>{
        fs.unlink(req.files.avatar.path)
        if (e.message.match('duplicate key')){
            req.flash('error','用户名已经被占用')
            return res.redirect('/signup')
        }
        next(e)
    })


})

module.exports= router