const express = require('express')
const router = express.Router()
const checkLogin = require('../moddlewares/check').checkLogin
const CommentModel = require('../models/comments')

router.post('/', checkLogin, function (req, res, next) {
    const author = req.session.user._id
    const postId = req.fields.postId
    const content = req.fields.content


    try {
        if (!content.length) {
            throw new Error('请填写留言内容')
        }
    } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
    }

    const comment = {
        author: author,
        postId: postId,
        content: content
    }

    CommentModel.create(comment)
        .then(function () {
            req.flash('success', '留言成功')

            res.redirect('back')
        })
        .catch(next)
})

router.get('/:commentId/remove', checkLogin, function (req, res, next) {
    const commentId = req.params.commentId
    const author = req.session.user._id

    CommentModel.getCommentById(commentId)
        .then(function (comment) {
            if (!comment) {
                throw new Error('留言不存在')
            }
            if (comment.author.toString() !== author.toString()) {
                throw new Error('没有权限删除留言')
            }
            CommentModel.delCommentById(commentId)
                .then(function () {
                    req.flash('success', '删除留言成功')

                    res.redirect('back')
                })
                .catch(next)
        })
})


module.exports=router