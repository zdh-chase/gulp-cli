define(function(require, exports, module) {
	var AJS={
        init:function(){

        },
        aDom:function(){
        	console.log('来自a.js的内容--检测watch功能我修改了wwwwddaaaa111dsada0000....2505200');
        	$('p').html('111111');
        	$.ajax({
        		type:'get',
        		url:'/api/login',
        		data:{

        		},
        		success:function(data){

        		}
        	})
        }
	};
	module.exports=AJS;
})