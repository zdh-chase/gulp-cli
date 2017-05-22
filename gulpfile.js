'use strict';
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var group = require('gulp-group-files');
var transport = require('gulp-seajs-transport');  
var sass = require('gulp-sass');  
var spriter = require('gulp-css-spriter');  //雪碧图
var px3rem = require("gulp-px3rem");
var minifycss = require('gulp-minify-css'); 
var rev = require('gulp-rev');                                  //- 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');               //- 路径替换
var imagemin = require('gulp-imagemin');
var base64 = require('gulp-base64');
var htmlmin = require('gulp-htmlmin');
var browserSync = require('browser-sync');
var del = require('del');
var nodemon = require('gulp-nodemon');
var concat = require('gulp-concat');
var gulpCopy = require('gulp-file-copy');
var livereload = require('gulp-livereload');
var proxy = require('http-proxy-middleware');


var jsFiles = {
    "login" : {
      src: ['src/public/javascripts/login.js'],
      dest: "dist/public/javascripts/"
    },
    "manage" : {
      src: ['src/public/javascripts/public.js','src/public/javascripts/manage.js'],
      dest: "dist/public/javascripts/"
    },
    "user" : {
      src: ['src/public/javascripts/public.js','src/public/javascripts/user.js'],
      dest: "dist/public/javascripts/"
    },
    "public" : {
      src: ['src/public/javascripts/public.js'],
      dest: "dist/public/javascripts/"
    }
};
gulp.task('mergeScripts',function () {
    return group(jsFiles,function (key,fileset){
        return gulp.src(fileset.src)    
            .pipe(transport())  //模块具象化
            .pipe(uglify({//压缩js
             //mangle: true,//类型：Boolean 默认：true 是否修改变量名
             mangle: { except: ['require', 'exports', 'module', '$'] }//排除混淆关键字
             }))
            .pipe(concat(key+'.js'))  //生成js
            .pipe(gulp.dest(fileset.dest));  //生成合并后的js的路径  
    })();
});

// copy js组件
gulp.task('js',function(){
    gulp.src('src/public/javascripts/lib/*')
        .pipe(gulp.dest('dist/public/javascripts/lib/'));
});

gulp.task('mergeScss',function (){
        var timestamp = +new Date();
        del(['dist/public/images/sprite/*']);
        return gulp.src(['src/public/scss/*.scss'])
            .pipe(sass().on('error', sass.logError))
            .pipe(spriter({
            // 生成的spriter的位置
            'spriteSheet': 'dist/public/images/sprite/sprite-'+timestamp+'.png',
            // 生成样式文件图片引用地址的路径
            // 如下将生产：backgound:url(../images/sprite20324232.png)
            'pathToSpriteSheetFromCSS': '../images/sprite/sprite-'+timestamp+'.png'
            }))
           // .pipe(px3rem({remUnit: 75 }))//转化基值72，
            .pipe(minifycss())
            .pipe(rev())                                            //- 文件名加MD5后缀
            .pipe(gulp.dest('dist/public/scss/'))
            .pipe(base64({
                baseDir: 'dist/public/scss/',
                extensions: ['svg', 'png', /\.jpg#datauri$/i],
                exclude:    [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
                maxImageSize: 20*1024, // bytes 
                debug: true 
            }))
            .pipe(gulp.dest('dist/public/scss/'))
            .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
            .pipe(gulp.dest('rev'));                              //- 将 rev-manifest.json 保存到 rev 目录内
});


gulp.task('scssrev',['mergeScss'],function() {
  return gulp.src( ['rev/*.json','dist/views/*/*.*'])                                    //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
               .pipe(revCollector(
                   {
                    replaceReved: true
                    /*dirReplacements: {
                        '/static/scss': '/build/scss'
                    }*/
                   }
                ))                                   //- 执行文件内css名的替换
               .pipe(gulp.dest("dist/views/"));                     //- 替换后的文件输出的目录    
});



// 压缩img
gulp.task('img', function() {  
  return gulp.src('src/public/images/**/*')        //引入所有需处理的Img
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))      //压缩图片
    // 如果想对变动过的文件进行压缩，则使用下面一句代码
    // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))) 
    .pipe(gulp.dest('dist/public/images/'))
    // .pipe(notify({ message: '图片处理完成' }));
});
/*
 * 图片base64
 */
gulp.task('base64', function() {
    return gulp.src('dist/public/scss/*')
        .pipe(base64({
            baseDir: 'dist/public/scss/',
            extensions: ['svg', 'png', /\.jpg#datauri$/i],
            exclude:    [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
            maxImageSize: 20*1024, // bytes 
            debug: true 
        }))
        .pipe(gulp.dest('dist/public/scss'));
});

// 压缩ejs
gulp.task('ejs', function() {
  return gulp.src('src/views/**/*.ejs')
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest('dist/views/'));
});


// 浏览器同步，用7000端口去代理Express的3008端口
gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    notify: false,//关闭页面通知
    proxy: "http://localhost:3000",
    files: ["dist/views/*.*","dist/public/scss/*.*","dist/public/javascripts/*.*","dist/public/images/*.*"],
    browser: "chrome",
    port: 7000,
    middleware: [
      proxy('/api', {
          target: 'http://localhost:15272',
          changeOrigin: true,
          ws: true
      })
    ]
  });
});

// 开启Express服务
gulp.task('nodemon', function (cb) {
  
  var started = false;
  
  return nodemon({
    script: 'bin/www'
  }).on('start', function () {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true; 
    } 
  });
}); 

// 删除文件
gulp.task('clean', function(cb) {
    del(['dist/public/scss/*', 'dist/public/javascripts/*', 'dist/public/images/*','dist/views/*'], cb)
});

gulp.task('build',['ejs','scssrev','mergeScripts','img','js'],function () {
    
});

gulp.task('server',['browser-sync'],function(){
  // 将你的默认的任务代码放这

    // 监听所有css文档
    gulp.watch('src/public/scss/*.scss', ['scssrev']);

    // 监听所有.js档
    gulp.watch('src/public/javascripts/*.js', ['mergeScripts']);

    // 监听所有图片档
    gulp.watch('src/public/images/**/*', ['img']);
    // 监听ejs
    gulp.watch('src/views/**/*.ejs', ['ejs']);
});