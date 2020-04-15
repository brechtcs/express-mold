var Mold = require('mold-template')
var fs = require('fs')
var path = require('path')
var util = require('util')

module.exports = ExpressMold

/**
 * Extend Mold with Express engine support
 */
function ExpressMold (env) {
  Mold.call(this, env)
}

util.inherits(ExpressMold, Mold)

ExpressMold.prototype.engine = function (app, ext) {
  var mold = new DynamicMold(app, ext, this.env)
  for (var name in this.defs) {
    mold.defs[name] = this.defs[name]
  }

  return function (file, opts, cb) {
    var name = path.relative(mold.root, file)
    var view = mold.dispatch(name, opts)
    cb(null, view)
  }
}

/**
 * Extend Mold to load partials from disk
 */
function DynamicMold (app, ext, env) {
  Mold.call(this, env)
  this.enc = app.get('view encoding') || 'utf8'
  this.ext = ext[0] !== '.' ? '.' + ext : ext
  this.root = app.get('views')
}

util.inherits(DynamicMold, Mold)

DynamicMold.prototype.dispatch = function (name, arg) {
  var template = this.get(name) || this.read(name)
  return template(arg)
}

DynamicMold.prototype.get = function (name) {
  if (name in this.defs) {
    return this.defs[name]
  } else if (name + this.ext in this.defs) {
    return this.defs[name + this.ext]
  }
}

DynamicMold.prototype.read = function (name) {
  var file = path.join(this.root, name)
  if (!fs.existsSync(file)) file += this.ext

  try {
    var content = fs.readFileSync(file, this.enc)
    return this.bake(content)
  } catch (err) {
    throw new Error("Invalid template command: '" + name + "'.")
  }
}
