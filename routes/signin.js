const express = require('express')
const router = express.Router()
const checkNotLogin = require('../moddlewares/check').checkNotLogin
const sha1 = require('sha1')
const UserModle = require('../models/users')

router.get('/',checkNotLogin,(req,res,next)=>{
    res.render('signin')
})
router.post('/',checkNotLogin,(req,res,next)=>{
    const name = req.fields.name
    const password = req.fields.password

    try {
        if (!name.length) {
            throw new Error('请填写用户名')
        }
        if (!password.length) {
            throw new Error('请填写密码')
        }
    } catch (e) {
        req.flash(e.message)
        res.redirect('back')
    }

    UserModle.getUserByName(name).then(function (user) {
        if (!user) {
            req.flash('error','用户不存在')
            res.redirect('back')
        }
        req.flash('success','登录成功')
        delete user.password
        req.session.user = user
        res.redirect('/posts')
    }).catch(next)

})

module.exports=router