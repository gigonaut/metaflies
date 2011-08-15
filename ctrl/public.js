var PubCtrl = {};

PubCtrl.index = function(req, res) {
	res.render('public/index', {
    title: 'Express'
  });
}

module.exports = PubCtrl;