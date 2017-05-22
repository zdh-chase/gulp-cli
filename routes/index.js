
/* GET home page. */
module.exports = function(app) {
  app.get('/', function (req, res) {
    res.render('login', { title: '系统登陆' });
  });
  app.get('/login', function (req, res) {
    res.render('login', { title: '系统登陆' });
  });
  app.get('/manage', function (req, res) {
    res.render('manage', { title: '管理员界面', css : '/scss/manage.css', js : 'manage' });
  });
  app.get('/user', function (req, res) {
    res.render('user', { title: '用户界面', css : '/scss/user.css',js : 'user' });
  });
};
