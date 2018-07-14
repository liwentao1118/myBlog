let Post = require('../lib/mongo').Post;
let marked = require('marked');
let CommentModel = require('./comments');

Post.plugin('addCommentsCount',{
    afterFind:function (posts) {
        return Promise.all(posts.map(function (post) {
            return CommentModel.getCommentCount(post._id).then(function (commentsCout) {
                post.commentsCount = commentsCout
                return post
            })
        }))

    },
    afterFineOne:function (post) {
        if (post){
            return CommentModel.getCommentCount(post._id).then(function (count) {
                post.commentsCount = count
                return post
            })
        }
        return post
    }
})


Post.plugin('contentToHtml',{
    afterFind:function (posts) {
       return posts.map(function (post) {
           post.content = marked(post.content)
           return post
       })
    },
    afterFineOne:function (post) {
        if (post) {
            post.content = marked(post.content)

        }
        return post
    }
})


module.exports = {

    create :function create(post) {
        return Post.create(post).exec()
    },
    getPostById:function getPostById(postId) {
        return Post.findOne({_id:postId})
            .populate({path:'author',model:'User'})
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec()

    },
    getPosts:function getPosts(author) {
        const query = {}
        if (author){
            query.author = author
        }

        return Post.find(query).populate({ path: 'author', model: 'User' }).sort({_id:-1}).addCreatedAt().addCommentsCount().contentToHtml().exec()
    },
    incPv:function incPv(postId) {
        return Post.update({_id:postId},{$inc:{pv:1}}).exec()

    },
    getRawPostById:function getRawPostById(postId) {
        return Post.findOne({_id:postId}).populate({path:'author',model:'User'}).exec()

    },
    updatePostById:function updatePostById(postId) {
        return Post.updateOne({_id:postId},{$set:data}).exec()
    },
    delPostById:function delPostById(postId,author) {
        return Post.deleteOne({author:author,_id:postId}).exec().then(function (res) {
            if (res.result.ok && res.result.n > 0) {
                return CommentModel.deleteCommentByPostId(postId)
            }
            
        })
    }
}
