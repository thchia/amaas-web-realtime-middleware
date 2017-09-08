(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("amaas-web-realtime-middleware", [], factory);
	else if(typeof exports === 'object')
		exports["amaas-web-realtime-middleware"] = factory();
	else
		root["amaas-web-realtime-middleware"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var WS_CONNECT = exports.WS_CONNECT = '@@amaas-web-rt-mw/WS_CONNECT';
var WS_DISCONNECT = exports.WS_DISCONNECT = '@@amaas-web-rt-mw/WS_DISCONNECT';
var WS_RECEIVE_MSG = exports.WS_RECEIVE_MSG = '@@amaas-web-rt-mw/RECEIVE_MSG';
var WS_CONNECTED = exports.WS_CONNECTED = '@@amaas-web-rt-mw/CONNECTED';
var WS_CLOSED = exports.WS_CLOSED = '@@amaas-web-rt-mw/CLOSED';
var WS_ERROR = exports.WS_ERROR = '@@amaas-web-rt-mw/ERROR';

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.receiveMessage = exports.error = exports.disconnect = exports.connected = exports.connect = exports.closed = exports.WS_ERROR = exports.WS_CLOSED = exports.WS_CONNECTED = exports.WS_RECEIVE_MSG = exports.WS_DISCONNECT = exports.WS_CONNECT = undefined;

var _types = __webpack_require__(0);

var _actions = __webpack_require__(2);

var createMW = function createMW(Device) {
  // This needs to be an array for potential extra clients
  var ws = [];

  var initialiseWS = function initialiseWS(store, config) {
    var clientId = Date.now().toString();
    var conn = new Device(config);
    ws.push({ id: clientId, conn: conn, subCount: 0 });

    conn.on('connect', function () {
      store.dispatch((0, _actions.connected)());
      subscribe(store, config);
    });
    conn.on('close', function () {
      store.dispatch((0, _actions.closed)());
    });
    conn.on('error', function (error) {
      store.dispatch(error(error));
    });
    conn.on('message', function (topic, messageEnc) {
      var message = messageEnc.toString();
      store.dispatch((0, _actions.receiveMessage)(topic, message));
    });
  };

  var subscribe = function subscribe(store, config) {
    if (config.topics.length === 0) return;

    // Cannot subscribe to more than 50 topics in a single connection
    var topics = config.topics;

    var lastIndex = ws.length - 1;
    var lastConnLength = ws[lastIndex].subCount;
    var availableSubsInConn = 50 - lastConnLength;
    if (ws && ws.length > 0) {
      // First fill up the remaining subscriptions in the last connection
      topics.slice(0, availableSubsInConn).map(function (topic) {
        ws[lastIndex].conn.subscribe(topic);
      });
      ws[lastIndex].subCount = lastConnLength + topics.slice(0, availableSubsInConn).length;
      // If there are still subscriptions left over, initialise another connection
      if (topics.slice(availableSubsInConn - 1, 50).length > 0) {
        var remainingTopics = config.topics.slice(availableSubsInConn);
        config.topics = remainingTopics;
        initialiseWS(store, config);
      }
    } else {
      console.error('Cannot subscribe as there is no WS instance open');
    }
  };

  return function (store) {
    return function (next) {
      return function (action) {
        switch (action.type) {
          case _types.WS_CONNECT:
            var config = action.payload;
            initialiseWS(store, config);
            return next(action);
          case _types.WS_DISCONNECT:
            if (ws && ws.length > 0) {
              ws.map(function (connection) {
                connection.conn.end();
              });
              ws = [];
            }
            return next(action);
          default:
            return next(action);
        }
      };
    };
  };
};

exports.default = createMW;
exports.WS_CONNECT = _types.WS_CONNECT;
exports.WS_DISCONNECT = _types.WS_DISCONNECT;
exports.WS_RECEIVE_MSG = _types.WS_RECEIVE_MSG;
exports.WS_CONNECTED = _types.WS_CONNECTED;
exports.WS_CLOSED = _types.WS_CLOSED;
exports.WS_ERROR = _types.WS_ERROR;
exports.closed = _actions.closed;
exports.connect = _actions.connect;
exports.connected = _actions.connected;
exports.disconnect = _actions.disconnect;
exports.error = _actions.error;
exports.receiveMessage = _actions.receiveMessage;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disconnect = exports.error = exports.closed = exports.connected = exports.receiveMessage = exports.connect = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _types = __webpack_require__(0);

var types = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var connect = exports.connect = function connect(config) {
  return {
    type: types.WS_CONNECT,
    payload: _extends({}, config)
  };
};

var receiveMessage = exports.receiveMessage = function receiveMessage(topic, message) {
  return {
    type: types.WS_RECEIVE_MSG,
    payload: { topic: topic, message: message }
  };
};

var connected = exports.connected = function connected() {
  return {
    type: types.WS_RECEIVE_MSG
  };
};

var closed = exports.closed = function closed() {
  return {
    type: types.WS_CLOSED
  };
};

var error = exports.error = function error(_error) {
  return {
    type: types.WS_ERROR,
    payload: { error: _error }
  };
};

var disconnect = exports.disconnect = function disconnect() {
  return {
    type: types.WS_DISCONNECT
  };
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=amaas-web-realtime-middleware.js.map