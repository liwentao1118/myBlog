const config = require('config-lite')
const Mongolass = require('mongolass')
const mongolass  = new Mongolass()
const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')



exports.User=mongolass.model('User',{
    name:{type:String,require:true},
    password:{type:String ,require:true},
    avatar:{type:String,require:true},
    gender:{type:String,enum:['m','f','x'],default:'f'},
    bio:{type:String,require:true}
})


mongolass.plugin('addCreatedAt',{
    afterFind:function (results) {
        results.forEach((item)=>{
            item.created_at=moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
        })
        return results
        
    },
    afterFineOne:function (result) {
        if (result){
            result.created_at=moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
        }
        return result
        
    }
})

exports.User.index({name:1},{unique:true}).exec

exports.Post = mongolass.model('Post',{
    author:{ type: Mongolass.Types.ObjectId, required: true },
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    pv:{
        type:'number',
        default:0
    }
})
exports.Post.index({author:1,_id:-1}).exec()

exports.Comment = mongolass.model('Comment',{
    author:{type:Mongolass.Types.ObjectId,required:true},
    content:{
        type:String,
        required:true
    },
    postId:{
        type:Mongolass.Types.ObjectId,required:true
    }
})
exports.Comment.index({postId:1,_id:1}).exec()

