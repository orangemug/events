
/**
 * Event
 *
 * A super lightweight
 * event emitter library.
 *
 * @version 0.3.0
 * @author Wilson Page <wilson.page@me.com>
 */

;(function() {

/**
 * Locals
 */

var proto = Events.prototype;
var slice = [].slice;

/**
 * Creates a new event emitter
 * instance, or if passed an
 * object, mixes the event logic
 * into it.
 *
 * @param  {Object} obj
 * @return {Object}
 */
function Events(obj) {
  if (!(this instanceof Events)) return new Events(obj);
  if (obj) return mixin(obj, proto);
}

/**
 * Registers a callback
 * with an event name.
 *
 * @param  {String}   name
 * @param  {Function} cb
 * @return {Event}
 */
proto.on = function(name, cb) {
  this._cbs = this._cbs || {};
  (this._cbs[name] || (this._cbs[name] = [])).push(cb);
  return this;
};

/**
 * Removes a single callback,
 * or all callbacks associated
 * with the passed event name.
 *
 * @param  {String}   name
 * @param  {Function} cb
 * @return {Event}
 */
proto.off = function(name, cb) {
  this._cbs = this._cbs || {};

  if (!name) return this._cbs = {};
  if (!cb) return delete this._cbs[name];

  var cbs = this._cbs[name] || [];
  var i;

  while (cbs && ~(i = cbs.indexOf(cb))) cbs.splice(i, 1);
  return this;
};

/**
 * Fires an event, triggering
 * all callbacks registered on this
 * event name.
 *
 * This lookes a little more
 * complicated than it may need
 * to be. This is to ensure callback
 * lists can be mutable during flush,
 * without skipping any jobs.
 *
 * We take the list of callbacks
 * and remove, call then push onto
 * the run list. When there are no
 * more callbacks left, we replace
 * the original list with the run
 * list once all jobs are done.
 *
 * @param  {String} name
 * @return {Event}
 */
proto.fire = function(options) {
  this._cbs = this._cbs || {};
	var ret;
  var name = options.name || options;
  var ctx = options.ctx || this;
  var cbs = this._cbs[name];

  if (cbs) {
    var args = slice.call(arguments, 1);
    var run = [];
    var cb;

    while (cbs.length) {
      cb = cbs.shift();
      ret = cb.apply(ctx, args);
			if(ret === false) {
				break;
			}
      run.push(cb);
    }

    this._cbs[name] = run;
  }

  return this;
};

/**
 * Util
 */

/**
 * Mixes in the properties
 * of the second object into
 * the first.
 *
 * @param  {Object} a
 * @param  {Object} b
 * @return {Object}
 */
function mixin(a, b) {
  for (var key in b) a[key] = b[key];
  return a;
}

/**
 * Expose 'Event' (UMD)
 */

if (typeof exports === "object") {
  module.exports = Events;
} else if (typeof define === "function" && define.amd) {
  define(function(){ return Events; });
} else {
  window['events'] = Events;
}

})();
