# Logux Status

<img align="right" width="95" height="95" title="Logux logo"
     src="https://cdn.rawgit.com/logux/logux/master/logo.svg">

UX best practices to report Logux synchronization status to user.

```js
var Client = require('logux-client/client')
var client = new Client({ … })

var attention = require('logux-status/attention')
var confirm = require('logux-status/confirm')
var favicon = require('logux-status/favicon')
var log = require('logux-status/log')

attention(client)
confirm(client, i18n.t('loguxWarn'))
favicon(client, {
  normal: '/favicon.ico',
  offline: '/offline.ico',
  error: '/error.ico'
})
log(client)
```

<a href="https://evilmartians.com/?utm_source=logux-status">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## `attention`

Highlight tab on synchronization error to notify user.

```js
var attention = require('logux-status/attention')
attention(client)
```

User could switch current tab in the middle of synchronization process.
So error could be returned from server when website is in background tab.

User expect correct synchronization until we told about a error.
So good UX must notify user, return her/him to website tab and show error.

It will add `*` to tab title on `error` event. Because of changed title,
browser will highlight tab until user will open it.

It returns a function to disable itself.

```js
var unbind = attention(client)
function disableLogux() {
  unbind()
}
```


## `confirm`

Show confirm popup, when user close tab with non-synchronized actions.

```js
var confirm = require('logux-status/confirm')
confirm(client)
```

User could close app tab in offline or in the middle of synchronization process.
So good UX must notify user and request confirmation to close the tab.

Use optional second argument to specify a text of warning.

```js
confirm(client, 'Post does not saved to server. Are you sure to leave?')
```

It returns a function to disable itself.

```js
var unbind = confirm(client)
function disableLogux() {
  unbind()
}
```


## `favicon`

Change favicon to show synchronization status.

```js
var favicon = require('logux-status/favicon')
favicon(client, {
  normal: '/favicon.ico',
  offline: '/offline.ico',
  error: '/error.ico'
})
```

User should always be sure, that she/he have latest updates.
If pages goes offline, we must notify user, that data could be outdated.
By using favicon we could notify user even if user is in other tab.

Use second argument to specify favicon links. You can miss any icon:

```js
favicon(client, {
  normal: '/your_default_link.ico',
  error: '/your_error_link.ico'
})
```

Recommendations for favicon versions:

- For `offline` you could make a black-and-white version
  and make it a little lighter.
- For `error` you could put a red dot to favicon.

It returns a function to disable itself.

```js
var unbind = favicon(client, favicons)
function disableLogux() {
  unbind()
}
```


## `log`

Display Logux events in browser console.

```js
var log = require('logux-status/log')
log(client)
```

This feature will be useful for application developer to understand
Logux life cycle and debug errors.

In second argument you can disable some message types.
Possible types are: `state`, `error`, `add`, `clean`.

```js
log(client, { add: false })
```

Logux events in browser console are colorized by default, if console styling is supported by browser.
To disable this feature, set `color` to false in the second argument.

```js
log(client, { color: false })
```

It return a function to disable itself.

```js
var unbind = log(client)
function disableLogux() {
  unbind()
}
```
