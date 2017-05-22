define(function(require, exports, module) {
        var AJS=require('a');
        var BJS=require('b');
	var INDEX={
        init:function(){
            console.log('来自index.js的内容111');
            AJS.aDom();
            BJS.bDom();
        }
	};
	module.exports=INDEX.init();
})