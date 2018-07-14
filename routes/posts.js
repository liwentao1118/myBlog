const express = require('express')
const router = express.Router()
let PostModel = require('../models/posts');
const checkLogin = require('../moddlewares/check').checkLogin
let CommentModel =require('../models/comments')

router.get('/', (req, res, next) => {
    let author = req.query.author;
    PostModel.getPosts(author).then(function (posts) {
        res.render('posts', {posts: posts})
    }).catch(next)
})
router.post('/create', checkLogin, (req, res, next) => {
    let author = req.session.user._id
    let title = req.fields.title
    let content = req.fields.content

    if (!title.length) {
        throw Error('标题不能为空')
    }
    if (!content.length) {
        throw Error('请填写内容')
    }

    let post = {
        author: author,
        title: title,
        content: content
    }

    PostModel.create(post).then(function (result) {
        post = result.ops[0]
        req.flash('success', '发表成功')
        res.redirect(`/posts/${post._id}`)
    }).catch(next)
})
router.get('/create', (req, res, next) => {
    res.render('create')
})
router.get('/:postId', (req, res, next) => {
    const postId = req.params.postId
    Promise.all([
        PostModel.getPostById(postId),
        CommentModel.getComments(postId),
        PostModel.incPv(postId)
    ]).then(function (result) {
        const post = result[0]
        const comments = result[1]
        if (!post) {
            throw Error('文章不存在')
        }
        res.render('post', {
            post: post,
            comments:comments
        })
    }).catch(next)
})
router.get('/:postId/edit', checkLogin, (req, res, next) => {
    const postId = req.params.postId
    const author = req.session.user._id

    PostModel.getRawPostById(postId).then(function (post) {
        if (!post) {
            throw Error('该文章不存在')
        }
        if (author.toString() !== post.author._id.toString()) {
            throw Error('权限不足,无法修改')
        }
        res.render('edit', {
            post: post
        })
    }).catch(next)
})
router.post('/:postId/edit', checkLogin, (req, res, next) => {
    const postId = req.params.postId
    const author = req.session.user._id
    const title = req.fields.title
    const content = req.fields.content

    try {
        if (!title.length) {
            throw Error('请填写标题')
        }
        if (!content.length) {
            throw Error('请填写内容')
        }
    } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
    }

    PostModel.getRawPostById(postId).then(function (post) {
        if (!post) {
            throw Error('该文章不存在')
        }
        if (author.toString() !== post.author._id.toString()) {
            throw Error('权限不足,无法修改')
        }

        PostModel.updatePostById(postId, {title: title, content: content}).then(function () {
            req.flash('success', '更新成功')
            res.redirect(`/post/${postId}`)
        }).catch(next)
    })
})
router.get('/:postId/remove', checkLogin, (req, res, next) => {
    const author = req.session.user._id
    const postId = req.params.postId

    PostModel.getRawPostById(postId).then(function (post) {
        if (!post) {
            throw Error('该文章不存在')
        }
        if (author.toString() !== post.author._id.toString()) {
            throw Error('权限不足,无法修改')
        }
        PostModel.delPostById(postId).then(function () {
        req.flash('success','删除文章成功')
            res.redirect('/posts')
        }).catch(next)
    })

})


module.exports = router