define(function(require, exports, module) {
  var PUBLIC = require('public'),
    pagination = require('pagination');
  var MANAGE = {
    init: function() {
      MANAGE.bind();
      MANAGE.nav();
      PUBLIC.init();
      MANAGE.getMachine();
      MANAGE.getTool();
      MANAGE.batch();
    },
    bind: function() {
      //删除机床
      $('body').on('click', '.machine-box .delete', MANAGE.deleteMachine);
      //添加机床
      $('body').on('click', '.machine-box .add-machine', MANAGE.addMachine);
      //修改机床
      $('body').on('click', '.machine-box .edit', MANAGE.modifyMachine);
      //删除刀具
      $('body').on('click', '.tool-box .delete', MANAGE.deleteTool);
      //添加刀具
      $('body').on('click', '.tool-box .add-tool', MANAGE.addTool);
      //修改刀具
      $('body').on('click', '.tool-box .edit', MANAGE.modifyTool);
      //批量删除机床
      $('body').on('click', '.delete-all-machine', MANAGE.allDeleteMachine);
    },
    //菜单栏切换
    nav: function() {
      $('.container-nav-btn li').on('click', function() {
        var _index = $(this).index();
        $('.container-nav-btn li').removeClass('active');
        $(this).addClass('active');
        $('.container').hide();
        $('.container').eq(_index).show();
      })
    },
    //批量操作
    batch: function() {
      var _chekbox = $('.all').parents('table').find('tbody').children('input[type="checkbox"]');
      $('.all').on('click', function() {
        if ($(this).is(':checked')) {
          $(_chekbox).prop('checked', true);
        } else {
          $(_chekbox).prop('checked', false);
        }
      })
    },
    //批量删除机床
    allDeleteMachine: function() {
      var _type = $(this).attr('type');
      if (_type == 'm-all') {
        var _all = $('#all');
      } else {
        var _all = $('#all2');
      }
      var _chekbox = $(_all).parents('table').find('tbody').children('input[type="checkbox"]');
      var _checked = $(_all).parents('table').find('tbody').children('input[type="checkbox"]:checked');
      var _is = $(this).attr('is');
      if (_is == 'off') {
        $(this).html('批量删除 &times;').attr('is', 'on');
        $(_all).parents('td').fadeIn();
        $(_chekbox).parents('.ft').fadeIn();
      } else {
        if (_checked.length == 0) {
          swal("警告!", "请选择需要删除的数据! ", "warning");
        } else {
          var _list = [];
          $(_checked).each(function(i, o) {
            _list.push($(o).parents('td').prev('td').text())
          });
          if (_type == 'm-all') {
            var _url = "/api/machine/delete";
          } else {
            var _url = "/api/tool/delete";
          }
          $.ajax({
            type: "post",
            url: _url,
            async: true,
            data: {
              IdList: _list.toString()
            },
            success: function(data) {
              if (!data.status) {
                swal("成功!", "删除成功！", "success");
                MANAGE.getMachine();
              } else {
                swal("失败!", "删除失败！ ", "error");
              }
            },
            error: function(xhr) {
              swal("失败!", "删除失败！错误信息：" + xhr.status, "error");
            }
          });
        }
      }
    },
    //删除机床
    deleteMachine: function() {
      var _this = this;
      swal({
        title: "操作提醒",
        text: "是否确认删除该条数据？",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确认删除",
        closeOnConfirm: false,
        cancelButtonText: "取消"
      }, function() {
        var IdList = [];
        IdList.push($(_this).parents('tr').children('td').eq(0).text());
        $.ajax({
          type: "post",
          url: "/api/machine/delete",
          async: true,
          data: {
            IdList: IdList.toString()
          },
          success: function(data) {
            if (!data.status) {
              swal("成功!", "该机床已删除！", "success");
              MANAGE.getMachine();
            } else {
              swal("失败!", "删除失败！ ", "error");
            }
          },
          error: function(xhr) {
            swal("失败!", "删除失败！错误信息：" + xhr.status, "error");
          }
        });
      });
    },
    //删除刀具
    deleteTool: function() {
      var _this = this;
      swal({
        title: "操作提醒",
        text: "是否确认删除该条数据？",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确认删除",
        closeOnConfirm: false,
        cancelButtonText: "取消"
      }, function() {
        var IdList = [];
        IdList.push($(_this).parents('tr').children('td').eq(0).text());
        $.ajax({
          type: "post",
          url: "/api/tool/delete",
          async: true,
          data: {
            IdList: IdList.toString()
          },
          success: function(data) {
            if (!data.status) {
              swal("成功!", "该刀具已删除！", "success");
              MANAGE.getTool();
            } else {
              swal("失败!", "删除失败！", "error");
            }
          },
          error: function(xhr) {
            swal("失败!", "删除失败！错误信息：" + xhr.status, "error");
          }
        });
      });
    },
    //添加机床
    addMachine: function() {
      var _text = '<div class="add-machine-body">' +
        '<input type="text" placeholder="名称" class="add-name" style="display: block" />' +
        '<div class="select"><span class="add-type">车床<i></i></span><ul><li>车床</li><li>磨床</li><li>锐床</li></ul></div>' +
        '<input type="text" placeholder="负责人" class="add-charger" style="display: block" />' +
        '<p class="error-msg"></p>' +
        '</div>';
      swal({
        title: "添加机床",
        text: _text,
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "添加",
        closeOnConfirm: false,
        cancelButtonText: "取消"
      }, function() {
        var MachineName = $('.add-machine-body .add-name').val(),
          MachineCharger = $('.add-machine-body .add-charger').val(),
          MachineType = $('.add-machine-body .add-type').text();
        if (!MachineName) {
          $('.error-msg').text('请填写机床名称！').fadeIn();
          return;
        } else if (!MachineCharger) {
          $('.error-msg').text('请填写机床负责人！').fadeIn();
          return;
        } else if (!MachineType) {
          $('.error-msg').text('请选择机床类型！').fadeIn();
          return;
        }
        $.ajax({
          type: "post",
          url: "/api/machine/add",
          async: true,
          data: {
            MachineName: MachineName,
            MachineCharger: MachineCharger,
            MachineType: MachineType
          },
          success: function(data) {
            if (!data.status) {
              swal("成功!", "机床添加成功！", "success");
              MANAGE.getMachine();
            } else {
              swal("失败!", "机床添加失败！", "error");
            }
          },
          error: function(xhr) {
            swal("失败!", "机床添加失败！错误信息：" + xhr.status, "error");
          }
        });
      });
    },
    //添加刀具
    addTool: function() {
      var _text = '<div class="add-tool-body">' +
        '<input type="text" placeholder="名称" class="add-name" style="display: block" />' +
        '<input type="text" placeholder="类型" class="add-type" style="display: block" />' +
        '<input type="text" placeholder="数量" class="add-num" style="display: block" />' +
        '<p class="error-msg"></p>' +
        '</div>';
      swal({
        title: "添加刀具",
        text: _text,
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "添加",
        closeOnConfirm: false,
        cancelButtonText: "取消"
      }, function() {
        var ToolName = $('.add-tool-body .add-name').val(),
          ToolNum = $('.add-tool-body .add-num').val(),
          ToolType = $('.add-tool-body .add-type').val();
        if (!ToolName) {
          $('.error-msg').text('请填写刀具名称！').fadeIn();
          return;
        } else if (!ToolType) {
          $('.error-msg').text('请填写刀具类型！').fadeIn();
          return;
        } else if (!ToolNum) {
          $('.error-msg').text('请填写刀具数量！').fadeIn();
          return;
        }
        $.ajax({
          type: "post",
          url: "/api/tool/add",
          async: true,
          data: {
            ToolName: ToolName,
            ToolNum: ToolNum,
            ToolType: ToolType
          },
          success: function(data) {
            if (!data.status) {
              swal("成功!", "刀具添加成功！", "success");
              MANAGE.getTool();
            } else {
              swal("失败!", "刀具添加失败！", "error");
            }
          },
          error: function(xhr) {
            swal("失败!", "刀具添加失败！错误信息：" + xhr.status, "error");
          }
        });
      });
    },
    //修改机床
    modifyMachine: function() {
      var _td = $(this).parents('tr').find('td'),
        name = _td.eq(1).text(),
        type = _td.eq(2).text(),
        person = _td.eq(3).text(),
        Id = _td.eq(0).text();
      var _text = '<div class="modify-machine-body">' +
        '<input type="text" placeholder="名称" class="modify-name" style="display: block" value="' + name + '" />' +
        '<div class="select"><span class="modify-type" style="color:#76838f">' + type + '<i></i></span><ul><li>车床</li><li>磨床</li><li>锐床</li></ul></div>' +
        '<input type="text" placeholder="负责人" class="modify-charger" style="display: block" value="' + person + '" />' +
        '<p class="error-msg"></p>' +
        '</div>';
      swal({
        title: "修改机床",
        text: _text,
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确认",
        closeOnConfirm: false,
        cancelButtonText: "取消"
      }, function() {
        var MachineName = $('.modify-machine-body .modify-name').val(),
          MachineCharger = $('.modify-machine-body .modify-charger').val(),
          MachineType = $('.modify-machine-body .modify-type').text();
        if (!MachineName) {
          $('.error-msg').text('请填写机床名称！').fadeIn();
          return;
        } else if (!MachineType) {
          $('.error-msg').text('请选择机床类型！').fadeIn();
          return;
        } else if (!MachineCharger) {
          $('.error-msg').text('请填写机床负责人！').fadeIn();
          return;
        }
        $.ajax({
          type: "post",
          url: "/api/machine/update",
          async: true,
          data: {
            Id: Id,
            MachineName: MachineName,
            MachineCharger: MachineCharger,
            MachineType: MachineType
          },
          success: function(data) {
            if (!data.status) {
              swal("成功!", "机床修改成功！", "success");
              MANAGE.getMachine();
            } else {
              swal("失败!", "机床修改失败！", "error");
            }
          },
          error: function(xhr) {
            swal("失败!", "机床修改失败！错误信息：" + xhr.status, "error");
          }
        });
      });
    },
    //修改刀具
    modifyTool: function() {
      var _td = $(this).parents('tr').find('td'),
        name = _td.eq(1).text(),
        type = _td.eq(2).text(),
        num = _td.eq(3).text(),
        Id = _td.eq(0).text();
      var _text = '<div class="add-tool-body">' +
        '<input type="text" placeholder="名称" class="add-name" style="display: block" value="' + name + '" />' +
        '<input type="text" placeholder="类型" class="add-type" style="display: block" value="' + type + '" />' +
        '<input type="text" placeholder="数量" class="add-num" style="display: block" value="' + num + '" />' +
        '<p class="error-msg"></p>' +
        '</div>';
      swal({
        title: "修改刀具",
        text: _text,
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确认",
        closeOnConfirm: false,
        cancelButtonText: "取消"
      }, function() {
        var ToolName = $('.add-tool-body .add-name').val(),
          ToolNum = $('.add-tool-body .add-num').val(),
          ToolType = $('.add-tool-body .add-type').val();
        if (!ToolName) {
          $('.error-msg').text('请填写刀具名称！').fadeIn();
          return;
        } else if (!ToolType) {
          $('.error-msg').text('请填写刀具类型！').fadeIn();
          return;
        } else if (!ToolNum) {
          $('.error-msg').text('请填写刀具数量！').fadeIn();
          return;
        }
        $.ajax({
          type: "post",
          url: "/api/tool/update",
          async: true,
          data: {
            Id: Id,
            ToolName: ToolName,
            ToolNum: ToolNum,
            ToolType: ToolType
          },
          success: function(data) {
            if (!data.status) {
              swal("成功!", "刀具修改成功！", "success");
              MANAGE.getTool();
            } else {
              swal("失败!", "刀具修改失败！", "error");
            }
          },
          error: function(xhr) {
            swal("失败!", "刀具修改失败！错误信息：" + xhr.status, "error");
          }
        });
      });
    },
    //获取机床列表
    getMachine: function() {
      var tab = $('.machine-box table tbody');
      var page = $(".page");
      page.pagination({
        ajax: {
          on: true,
          type: "post",
          url: "/api/machine/get",
          dataType: "json",
          param: {
            PageIndex: 1,
            PageSize: 10
          },
          ajaxStart: function() {
            $('.machine-box .manage-loading').show();
          },
          callback: function(data) {
            $('.machine-box .manage-loading').hide();
            var html = [];
            if (!data.status) {
              if (data.data.length > 0) {
                $(data.data).each(function(i, o) {
                  var _html = '<tr><td class="ft"><label for="m-' + o.Id + '"><input id="m-' + o.Id + '" type="checkbox" /></label></td><td>' + o.Id + '</td>' +
                    '<td>' + o.MachineName + '</td>' +
                    '<td>' + o.MachineType + '</td>' +
                    '<td>' + o.MachineCharger + '</td>' +
                    '<td align="center"><button class="edit">修改</button><button class="delete">删除</button></td>' +
                    '</tr>';
                  html.push(_html);
                })
              } else {
                html.push('<tr><td colspan="6" align="center">没有数据</td></tr>');
              }
            } else {
              var message = data.message ? data.message : '获取机床列表失败';
              html.push('<tr><td align="center">' + message + '</td></tr>');
            }
            $(tab).html(html.join(''));
          }
        }
      })
    },
    //获取刀具列表
    getTool: function() {
      var tab = $('.tool-box table tbody');
      var page = $(".page");
      page.pagination({
        ajax: {
          on: true,
          type: "post",
          url: "/api/tool/get",
          dataType: "json",
          param: {
            PageIndex: 1,
            PageSize: 10
          },
          ajaxStart: function() {
            $('.tool-box .manage-loading').show();
          },
          callback: function(data) {
            $('.tool-box .manage-loading').hide();
            var html = [];
            if (!data.status) {
              if (data.data.length > 0) {
                $(data.data).each(function(i, o) {
                  var _html = '<tr><td class="ft"><label for="m-' + o.Id + '"><input id="m-' + o.Id + '" type="checkbox" /></label></td><td>' + o.Id + '</td>' +
                    '<td>' + o.ToolName + '</td>' +
                    '<td>' + o.ToolType + '</td>' +
                    '<td>' + o.ToolNum + '</td>' +
                    '<td align="center"><button class="edit">修改</button><button class="delete">删除</button></td>' +
                    '</tr>';
                  html.push(_html);
                })
              } else {
                html.push('<tr><td align="center" colspan="5">没有数据</td></tr>');
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
  module.exports = MANAGE.init();
})
