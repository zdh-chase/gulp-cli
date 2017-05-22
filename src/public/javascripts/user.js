define(function(require, exports, module) {
  var PUBLIC = require('public'),
    pagination = require('pagination');
  require('echarts');
  var USER = {
    init: function() {
      //获取机床目录
      USER.getMachineMenu();
      USER.bind();
      PUBLIC.init();
      USER.nav();
    },
    bind: function() {
      $('.status-btn').on('click', USER.statusSwitch);
      //刀具上新
      $('body').on('click', '.up-tool', USER.upTool);
      //刀具下架
      $('body').on('click', '.down', USER.downTool);

    },
    //左侧机床目录切换
    nav: function() {
      $('body').on('click', '.container-nav-btn li', function() {
        if ($(this).hasClass("is-error")) {
          return;
        }
        $('.container-nav-btn li,.container-charts-btn li').removeClass('active');
        $(this).addClass('active');
        var mId = $(this).attr('m-id');
        $('.container').attr('m-id', mId).show();
        $('.welcome').hide();
        USER.getToolList({
          MachineId: mId
        });
      });
      $('body').on('click', '.container-charts-btn li', function() {
        $('.container-nav-btn li,.container-charts-btn li').removeClass('active');
        $(this).addClass('active');
        $('.welcome').hide();
        $('.container').hide();
        $('.charts').show();
				var _type = $(this).attr('e-type');
				if(_type == 'bar'){
					USER.eachrtsBar();
				}else{
					USER.eachrtsLine();
				}
      })
    },
    //工作区和下架区切换
    statusSwitch: function() {
      var _btn = $(this).children('i');
      var mId = $('.container').attr('m-id');
      if ($(_btn).attr('is') == 'left') {
        $(_btn).css('left', '30px').attr('is', 'right');
        $('.container-table').eq(0).hide();
        $('.container-table').eq(1).show();
        $('.up-tool').hide();
        USER.getToolListDown({
          MachineId: mId
        });
      } else {
        $(_btn).css('left', '0px').attr('is', 'left');
        $('.container-table').eq(0).show();
        $('.container-table').eq(1).hide();
        $('.up-tool').show();
        USER.getToolList({
          MachineId: mId
        });
      }
    },
		//图表封装
		echartsFn: function(data){
			// 基于准备好的dom，初始化echarts实例
			var app = echarts.init(document.getElementById(data.obj));
			option = {
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999'
						}
					}
				},
				xAxis: [{
					type: 'category',
					data: data.x_data,
					axisPointer: {
						type: 'shadow'
					}
				}],
				yAxis: [{
					type: 'value',
					name: data.y_name,
					min: 0,
					max: 100,
					interval: 10,
					axisLabel: {
						formatter: '{value} %'
					}
				}],
				series: [{
					name: data.y_name,
					type: data.type,
					data: data.y_data
				}]
			};
			// 使用刚指定的配置项和数据显示图表。
			app.setOption(option);
		},
    //柱形图
    eachrtsBar: function() {
			$.ajax({
				type: 'post',
				url: '/api/machine/get',
				data: {
					PageIndex: 1,
					PageSize: 10000
				},
				beforeSend: function(){
					$('.charts-loading').show();
				},
				success: function(data){
					$('.charts-loading').hide();
					  if (!data.status){
							USER.echartsFn({
								obj: 'echarts-main',
								x_data: ['1','2','3'],
								y_name: '平均使用效率',
								y_data: ['10','20','30'],
								type: 'bar'
							})
						}else{
							var _error = data.message?data.message:'获取柱形图失败!';
              swal("失败!", '获取柱形图失败!', "error");
						}
				},
				error: function(xhr){
					$('.charts-loading').hide();
					swal("失败!", '获取柱形图失败!错误：' + xhr.status, "error");
					USER.echartsFn({
						obj: 'echarts-main',
						x_data: ['1','2','3'],
						y_name: '平均使用效率',
						y_data: ['10','20','30'],
						type: 'bar'
					})
				}

			});
    },
		//折线图
		eachrtsLine: function() {
			$.ajax({
				type: 'post',
				url: '/api/machine/get',
				data: {
					PageIndex: 1,
					PageSize: 10000
				},
				beforeSend: function(){
					$('.charts-loading').show();
				},
				success: function(data){
					$('.charts-loading').hide();
						if (!data.status){
							USER.echartsFn({
								obj: 'echarts-main',
								x_data: ['1','2','3'],
								y_name: '平均2使用效率',
								y_data: ['10','20','30'],
								type: 'line'
							})
						}else{
							var _error = data.message?data.message:'获取折线图失败!';
							swal("失败!", '获取折线图失败!', "error");
						}
				},
				error: function(xhr){
					$('.charts-loading').hide();
					swal("失败!", '获取折线图失败!错误：' + xhr.status, "error");
					USER.echartsFn({
						obj: 'echarts-main',
						x_data: ['1','2','3'],
						y_name: '平均使用效率',
						y_data: ['10','20','30'],
						type: 'line'
					})
				}

			});
		},
    //刀具上新
    upTool: function() {
      var mId = $('.container').attr('m-id');
      var _text = '<div class="add-machine-body">' +
        '<div class="select"><span>正在获取刀具列表...<i></i></span><ul></ul></div>' +
        '<input type="text" placeholder="预计寿命/天" class="life" style="display: block" />' +
        '<p class="error-msg"></p>' +
        '</div>';
      swal({
        title: "刀具上新",
        text: _text,
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "添加",
        closeOnConfirm: false,
        cancelButtonText: "取消"
      }, function() {
        var ToolType = $('.add-machine-body .select span').attr('t-type'),
          MachineId = $('.container').attr('m-id'),
          ToolName = $('.add-machine-body .select span').text(),
          LifeExpectancy = $('.add-machine-body .life').val(),
          ToolId = $('.add-machine-body .select span').attr('t-id');
        if (!ToolType || !ToolName) {
          $('.error-msg').text('请选择刀具！').fadeIn();
          return false;
        } else if (!LifeExpectancy) {
          $('.error-msg').text('请填写刀具预计寿命！').fadeIn();
          return false;
        } else if (isNaN(LifeExpectancy) || LifeExpectancy <= 0) {
          $('.error-msg').text('预计寿命请填写正确的数值！').fadeIn();
          return false;
        }
        $.ajax({
          type: 'post',
          url: '/api/record/add',
          async: true,
          data: {
            ToolId: ToolId,
            ToolType: ToolType,
            MachineId: MachineId,
            ToolName: ToolName,
            LifeExpectancy: LifeExpectancy
          },
          success: function(data) {
            if (!data.status) {
              swal("成功!", "刀具上新成功！", "success");
              USER.getToolList({
                MachineId: mId
              });
            } else {
              var _message = data.message ? data.message : '刀具上新失败!';
              swal("失败!", _message, "error");
            }
          },
          error: function(xhr) {
            swal("失败!", '刀具上新失败!错误：' + xhr.status, "error");
          }
        })
      });
      //获取刀具类型
      $.ajax({
        type: "post",
        url: "/api/tool/get",
        async: true,
        data: {
          PageIndex: 1,
          PageSize: 1000
        },
        success: function(data) {
          var html = [],
            ft,
            ftType,
            ftId;
          if (!data.status) {
            $(data.data).each(function(i, o) {
              if (i === 0) {
                ft = o.ToolName;
                ftType = o.ToolType;
                ftId = o.Id;
              }
              html.push('<li t-id="' + o.Id + '" t-type="' + o.ToolType + '">' + o.ToolName + '</li>')
            })
          } else {
            html.push('<li>刀具列表为空</li>')
          }
          $('.add-machine-body .select span').text(ft).attr('t-type', ftType).attr('t-id', ftId);
          $('.add-machine-body .select ul').html(html.join(''));
        },
        error: function(xhr) {
          $('.add-machine-body .select span').text('获取失败!错误：' + xhr.status);
        }
      });
    },
    //刀具下架
    downTool: function() {
      var mId = $('.container').attr('m-id');
      var _text = '<div class="down-tool-body">' +
        '<input type="text" placeholder="下架原因,默认：正常寿命结束" class="reason" style="display: block" />' +
        '</div>',
        Id = $(this).parents('tr').attr('t-id');
      swal({
        title: "刀具下架",
        text: _text,
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确认",
        closeOnConfirm: false,
        cancelButtonText: "取消"
      }, function() {
        var DeleteReason = $('.down-tool-body .reason').val();
        if (!DeleteReason) {
          DeleteReason = "正常寿命结束";
        }
        $.ajax({
          type: "post",
          url: "/api/record/delete",
          async: true,
          data: {
            DeleteReason: DeleteReason,
            Id: Id
          },
          success: function(data) {
            if (!data.status) {
              swal("成功!", "刀具下架成功！", "success");
              USER.getToolList({
                MachineId: mId
              });
            } else {
              var _message = data.message ? data.message : '刀具下架失败!';
              swal("失败!", _message, "error");
            }
          },
          error: function(xhr) {
            swal("失败!", '刀具下架失败!错误：' + xhr.status, "error");
          }
        });
      });
    },
    //获取机床目录
    getMachineMenu: function() {
      $.ajax({
        type: "post",
        url: "/api/machine/get",
        async: true,
        data: {
          PageIndex: 1,
          PageSize: 10000
        },
        success: function(data) {
          var html = [];
          if (!data.status) {
            $(data.data).each(function(i, o) {
              html.push('<li m-id="' + o.Id + '">' + o.MachineName + '</li>');
            })
          } else {
            html.push('<li m-id="">没有机床</li>');
          }
          $('.container-nav-btn').html(html.join(''));
        },
        error: function(xhr) {
          $('.container-nav-btn').html('<li m-id="" class="is-error">获取失败，错误：' + xhr.status + '</li>');
        }
      });
    },
    //获取刀具上新记录
    getToolList: function(map) {
      var tab = $('.working table tbody'),
        page = $('.working .page'),
        MachineId = map.MachineId;
      page.pagination({
        ajax: {
          on: true,
          type: "post",
          url: "/api/record/get",
          dataType: "json",
          param: {
            MachineId: MachineId,
            PageIndex: 1,
            PageSize: 10,
            IsView: 1
          },
          ajaxStart: function() {
            $('.working .working-loading').show();
          },
          callback: function(data) {
            $('.working .working-loading').hide();
            var html = [];
            if (!data.status) {
              if (data.data.length > 0) {
                $(data.data).each(function(i, o) {
                  var _str = o.AddTime.substring(o.AddTime.indexOf('.'), o.AddTime.length);
                  var _html = '<tr t-id="' + o.Id + '"><td>' + o.Id + '</td>' +
                    '<td>' + o.ToolName + '</td>' +
                    '<td>' + o.ToolType + '</td>' +
                    '<td>' + o.AddTime.replace('T', ' ').replace(_str, '') + '</td>' +
                    '<td>' + o.WorkTime + '天</td>' +
                    '<td>' + o.LifeExpectancy + '天</td>' +
                    '<td>' + o.SurplusLife + '天</td>' +
                    '<td align="center"><button class="delete down">换下</button></td>' +
                    '</tr>';
                  html.push(_html);
                })
              } else {
                html.push('<tr><td align="center" colspan="8">没有数据</td></tr>');
              }
            } else {
              var message = data.message ? data.message : '获取刀具列表失败';
              html.push('<tr><td align="center">' + message + '</td></tr>');
            }
            $(tab).html(html.join(''));
          }
        }
      })
    },
    //获取刀具下架记录
    getToolListDown: function(map) {
      var tab = $('.damage table tbody'),
        page = $('.damage .page'),
        MachineId = map.MachineId;
      page.pagination({
        ajax: {
          on: true,
          type: "post",
          url: "/api/record/get",
          dataType: "json",
          param: {
            MachineId: MachineId,
            PageIndex: 1,
            PageSize: 10,
            IsView: 0
          },
          ajaxStart: function() {
            $('.damage .working-loading').show();
          },
          callback: function(data) {
            $('.damage .working-loading').hide();
            var html = [];
            if (!data.status) {
              if (data.data.length > 0) {
                $(data.data).each(function(i, o) {
                  var _str = o.AddTime.substring(o.AddTime.indexOf('.'), o.AddTime.length);
                  var _html = '<tr><td>' + o.ToolId + '</td>' +
                    '<td>' + o.ToolName + '</td>' +
                    '<td>' + o.ToolType + '</td>' +
                    '<td>' + o.AddTime.replace('T', ' ').replace(_str, '') + '</td>' +
                    '<td>' + o.WorkTime + '天</td>' +
                    '<td>' + o.LifeExpectancy + '天</td>' +
                    '<td>' + o.SurplusLife + '天</td>' +
                    '<td>' + o.DeleteTime + '</td>' +
                    '<td>' + o.DeleteReason + '</td>' +
                    '</tr>';
                  html.push(_html);
                })
              } else {
                html.push('<tr><td align="center" colspan="9">没有数据</td></tr>');
              }
            } else {
              var message = data.message ? data.message : '获取刀具列表失败';
              html.push('<tr><td align="center">' + message + '</td></tr>');
            }
            $(tab).html(html.join(''));
          }
        }
      })
    }

  };
  module.exports = USER.init();
})
