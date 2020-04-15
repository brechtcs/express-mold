var { join } = require('path')
var Mold = require('../')
var express = require('express')

var server = express()
var mold = new Mold()

mold.defs.json = function (data) {
  return '<pre>' + JSON.stringify(data, null, 2) + '</pre>'
}

server.set('views', join(__dirname, './views'))
server.set('view engine', 'html')
server.engine('html', mold.engine(server, 'html'))

server.get('/', function (req, res) {
  res.render('home')
})

server.get('/stuff', function (req, res) {
  res.render('stuff', { params: req.query })
})

server.listen(9080)
