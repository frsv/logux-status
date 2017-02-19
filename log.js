var browserSupportsLogStyles = require('browser-supports-log-styles')

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

  var unbind = []
  var prevConnected = false
  var colorsEnabled = true
  var stylePrefix = '%c'
  var boldStyle = 'font-weight: bold'

  if (messages.color === false || !browserSupportsLogStyles()) {
    colorsEnabled = false
    boldStyle = ''
    stylePrefix = ''
  }

  if (messages.state !== false) {
    unbind.push(sync.on('state', function () {
      var needAdditionalStyles = true
      var postfix = ''
      var nodeIdString = ''
      var syncStateString = stylePrefix + sync.state + stylePrefix

      if (sync.state === 'connecting' && sync.connection.url) {
        nodeIdString = stylePrefix + sync.localNodeId + stylePrefix
        postfix = '. ' + nodeIdString + ' is connecting to ' +
                  sync.connection.url + '.'
      }

      if (sync.connected && !prevConnected) {
        nodeIdString = stylePrefix + sync.remoteNodeId + stylePrefix
        postfix = '. Client was connected to ' + nodeIdString + '.'
        prevConnected = true
      } else if (!sync.connected) {
        prevConnected = false
        if (!postfix) needAdditionalStyles = false
      }

      showMessage(
          'log',
          'change state to ' + syncStateString + postfix,
          boldStyle, '', needAdditionalStyles ? boldStyle : '', ''
      )
    }))
  }

  if (messages.error !== false) {
    unbind.push(sync.on('error', function (error) {
      showError(error)
    }))
    unbind.push(sync.on('clientError', function (error) {
      showError(error)
    }))
  }

  if (messages.add !== false) {
    unbind.push(sync.log.on('add', function (action, meta) {
      var message
      var actionTypeString = stylePrefix + action.type + stylePrefix
      var needAdditionalStyles = true
      if (meta.id[1] === sync.localNodeId) {
        message = 'Action ' + actionTypeString + ' was added to Logux'
        needAdditionalStyles = false
      } else {
        var metaString = stylePrefix + meta.id[1] + stylePrefix
        message = metaString + ' added action ' + actionTypeString + ' to Logux'
      }

      showMessage(
          'log', message,
          boldStyle, '',
          needAdditionalStyles ? boldStyle : '', '',
          action, meta
      )
    }))
  }

  if (messages.clean !== false) {
    unbind.push(sync.log.on('clean', function (action, meta) {
      var actionTypeString = stylePrefix + action.type + stylePrefix
      showMessage(
        'log',
        'Action ' + actionTypeString + ' was cleaned from Logux',
        boldStyle, '', action, meta
      )
    }))
  }

  function showMessage (type) {
    var args = Array.prototype.slice.call(arguments, 1)

    if (colorsEnabled) {
      args[0] = '%cLogux:%c ' + args[0]
      args.splice(1, 0, 'color: #ffa200')
      args.splice(2, 0, '')
    } else {
      args[0] = 'Logux: ' + args[0]
    }

    console[type].apply(console, args)
  }

  function showError (error) {
    var message = ''
    if (error.received) message += 'server sent '
    message += 'error: ' + error.description
    showMessage('error', message)
  }

  return function () {
    for (var i = 0; i < unbind.length; i++) {
      unbind[i]()
    }
  }
}

module.exports = log
