
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

//log4js日志管理
var log4js = require('log4js');
log4js.configure({
    appenders:[
        {type:'console'},//控制台输出
        {
            type:'file',//文件输出
            filename:'logs/access.log',
            maxLogSize:1024,
            backups:3,
            category:'normal'
        }
    ],
    replaceConsole: true
});


//var logger = log4js.getLogger('normal');
//logger.setLevel('INFO');

//将log4js组件导出供在routes中使用日志功能
exports.logger=function(name){
    var logger = log4js.getLogger(name);
    logger.setLevel('INFO');
    return logger;
}

//切记var routes = require('./routes');应置于exports.logger的下面，否则报错
var routes = require('./routes');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db,
        collection:"sessions",
        auto_reconnect:true,
        url:'mongodb://root:root@localhost:27017/blog'
    })
}));

//设置log4js日志的格式
//app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO, format:':method :url'}));
app.use(log4js.connectLogger(this.logger('normal'), {level:log4js.levels.INFO, format:':method :url'}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);