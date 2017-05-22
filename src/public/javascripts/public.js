define(function(require, exports, module) {
	var PUBLIC = {
		init: function() {
			PUBLIC.bind();
			PUBLIC.selectDiv();
		},
		selectDiv: function() {
			$('body').on('click', '.select span', function(event) {
				var _parent = $(this).parents('.select'),
					_ul = $(_parent).children('ul');
				$(_parent).css({
					"border-color": "#b4dbed",
					"box-shadow": "0px 0px 3px #c4e6f5"
				});
				if ($(_ul).is(':hidden')) {
					$(_ul).show();
				} else {
					$(_ul).hide();
				}
				event.stopPropagation();
			});
			$('body').on('click', '.select ul li', function(event) {
				var _parent = $(this).parents('.select');
				var _text = $(this).text();
                var _type = $(this).attr('t-type');
                var _tid = $(this).attr('t-id');
				$(_parent).children('span').html(_text + '<i></i>').attr('t-type',_type).attr('t-id',_tid);
				$(_parent).children('ul').hide();
				event.stopPropagation();
			})
			$('body').on('click', function(event) {
				if ($('.select').length > 0) {
					$('.select ul').hide();
					$('.select').css({
						"border-color": "#d7d7d7",
						"box-shadow": "inset 0px 1px 1px rgba(0, 0, 0, 0.06)"
					});
				}
				event.stopPropagation();
			})
		},
		bind: function() {
			$('.exit').on('click', function() {
				location.href = '/login';
			})
		}
	};
	module.exports = PUBLIC;
})