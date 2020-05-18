import wx from './wx';
import {isObject} from "./util";
function toArray(iterable, start, end) {
	if (!iterable || !iterable.length) {
		return [];
	}

	if (typeof iterable === 'string') {
		iterable = iterable.split('');
	}

	return Array.prototype.slice.call(iterable, start || 0, end || iterable.length);
}


class Event{
	constructor(observable, name) {
		this.name = name;
		this.observable = observable;
		this.listeners = [];
	}
	
	addListener(fn, scope, options) {
		var me = this, listener;
		scope = scope || me.observable;

		if (!me.isListening(fn, scope)) {
			listener = me.createListener(fn, scope, options);
			if (me.firing) {
				// if we are currently firing this event, don't disturb the
				// listener loop
				me.listeners = me.listeners.slice(0);
			}
			if(!options.first)
				me.listeners.push(listener);
			else me.listeners.splice(0,0,listener);
		}
	}
	
	/**
	 * @private
	 */
	createListener(fn, scope, o) {
		o = o || {};
		scope = scope || this.observable;

		var listener = {
			fn : fn,
			scope : scope,
			o : o,
			ev : this
		}, handler = fn;

		listener.fireFn = handler;
		return listener;
	}

	findListener(fn, scope) {
		var listeners = this.listeners, i = listeners.length, listener, s;

		while (i--) {
			listener = listeners[i];
			if (listener) {
				s = listener.scope;
				if (listener.fn == fn && (s == scope || s == this.observable)) {
					return i;
				}
			}
		}

		return -1;
	}
	
	isListening(fn, scope) {
		return this.findListener(fn, scope) !== -1;
	}
	
	/**
	 * 
	 */
	removeListener(fn, scope) {
		var me = this, index, listener, k;
		index = me.findListener(fn, scope);
		if (index != -1) {
			listener = me.listeners[index];

			if (me.firing) {
				me.listeners = me.listeners.slice(0);
			}

			// cancel and remove a buffered handler that hasn't fired yet
			if (listener.task) {
				listener.task.cancel();
				delete listener.task;
			}

			// cancel and remove all delayed handlers that haven't fired yet
			k = listener.tasks && listener.tasks.length;
			if (k) {
				while (k--) {
					listener.tasks[k].cancel();
				}
				delete listener.tasks;
			}

			// remove this listener from the listeners array
			me.listeners.splice(index, 1);
			return true;
		}

		return false;
	}
	
	// Iterate to stop any buffered/delayed events
	clearListeners() {
		var listeners = this.listeners, i = listeners.length;

		while (i--) {
			this.removeListener(listeners[i].fn, listeners[i].scope);
		}
	}

	fire() {
		var me = this, listeners = me.listeners, count = listeners.length, i, args, listener;

		if (count > 0) {
			me.firing = true;
			for (i = 0; i < count; i++) {
				listener = listeners[i];
				args = arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
				if (listener.o) {
					args.push(listener.o);
				}
				if (listener && listener.fireFn.apply(listener.scope || me.observable, args) === false) {
					return (me.firing = false);
				}
			}
		}
		me.firing = false;
		return true;
	}
}

export default class Eventable{
	constructor() {
		this.events = this.events || {};
		if (this.listeners) {
			this.on(this.listeners);
			delete this.listeners;
		}
	}
	
	on(ename, fn, scope, options) {
		var me = this, config, event;

		if (typeof ename !== 'string') {
			options = ename;
			for (ename in options) {
				if (options.hasOwnProperty(ename)) {
					config = options[ename];
					me.on(ename, config.fn || config, config.scope || options.scope, config.fn ? config : options);
				}
			}
		} else {
			ename = ename.toLowerCase();
			me.events[ename] = me.events[ename] || true;
			event = me.events[ename];
			if (typeof event === 'boolean') {
				me.events[ename] = event = new Event(this, ename);
			}
			event.addListener(fn, scope, isObject(options) ? options : {});
		}
	}

	off() {
		this.un.apply(this, arguments);
	}
	
	un(ename, fn, scope) {
		var me = this, config, event, options;

		if (typeof ename !== 'string') {
			options = ename;
			for (ename in options) {
				if (options.hasOwnProperty(ename)) {
					config = options[ename];
					me.un(ename, config.fn || config, config.scope || options.scope);
				}
			}
		} else {
			ename = ename.toLowerCase();
			event = me.events[ename];
			if (event) {
				if(typeof fn !== 'undefined'){
					event.removeListener(fn, scope);
				}else{
					event.clearListeners();	
				}
				
			}
		}
	}
	clearListener(key) {
		if(key){
			key = key.toLowerCase();
			var event = this.events[key];
			event && event.clearListeners();
		}
	}
	clearListeners() {
		var events = this.events, event, key;

		for (key in events) {
			if (events.hasOwnProperty(key)) {
				event = events[key];
				event.clearListeners();
			}
		}
	}
	fireEvent() {
		var me = this, args = toArray(arguments), ename = args[0].toLowerCase(), ret = true, event = me.events[ename];

		if (event && event !== true) {
			args.shift();
			ret = event.fire.apply(event, args);
		}
		return ret;
	}
	hasListener(ename) {
		var event = this.events[ename.toLowerCase()];
		return event && event.listeners.length > 0;
	}
}

Eventable.isEventable = true;
