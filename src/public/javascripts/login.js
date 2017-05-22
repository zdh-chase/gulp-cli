define(function(require, exports, module) {
	var PUBLIC = require('public');
	var LOGIN = {
		init: function() {
			PUBLIC.selectDiv();
			LOGIN.bind();
		},
		bind: function() {
			$('.login-btn').on('click', LOGIN.login);
			//回车登陆事件
			$('.login-container-body input').on('keydown',function(event){
          if(event.keyCode == 13){
						LOGIN.login();
					}
			});
		},
		login: function() {
			var userType = $('.add-type').text();
			var UserName = $('.user-name').val();
			var PassWord = $('.user-pwd').val();
			if(userType == '请选择用户类型'){
				$('.erro-message').text('请选择用户类型！').fadeIn();
				return false;
			}
			if (!UserName) {
				$('.erro-message').text('账户名不能为空！').fadeIn();
				return false;
			} else if (!PassWord) {
				$('.erro-message').text('密码不能为空！').fadeIn();
				return false;
			}
			$.ajax({
				type: 'post',
				url: '/api/user/login',
				data: {
					userName: UserName,
					password: PassWord
				},
				success: function(data) {
					if (!data.status) {
						if (data.data.Identity) {
							//普通用户
							location.href = "/user";
						} else {
							//管理员
							location.href = "/manage";
						}
					} else {
						$('.erro-message').text(data.message ? data.message : '登陆失败').fadeIn();
					}
				},
				error: function(xhr) {
					$('.erro-message').text('登陆失败:' + xhr.status).fadeIn();
				}
			})
		}
	};
	module.exports = LOGIN.init();
})
