define("login",["public"],function(require,exports,module){var e=require("public"),n={init:function(){e.selectDiv(),n.bind()},bind:function(){$(".login-btn").on("click",n.login),$(".login-container-body input").on("keydown",function(e){13==e.keyCode&&n.login()})},login:function(){var e=$(".add-type").text(),n=$(".user-name").val(),t=$(".user-pwd").val();return"请选择用户类型"==e?($(".erro-message").text("请选择用户类型！").fadeIn(),!1):n?t?void $.ajax({type:"post",url:"/api/user/login",data:{userName:n,password:t},success:function(e){e.status?$(".erro-message").text(e.message?e.message:"登陆失败").fadeIn():e.data.Identity?location.href="/user":location.href="/manage"},error:function(e){$(".erro-message").text("登陆失败:"+e.status).fadeIn()}}):($(".erro-message").text("密码不能为空！").fadeIn(),!1):($(".erro-message").text("账户名不能为空！").fadeIn(),!1)}};module.exports=n.init()});