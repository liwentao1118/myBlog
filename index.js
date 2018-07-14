const path = require('path')
const express = require('express')
let app = express();
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(express.static(path.join(__dirname,'public')))

app.use(session({
    name:config.session.key,
    secret:config.session.secret,
    resave:true,
    saveUninitialized:false,
    cookie:{
        maxAge:config.session.maxAge,
    },
    store:new MongoStore({
        url:config.mongodb
    }),
}))
app.use(flash())


app.use(require('express-formidable')({
    uploadDir:path.join(__dirname,'public/img'),
    keepExtensions:true
    })
)


app.locals.blog={
    title: pkg.name,
    description: pkg.description
}
app.use(function (req, res, next) {
    res.locals.user = req.session.user
    res.locals.success = req.flash('success').toString()
    res.locals.error = req.flash('error').toString()
    next()
})
routes(app)



app.use(function (err, req, res, next) {
    console.error(err)
    req.flash('error', err.message)
    res.redirect('/posts')
})




app.listen(config.port,()=>{
    console.log(`${pkg.name} listening on port ${config.port}`)
})