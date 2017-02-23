var browserSupportsLogStyles = require('browser-supports-log-styles')

function style (string) {
  return '%c' + string + '%c'
}

function colorify (color, text, action, meta) {
  text = '%cLogux:%c ' + text
  if (!color) text = text.replace(/%c/g, '')

  var args = [text]
  var i

  if (color) {
    var styles = text.match(/%c[^%]+%c/g)
    for (i = 0; i < styles.length; i++) {
      if (i === 0) {
        args.push('color: #ffa200')
      } else {
        args.push('font-weight: bold')
      }
      args.push('')
    }
  }

  if (action && meta) {
    args.push(action)
    args.push(meta)
  }

  return args
}

/**
 * Display Logux events in browser console.
 *
 * @param {Syncable|Client} client Observed Client instance
 *                                 or object with `sync` property.
 * @param {object} [messages] Disable specific message types.
 * @param {boolean} [messages.state] Disable state messages.
 * @param {boolean} [messages.error] Disable error messages.
 * @param {boolean} [messages.add] Disable add messages.
 * @param {boolean} [messages.clean] Disable clean messages.
 * @param {boolean} [messages.color] Disable colors in logs.
 *
 * @return {Function} Unbind log listener.
 *
 * @example
 * import log from 'logux-status/log'
 * log(client, { add: false })
 */
function log (client, messages) {
  if (!messages) messages = { }
  var sync = client.sync

  var color = messages.color !== false && browserSupportsLogStyles()

  function showLog (text, action, meta) {
    console.log.apply(console, colorify(color, text, action, meta))
  }

  function showError (error) {
    var text = 'error: ' + error.description
    if (error.received) text = 'server sent ' + text
    console.error.apply(console, colorify(color, text))
  }

  function showServerStacktrace (stack) {
    var text = 'server sent error:\n' + stack
    console.error.apply(console, colorify(color, text))
  }

  var unbind = []
  var prevConnected = false

  if (messages.state !== false) {
    unbind.push(sync.on('state', function () {
      var postfix = ''

      if (sync.state === 'connecting' && sync.connection.url) {
        postfix = '. ' + style(sync.localNodeId) + ' is connecting to ' +
                  style(sync.connection.url) + '.'
      }

      if (sync.connected && !prevConnected) {
        postfix = '. Client was connected to ' + style(sync.remoteNodeId) + '.'
        prevConnected = true
      } else if (!sync.connected) {
        prevConnected = false
      }

      showLog('state was changed to ' + style(sync.state) + postfix)
    }))
  }

  if (messages.error !== false) {
    unbind.push(sync.on('error', function (error) {
      showError(error)
    }))
    unbind.push(sync.on('clientError', function (error) {
      showError(error)
    }))
    unbind.push(sync.on('debug', function (type, stack) {
      if (type === 'error') {
        showServerStacktrace(stack)
      }
    }))
  }

  if (messages.add !== false) {
    unbind.push(sync.log.on('add', function (action, meta) {
      var message = 'action ' + style(action.type) + ' was added'
      if (meta.id[1] !== sync.localNodeId) {
        message += ' by ' + style(meta.id[1])
      }
      showLog(message, action, meta)
    }))
  }

  if (messages.clean !== false) {
    unbind.push(sync.log.on('clean', function (action, meta) {
      var message = 'action ' + style(action.type) + ' was cleaned'
      showLog(message, action, meta)
    }))
  }

  return function () {
    for (var i = 0; i < unbind.length; i++) {
      unbind[i]()
    }
  }
}

module.exports = log
