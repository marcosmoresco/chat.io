debounce = (fn, id, delay, args, that) ->

  $delay = delay || 1000
  that = that || this
  args = args || new Array

  k$.debounceQueue = id if k$.debounceQueue == null
  clearTimeout k$.debounceTimer if id == k$.debounceQueue
  k$.debounceTimer = setTimeout ->
    fn.apply(that, args)
    k$.debounceQueue = null
  , $delay

k$.debounce = debounce

module.exports = debounce
