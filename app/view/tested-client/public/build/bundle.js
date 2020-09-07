
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function loader (urls, test, callback) {
      let remaining = urls.length;

      function maybeCallback () {
        remaining = --remaining;
        if (remaining < 1) {
          callback();
        }
      }

      if (!test()) {
        urls.forEach(({ type, url, options = { async: true, defer: true }}) => {
          const isScript = type === 'script';
          const tag = document.createElement(isScript ? 'script': 'link');
          if (isScript) {
            tag.src = url;
            tag.async = options.async;
            tag.defer = options.defer;
          } else {
            tag.rel = 'stylesheet';
    		    tag.href = url;
          }
          tag.onload = maybeCallback;
          document.body.appendChild(tag);
        });
      } else {
        callback();
      }
    }

    const contextKey = {};

    function reusify (Constructor) {
      var head = new Constructor();
      var tail = head;

      function get () {
        var current = head;

        if (current.next) {
          head = current.next;
        } else {
          head = new Constructor();
          tail = head;
        }

        current.next = null;

        return current
      }

      function release (obj) {
        tail.next = obj;
        tail = obj;
      }

      return {
        get: get,
        release: release
      }
    }

    var reusify_1 = reusify;

    function fastqueue (context, worker, concurrency) {
      if (typeof context === 'function') {
        concurrency = worker;
        worker = context;
        context = null;
      }

      var cache = reusify_1(Task);
      var queueHead = null;
      var queueTail = null;
      var _running = 0;

      var self = {
        push: push,
        drain: noop$1,
        saturated: noop$1,
        pause: pause,
        paused: false,
        concurrency: concurrency,
        running: running,
        resume: resume,
        idle: idle,
        length: length,
        getQueue: getQueue,
        unshift: unshift,
        empty: noop$1,
        kill: kill,
        killAndDrain: killAndDrain
      };

      return self

      function running () {
        return _running
      }

      function pause () {
        self.paused = true;
      }

      function length () {
        var current = queueHead;
        var counter = 0;

        while (current) {
          current = current.next;
          counter++;
        }

        return counter
      }

      function getQueue () {
        var current = queueHead;
        var tasks = [];

        while (current) {
          tasks.push(current.value);
          current = current.next;
        }

        return tasks
      }

      function resume () {
        if (!self.paused) return
        self.paused = false;
        for (var i = 0; i < self.concurrency; i++) {
          _running++;
          release();
        }
      }

      function idle () {
        return _running === 0 && self.length() === 0
      }

      function push (value, done) {
        var current = cache.get();

        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop$1;

        if (_running === self.concurrency || self.paused) {
          if (queueTail) {
            queueTail.next = current;
            queueTail = current;
          } else {
            queueHead = current;
            queueTail = current;
            self.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }

      function unshift (value, done) {
        var current = cache.get();

        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop$1;

        if (_running === self.concurrency || self.paused) {
          if (queueHead) {
            current.next = queueHead;
            queueHead = current;
          } else {
            queueHead = current;
            queueTail = current;
            self.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }

      function release (holder) {
        if (holder) {
          cache.release(holder);
        }
        var next = queueHead;
        if (next) {
          if (!self.paused) {
            if (queueTail === queueHead) {
              queueTail = null;
            }
            queueHead = next.next;
            next.next = null;
            worker.call(context, next.value, next.worked);
            if (queueTail === null) {
              self.empty();
            }
          } else {
            _running--;
          }
        } else if (--_running === 0) {
          self.drain();
        }
      }

      function kill () {
        queueHead = null;
        queueTail = null;
        self.drain = noop$1;
      }

      function killAndDrain () {
        queueHead = null;
        queueTail = null;
        self.drain();
        self.drain = noop$1;
      }
    }

    function noop$1 () {}

    function Task () {
      this.value = null;
      this.callback = noop$1;
      this.next = null;
      this.release = noop$1;
      this.context = null;

      var self = this;

      this.worked = function worked (err, result) {
        var callback = self.callback;
        self.value = null;
        self.callback = noop$1;
        callback.call(self.context, err, result);
        self.release(self);
      };
    }

    var queue = fastqueue;

    class EventQueue {
      constructor (worker) {
        this.queue = new queue(this, worker, 1);
        this.queue.pause();
      }

      send (command, params = []) {
        this.queue.push([ command, params ]);
      }

      start () {
        this.queue.resume();
      }

      stop () {
        this.queue.kill();
      }
    }

    /* node_modules/@beyonk/svelte-mapbox/src/Map.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1 } = globals;
    const file = "node_modules/@beyonk/svelte-mapbox/src/Map.svelte";

    // (2:2) {#if map}
    function create_if_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(2:2) {#if map}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let current;
    	let if_block = /*map*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-1kuj9kb");
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[14](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*map*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*map*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[14](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	setContext(contextKey, {
    		getMap: () => map,
    		getMapbox: () => mapbox
    	});

    	const dispatch = createEventDispatcher();
    	let { map = null } = $$props;
    	let { version = "v1.11.0" } = $$props;
    	let container;
    	let mapbox;
    	let queue;
    	let { options = {} } = $$props;
    	let { accessToken } = $$props;
    	let { style = "mapbox://styles/mapbox/streets-v11" } = $$props;

    	function setCenter(center, zoom) {
    		queue.send("setCenter", [center]);

    		if (zoom && Number.isInteger(zoom)) {
    			queue.send("setZoom", [zoom]);
    		}
    	}

    	function fitBounds(bbox) {
    		queue.send("fitBounds", [bbox]);
    	}

    	function flyTo(destination) {
    		queue.send("flyTo", [destination]);
    	}

    	function resize() {
    		queue.send("resize");
    	}

    	function getMap() {
    		return map;
    	}

    	function getMapbox() {
    		return mapbox;
    	}

    	function onAvailable() {
    		window.mapboxgl.accessToken = accessToken;
    		mapbox = window.mapboxgl;
    		const optionsWithDefaults = Object.assign({ container, style }, options);
    		const el = new mapbox.Map(optionsWithDefaults);
    		el.on("dragend", () => dispatch("recentre", { center: el.getCenter() }));

    		el.on("load", () => {
    			$$invalidate(0, map = el);
    			queue.start();
    			dispatch("ready");
    		});
    	}

    	function worker(cmd, cb) {
    		const [command, params] = cmd;
    		map[command].apply(map, params);
    		cb(null);
    	}

    	onMount(async () => {
    		queue = new EventQueue(worker);

    		loader(
    			[
    				{
    					type: "script",
    					url: `//api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.js`
    				},
    				{
    					type: "style",
    					url: `//api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.css`
    				}
    			],
    			() => !!window.mapboxgl,
    			onAvailable
    		);

    		return () => {
    			queue.stop();
    			map.remove();
    		};
    	});

    	const writable_props = ["map", "version", "options", "accessToken", "style"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Map", $$slots, ['default']);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("map" in $$props) $$invalidate(0, map = $$props.map);
    		if ("version" in $$props) $$invalidate(2, version = $$props.version);
    		if ("options" in $$props) $$invalidate(3, options = $$props.options);
    		if ("accessToken" in $$props) $$invalidate(4, accessToken = $$props.accessToken);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		loader,
    		onMount,
    		createEventDispatcher,
    		setContext,
    		contextKey,
    		EventQueue,
    		dispatch,
    		map,
    		version,
    		container,
    		mapbox,
    		queue,
    		options,
    		accessToken,
    		style,
    		setCenter,
    		fitBounds,
    		flyTo,
    		resize,
    		getMap,
    		getMapbox,
    		onAvailable,
    		worker
    	});

    	$$self.$inject_state = $$props => {
    		if ("map" in $$props) $$invalidate(0, map = $$props.map);
    		if ("version" in $$props) $$invalidate(2, version = $$props.version);
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    		if ("mapbox" in $$props) mapbox = $$props.mapbox;
    		if ("queue" in $$props) queue = $$props.queue;
    		if ("options" in $$props) $$invalidate(3, options = $$props.options);
    		if ("accessToken" in $$props) $$invalidate(4, accessToken = $$props.accessToken);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		map,
    		container,
    		version,
    		options,
    		accessToken,
    		style,
    		setCenter,
    		fitBounds,
    		flyTo,
    		resize,
    		getMap,
    		getMapbox,
    		$$scope,
    		$$slots,
    		div_binding
    	];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			map: 0,
    			version: 2,
    			options: 3,
    			accessToken: 4,
    			style: 5,
    			setCenter: 6,
    			fitBounds: 7,
    			flyTo: 8,
    			resize: 9,
    			getMap: 10,
    			getMapbox: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accessToken*/ ctx[4] === undefined && !("accessToken" in props)) {
    			console.warn("<Map> was created without expected prop 'accessToken'");
    		}
    	}

    	get map() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set map(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get version() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accessToken() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accessToken(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setCenter() {
    		return this.$$.ctx[6];
    	}

    	set setCenter(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fitBounds() {
    		return this.$$.ctx[7];
    	}

    	set fitBounds(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flyTo() {
    		return this.$$.ctx[8];
    	}

    	set flyTo(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resize() {
    		return this.$$.ctx[9];
    	}

    	set resize(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMap() {
    		return this.$$.ctx[10];
    	}

    	set getMap(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMapbox() {
    		return this.$$.ctx[11];
    	}

    	set getMapbox(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@beyonk/svelte-mapbox/src/Geocoder.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1$1 } = globals;
    const file$1 = "node_modules/@beyonk/svelte-mapbox/src/Geocoder.svelte";

    function create_fragment$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", /*fieldId*/ ctx[1]);
    			attr_dev(div, "class", "svelte-1k1b3t4");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[9](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	const fieldId = "bsm-" + Math.random().toString(36).substring(6);
    	let { accessToken } = $$props;
    	let { options = {} } = $$props;
    	let { version = "v4.5.1" } = $$props;

    	let { types = [
    		"country",
    		"region",
    		"postcode",
    		"district",
    		"place",
    		"locality",
    		"neighborhood",
    		"address"
    	] } = $$props;

    	let { placeholder = "Search" } = $$props;
    	let { value = null } = $$props;
    	let { geocoder = null } = $$props;
    	let container;
    	let ready = false;
    	const onResult = p => dispatch("result", p);
    	const onResults = p => dispatch("results", p);
    	const onError = p => dispatch("error", p);
    	const onLoading = p => dispatch("loading", p);
    	const onClear = p => dispatch("clear", p);

    	onMount(() => {
    		loader(
    			[
    				{
    					type: "script",
    					url: `//api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/${version}/mapbox-gl-geocoder.min.js`
    				},
    				{
    					type: "style",
    					url: `//api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/${version}/mapbox-gl-geocoder.css`
    				}
    			],
    			() => !!window.MapboxGeocoder,
    			onAvailable
    		);

    		return () => {
    			geocoder.off("results", onResults).off("result", onResult).off("loading", onLoading).off("error", onError).off("clear", onClear);
    		};
    	});

    	function onAvailable() {
    		const optionsWithDefaults = Object.assign(
    			{
    				accessToken,
    				types: types.join(","),
    				placeholder
    			},
    			options
    		);

    		$$invalidate(2, geocoder = new window.MapboxGeocoder(optionsWithDefaults));
    		geocoder.addTo(`#${fieldId}`);
    		geocoder.on("results", onResults).on("result", onResult).on("loading", onLoading).on("error", onError).on("clear", onClear);
    		geocoder.setInput(value);
    		$$invalidate(10, ready = true);
    		dispatch("ready");
    	}

    	const writable_props = [
    		"accessToken",
    		"options",
    		"version",
    		"types",
    		"placeholder",
    		"value",
    		"geocoder"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Geocoder> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Geocoder", $$slots, []);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("accessToken" in $$props) $$invalidate(3, accessToken = $$props.accessToken);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("version" in $$props) $$invalidate(5, version = $$props.version);
    		if ("types" in $$props) $$invalidate(6, types = $$props.types);
    		if ("placeholder" in $$props) $$invalidate(7, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("geocoder" in $$props) $$invalidate(2, geocoder = $$props.geocoder);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		loader,
    		dispatch,
    		fieldId,
    		accessToken,
    		options,
    		version,
    		types,
    		placeholder,
    		value,
    		geocoder,
    		container,
    		ready,
    		onResult,
    		onResults,
    		onError,
    		onLoading,
    		onClear,
    		onAvailable
    	});

    	$$self.$inject_state = $$props => {
    		if ("accessToken" in $$props) $$invalidate(3, accessToken = $$props.accessToken);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("version" in $$props) $$invalidate(5, version = $$props.version);
    		if ("types" in $$props) $$invalidate(6, types = $$props.types);
    		if ("placeholder" in $$props) $$invalidate(7, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("geocoder" in $$props) $$invalidate(2, geocoder = $$props.geocoder);
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("ready" in $$props) $$invalidate(10, ready = $$props.ready);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ready, value, geocoder*/ 1284) {
    			 ready && value && geocoder.setInput(value);
    		}
    	};

    	return [
    		container,
    		fieldId,
    		geocoder,
    		accessToken,
    		options,
    		version,
    		types,
    		placeholder,
    		value,
    		div_binding
    	];
    }

    class Geocoder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			accessToken: 3,
    			options: 4,
    			version: 5,
    			types: 6,
    			placeholder: 7,
    			value: 8,
    			geocoder: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Geocoder",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accessToken*/ ctx[3] === undefined && !("accessToken" in props)) {
    			console.warn("<Geocoder> was created without expected prop 'accessToken'");
    		}
    	}

    	get accessToken() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accessToken(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get version() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get types() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set types(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get geocoder() {
    		throw new Error("<Geocoder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set geocoder(value) {
    		throw new Error("<Geocoder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createDispatchers (target, dispatch, events) {
      const dispatchers = events.map(name => {
        const dispatcher = data => dispatch(name, data);
        target.on(name, dispatcher);
        return { name, dispatcher }
      });

      return () => {
        dispatchers.forEach(({ name, dispatcher }) => target.off(name, dispatcher));
      }
    }

    /* node_modules/@beyonk/svelte-mapbox/src/controls/GeolocateControl.svelte generated by Svelte v3.24.1 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();
    	let { position = "top-left" } = $$props;
    	let { options = {} } = $$props;

    	const events = [
    		"error",
    		"geolocate",
    		"outofmaxbounds",
    		"trackuserlocationend",
    		"trackuserlocationstart"
    	];

    	const geolocate = new mapbox.GeolocateControl(options);
    	map.addControl(geolocate, position);
    	const destroyDispatchers = createDispatchers(geolocate, dispatch, events);
    	onDestroy(destroyDispatchers);

    	function trigger() {
    		geolocate.trigger();
    	}

    	const writable_props = ["position", "options"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GeolocateControl> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GeolocateControl", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		createEventDispatcher,
    		contextKey,
    		createDispatchers,
    		dispatch,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		position,
    		options,
    		events,
    		geolocate,
    		destroyDispatchers,
    		trigger
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [position, options, trigger];
    }

    class GeolocateControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { position: 0, options: 1, trigger: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GeolocateControl",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get position() {
    		throw new Error("<GeolocateControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<GeolocateControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<GeolocateControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<GeolocateControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trigger() {
    		return this.$$.ctx[2];
    	}

    	set trigger(value) {
    		throw new Error("<GeolocateControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@beyonk/svelte-mapbox/src/controls/NavigationControl.svelte generated by Svelte v3.24.1 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();
    	let { position = "top-right" } = $$props;
    	let { options = {} } = $$props;
    	const nav = new mapbox.NavigationControl(options);
    	map.addControl(nav, position);
    	const writable_props = ["position", "options"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavigationControl> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NavigationControl", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		contextKey,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		position,
    		options,
    		nav
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [position, options];
    }

    class NavigationControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { position: 0, options: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationControl",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get position() {
    		throw new Error("<NavigationControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<NavigationControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<NavigationControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<NavigationControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@beyonk/svelte-mapbox/src/controls/ScaleControl.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1$2 } = globals;

    function create_fragment$4(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();
    	let { position = "bottom-right" } = $$props;
    	let { options = {} } = $$props;
    	const optionsWithDefaults = Object.assign({ maxWidth: 80, unit: "metric" }, options);
    	const scale = new mapbox.ScaleControl(optionsWithDefaults);
    	map.addControl(scale, position);
    	const writable_props = ["position", "options"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScaleControl> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ScaleControl", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		contextKey,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		position,
    		options,
    		optionsWithDefaults,
    		scale
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [position, options];
    }

    class ScaleControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { position: 0, options: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScaleControl",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get position() {
    		throw new Error("<ScaleControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<ScaleControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<ScaleControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<ScaleControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const controls = {
      GeolocateControl,
      NavigationControl,
      ScaleControl,
      ScalingControl: ScaleControl
    };

    /* src/components/forms/TimeSelect.svelte generated by Svelte v3.24.1 */

    const file$2 = "src/components/forms/TimeSelect.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (10:8) {#each availableTimes as time, i}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*time*/ ctx[4] + "";
    	let t;
    	let option_index_value;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			attr_dev(option, "index", option_index_value = /*i*/ ctx[6]);
    			option.__value = option_value_value = /*time*/ ctx[4];
    			option.value = option.__value;
    			add_location(option, file$2, 10, 12, 345);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*availableTimes*/ 2 && t_value !== (t_value = /*time*/ ctx[4] + "")) set_data_dev(t, t_value);

    			if (dirty & /*availableTimes*/ 2 && option_value_value !== (option_value_value = /*time*/ ctx[4])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:8) {#each availableTimes as time, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let form;
    	let select;
    	let t2;
    	let button;
    	let each_value = /*availableTimes*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(/*locationName*/ ctx[2]);
    			t1 = space();
    			form = element("form");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			button = element("button");
    			button.textContent = "Claim this time";
    			add_location(h1, file$2, 6, 4, 214);
    			add_location(select, file$2, 8, 8, 282);
    			attr_dev(button, "action", "submit");
    			add_location(button, file$2, 13, 8, 421);
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "action", "#");
    			add_location(form, file$2, 7, 4, 242);
    			attr_dev(div, "class", "formContainer svelte-wysux9");
    			add_location(div, file$2, 5, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, form);
    			append_dev(form, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			append_dev(form, t2);
    			append_dev(form, button);
    			/*div_binding*/ ctx[3](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*locationName*/ 4) set_data_dev(t0, /*locationName*/ ctx[2]);

    			if (dirty & /*availableTimes*/ 2) {
    				each_value = /*availableTimes*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[3](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { availableTimes = [] } = $$props; // array of times
    	let { locationName = "Testing Center" } = $$props; //name of location
    	let { domRep } = $$props;
    	const writable_props = ["availableTimes", "locationName", "domRep"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimeSelect> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TimeSelect", $$slots, []);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domRep = $$value;
    			$$invalidate(0, domRep);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("availableTimes" in $$props) $$invalidate(1, availableTimes = $$props.availableTimes);
    		if ("locationName" in $$props) $$invalidate(2, locationName = $$props.locationName);
    		if ("domRep" in $$props) $$invalidate(0, domRep = $$props.domRep);
    	};

    	$$self.$capture_state = () => ({ availableTimes, locationName, domRep });

    	$$self.$inject_state = $$props => {
    		if ("availableTimes" in $$props) $$invalidate(1, availableTimes = $$props.availableTimes);
    		if ("locationName" in $$props) $$invalidate(2, locationName = $$props.locationName);
    		if ("domRep" in $$props) $$invalidate(0, domRep = $$props.domRep);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [domRep, availableTimes, locationName, div_binding];
    }

    class TimeSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			availableTimes: 1,
    			locationName: 2,
    			domRep: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimeSelect",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*domRep*/ ctx[0] === undefined && !("domRep" in props)) {
    			console.warn("<TimeSelect> was created without expected prop 'domRep'");
    		}
    	}

    	get availableTimes() {
    		throw new Error("<TimeSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set availableTimes(value) {
    		throw new Error("<TimeSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get locationName() {
    		throw new Error("<TimeSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set locationName(value) {
    		throw new Error("<TimeSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get domRep() {
    		throw new Error("<TimeSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set domRep(value) {
    		throw new Error("<TimeSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TestedMarker.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;

    function create_fragment$6(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();
    	let { lat } = $$props;
    	let { lng } = $$props;
    	let { innerHTML = document.createElement("div") } = $$props; //placeholder
    	let { color } = $$props;
    	let { popupClassName = "defaultPopup" } = $$props;
    	let marker = null;

    	onMount(() => {
    		console.log("bar:", innerHTML);
    		const popup = new mapbox.Popup({ offset: 25, class: popupClassName }).setDOMContent(innerHTML ? innerHTML : null);
    		marker = new mapbox.Marker({ color }).setLngLat([lng, lat]).setPopup(popup).addTo(map);
    		return () => marker.remove();
    	});

    	function getMarker() {
    		return marker;
    	}

    	const writable_props = ["lat", "lng", "innerHTML", "color", "popupClassName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<TestedMarker> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TestedMarker", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("lat" in $$props) $$invalidate(0, lat = $$props.lat);
    		if ("lng" in $$props) $$invalidate(1, lng = $$props.lng);
    		if ("innerHTML" in $$props) $$invalidate(2, innerHTML = $$props.innerHTML);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("popupClassName" in $$props) $$invalidate(4, popupClassName = $$props.popupClassName);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getContext,
    		contextKey,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		lat,
    		lng,
    		innerHTML,
    		color,
    		popupClassName,
    		marker,
    		getMarker
    	});

    	$$self.$inject_state = $$props => {
    		if ("lat" in $$props) $$invalidate(0, lat = $$props.lat);
    		if ("lng" in $$props) $$invalidate(1, lng = $$props.lng);
    		if ("innerHTML" in $$props) $$invalidate(2, innerHTML = $$props.innerHTML);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("popupClassName" in $$props) $$invalidate(4, popupClassName = $$props.popupClassName);
    		if ("marker" in $$props) marker = $$props.marker;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lat, lng, innerHTML, color, popupClassName, getMarker];
    }

    class TestedMarker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			lat: 0,
    			lng: 1,
    			innerHTML: 2,
    			color: 3,
    			popupClassName: 4,
    			getMarker: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestedMarker",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*lat*/ ctx[0] === undefined && !("lat" in props)) {
    			console_1.warn("<TestedMarker> was created without expected prop 'lat'");
    		}

    		if (/*lng*/ ctx[1] === undefined && !("lng" in props)) {
    			console_1.warn("<TestedMarker> was created without expected prop 'lng'");
    		}

    		if (/*color*/ ctx[3] === undefined && !("color" in props)) {
    			console_1.warn("<TestedMarker> was created without expected prop 'color'");
    		}
    	}

    	get lat() {
    		throw new Error("<TestedMarker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lat(value) {
    		throw new Error("<TestedMarker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lng() {
    		throw new Error("<TestedMarker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lng(value) {
    		throw new Error("<TestedMarker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get innerHTML() {
    		throw new Error("<TestedMarker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set innerHTML(value) {
    		throw new Error("<TestedMarker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TestedMarker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TestedMarker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get popupClassName() {
    		throw new Error("<TestedMarker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set popupClassName(value) {
    		throw new Error("<TestedMarker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMarker() {
    		return this.$$.ctx[5];
    	}

    	set getMarker(value) {
    		throw new Error("<TestedMarker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/forms/TimeFinder.svelte generated by Svelte v3.24.1 */

    const file$3 = "src/components/forms/TimeFinder.svelte";

    function create_fragment$7(ctx) {
    	let form;
    	let label0;
    	let t0;
    	let t1;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t4;
    	let t5;
    	let t6;
    	let t7_value = (/*radius*/ ctx[1] == 1 ? "" : "s") + "";
    	let t7;
    	let t8;
    	let input1;
    	let t9;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			label0 = element("label");
    			t0 = text("Date: ");
    			t1 = text(/*date*/ ctx[0]);
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Radius: ");
    			t5 = text(/*radius*/ ctx[1]);
    			t6 = text(" mile");
    			t7 = text(t7_value);
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			button = element("button");
    			button.textContent = "Find new times";
    			attr_dev(input0, "id", "date");
    			attr_dev(input0, "type", "date");
    			add_location(input0, file$3, 6, 8, 150);
    			attr_dev(label0, "for", "date");
    			add_location(label0, file$3, 5, 4, 111);
    			attr_dev(label1, "for", "radius");
    			add_location(label1, file$3, 8, 4, 216);
    			attr_dev(input1, "id", "radius");
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "20");
    			attr_dev(input1, "step", ".5");
    			add_location(input1, file$3, 9, 4, 294);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$3, 10, 4, 379);
    			attr_dev(form, "method", "get");
    			attr_dev(form, "class", "picker svelte-1wulf83");
    			add_location(form, file$3, 4, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(label0, t0);
    			append_dev(label0, t1);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*date*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, label1);
    			append_dev(label1, t4);
    			append_dev(label1, t5);
    			append_dev(label1, t6);
    			append_dev(label1, t7);
    			append_dev(form, t8);
    			append_dev(form, input1);
    			set_input_value(input1, /*radius*/ ctx[1]);
    			append_dev(form, t9);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*date*/ 1) set_data_dev(t1, /*date*/ ctx[0]);

    			if (dirty & /*date*/ 1) {
    				set_input_value(input0, /*date*/ ctx[0]);
    			}

    			if (dirty & /*radius*/ 2) set_data_dev(t5, /*radius*/ ctx[1]);
    			if (dirty & /*radius*/ 2 && t7_value !== (t7_value = (/*radius*/ ctx[1] == 1 ? "" : "s") + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*radius*/ 2) {
    				set_input_value(input1, /*radius*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { date = "" } = $$props;
    	let { radius = 1 } = $$props;
    	const writable_props = ["date", "radius"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimeFinder> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TimeFinder", $$slots, []);

    	function input0_input_handler() {
    		date = this.value;
    		$$invalidate(0, date);
    	}

    	function input1_change_input_handler() {
    		radius = to_number(this.value);
    		$$invalidate(1, radius);
    	}

    	$$self.$$set = $$props => {
    		if ("date" in $$props) $$invalidate(0, date = $$props.date);
    		if ("radius" in $$props) $$invalidate(1, radius = $$props.radius);
    	};

    	$$self.$capture_state = () => ({ date, radius });

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(0, date = $$props.date);
    		if ("radius" in $$props) $$invalidate(1, radius = $$props.radius);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [date, radius, input0_input_handler, input1_change_input_handler];
    }

    class TimeFinder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { date: 0, radius: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimeFinder",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get date() {
    		throw new Error("<TimeFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<TimeFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<TimeFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<TimeFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TestedMap.svelte generated by Svelte v3.24.1 */

    const { console: console_1$1 } = globals;
    const file$4 = "src/components/TestedMap.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (59:0) {#each errors as error, i}
    function create_each_block$1(ctx) {
    	let blockquote;
    	let t_value = /*error*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			blockquote = element("blockquote");
    			t = text(t_value);
    			add_location(blockquote, file$4, 59, 2, 1661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, blockquote, anchor);
    			append_dev(blockquote, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errors*/ 1 && t_value !== (t_value = /*error*/ ctx[15] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(blockquote);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(59:0) {#each errors as error, i}",
    		ctx
    	});

    	return block;
    }

    // (62:0) {#if domTimeSelect !== undefined}
    function create_if_block$1(ctx) {
    	let div;
    	let map;
    	let current;

    	let map_props = {
    		accessToken: apiPublicKey,
    		style: "mapbox://styles/pseudonymonty/ckeggpduq00t619pnkcdgcang",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	map = new Map$1({ props: map_props, $$inline: true });
    	/*map_binding*/ ctx[10](map);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(map.$$.fragment);
    			attr_dev(div, "class", "mapContainer svelte-18vp52k");
    			toggle_class(div, "hidden", !/*locationEnabled*/ ctx[4]);
    			add_location(div, file$4, 62, 2, 1738);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(map, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const map_changes = {};

    			if (dirty & /*$$scope, currentLocation, domTimeSelect*/ 262156) {
    				map_changes.$$scope = { dirty, ctx };
    			}

    			map.$set(map_changes);

    			if (dirty & /*locationEnabled*/ 16) {
    				toggle_class(div, "hidden", !/*locationEnabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*map_binding*/ ctx[10](null);
    			destroy_component(map);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(62:0) {#if domTimeSelect !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (70:6) {#if currentLocation.latitude !== undefined && currentLocation.longitude !== undefined}
    function create_if_block_1(ctx) {
    	let testedmarker0;
    	let t;
    	let testedmarker1;
    	let current;

    	testedmarker0 = new TestedMarker({
    			props: {
    				lat: /*lat*/ ctx[7],
    				lng: /*long*/ ctx[8],
    				color: "rgb(60,170,220)",
    				innerHTML: /*domTimeSelect*/ ctx[3]
    			},
    			$$inline: true
    		});

    	testedmarker1 = new TestedMarker({
    			props: {
    				lat: /*currentLocation*/ ctx[2].latitude,
    				lng: /*currentLocation*/ ctx[2].longitude,
    				color: "rgb(200,120,120)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(testedmarker0.$$.fragment);
    			t = space();
    			create_component(testedmarker1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(testedmarker0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(testedmarker1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const testedmarker0_changes = {};
    			if (dirty & /*domTimeSelect*/ 8) testedmarker0_changes.innerHTML = /*domTimeSelect*/ ctx[3];
    			testedmarker0.$set(testedmarker0_changes);
    			const testedmarker1_changes = {};
    			if (dirty & /*currentLocation*/ 4) testedmarker1_changes.lat = /*currentLocation*/ ctx[2].latitude;
    			if (dirty & /*currentLocation*/ 4) testedmarker1_changes.lng = /*currentLocation*/ ctx[2].longitude;
    			testedmarker1.$set(testedmarker1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(testedmarker0.$$.fragment, local);
    			transition_in(testedmarker1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(testedmarker0.$$.fragment, local);
    			transition_out(testedmarker1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(testedmarker0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(testedmarker1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(70:6) {#if currentLocation.latitude !== undefined && currentLocation.longitude !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (65:4) <Map       accessToken="{apiPublicKey}"       bind:this={mapComponent}       style="mapbox://styles/pseudonymonty/ckeggpduq00t619pnkcdgcang"     >
    function create_default_slot(ctx) {
    	let t0;
    	let navigationcontrol;
    	let t1;
    	let scalecontrol;
    	let current;
    	let if_block = /*currentLocation*/ ctx[2].latitude !== undefined && /*currentLocation*/ ctx[2].longitude !== undefined && create_if_block_1(ctx);
    	navigationcontrol = new /*NavigationControl*/ ctx[5]({ $$inline: true });
    	scalecontrol = new /*ScaleControl*/ ctx[6]({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(navigationcontrol.$$.fragment);
    			t1 = space();
    			create_component(scalecontrol.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(navigationcontrol, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(scalecontrol, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*currentLocation*/ ctx[2].latitude !== undefined && /*currentLocation*/ ctx[2].longitude !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentLocation*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(navigationcontrol.$$.fragment, local);
    			transition_in(scalecontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(navigationcontrol.$$.fragment, local);
    			transition_out(scalecontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(navigationcontrol, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(scalecontrol, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(65:4) <Map       accessToken=\\\"{apiPublicKey}\\\"       bind:this={mapComponent}       style=\\\"mapbox://styles/pseudonymonty/ckeggpduq00t619pnkcdgcang\\\"     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t0;
    	let t1;
    	let div;
    	let timeselect;
    	let updating_domRep;
    	let t2;
    	let timefinder;
    	let current;
    	let each_value = /*errors*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*domTimeSelect*/ ctx[3] !== undefined && create_if_block$1(ctx);

    	function timeselect_domRep_binding(value) {
    		/*timeselect_domRep_binding*/ ctx[11].call(null, value);
    	}

    	let timeselect_props = {
    		availableTimes: ["6:00pm", "6:15pm", "6:30pm"]
    	};

    	if (/*domTimeSelect*/ ctx[3] !== void 0) {
    		timeselect_props.domRep = /*domTimeSelect*/ ctx[3];
    	}

    	timeselect = new TimeSelect({ props: timeselect_props, $$inline: true });
    	binding_callbacks.push(() => bind(timeselect, "domRep", timeselect_domRep_binding));
    	timefinder = new TimeFinder({ $$inline: true });

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div = element("div");
    			create_component(timeselect.$$.fragment);
    			t2 = space();
    			create_component(timefinder.$$.fragment);
    			attr_dev(div, "class", "svelte-18vp52k");
    			toggle_class(div, "hidden", !/*locationEnabled*/ ctx[4]);
    			add_location(div, file$4, 79, 0, 2444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(timeselect, div, null);
    			append_dev(div, t2);
    			mount_component(timefinder, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*errors*/ 1) {
    				each_value = /*errors*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*domTimeSelect*/ ctx[3] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*domTimeSelect*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const timeselect_changes = {};

    			if (!updating_domRep && dirty & /*domTimeSelect*/ 8) {
    				updating_domRep = true;
    				timeselect_changes.domRep = /*domTimeSelect*/ ctx[3];
    				add_flush_callback(() => updating_domRep = false);
    			}

    			timeselect.$set(timeselect_changes);

    			if (dirty & /*locationEnabled*/ 16) {
    				toggle_class(div, "hidden", !/*locationEnabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(timeselect.$$.fragment, local);
    			transition_in(timefinder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(timeselect.$$.fragment, local);
    			transition_out(timefinder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(timeselect);
    			destroy_component(timefinder);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiPublicKey = "pk.eyJ1IjoicHNldWRvbnltb250eSIsImEiOiJjanR6eDE5MTIzOHo3NDRuc28yOTgxem4wIn0.pnMTUhVyBUsJFKOx9waTJA";

    function instance$8($$self, $$props, $$invalidate) {
    	const { GeolocateControl, NavigationControl, ScaleControl } = controls;
    	let mapComponent;
    	const boston = [42.361145, -71.057083];
    	let [lat, long] = boston;

    	let currentLocation = {
    		latitude: undefined,
    		longitude: undefined
    	};

    	let domTimeSelect;
    	let locationEnabled = false;
    	let { errors = [] } = $$props;
    	let { range = 1 } = $$props; //range in miles

    	function getLocation() {
    		if (navigator.geolocation) {
    			navigator.geolocation.getCurrentPosition(
    				pos => {
    					console.log(pos.coords);
    					$$invalidate(2, currentLocation.latitude = pos.coords.latitude, currentLocation);
    					$$invalidate(2, currentLocation.longitude = pos.coords.longitude, currentLocation);
    					mapComponent.setCenter([currentLocation.longitude, currentLocation.latitude], 12);
    					$$invalidate(4, locationEnabled = true);
    				},
    				error => {
    					$$invalidate(0, errors = [...errors, "You must allow location services to work."]);
    					console.log(error);
    				}
    			);
    		} else {
    			$$invalidate(0, errors = [...errors, "The browser does not support location."]);
    		}
    	}

    	onMount(() => {
    		getLocation();
    	});

    	const writable_props = ["errors", "range"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<TestedMap> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TestedMap", $$slots, []);

    	function map_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			mapComponent = $$value;
    			$$invalidate(1, mapComponent);
    		});
    	}

    	function timeselect_domRep_binding(value) {
    		domTimeSelect = value;
    		$$invalidate(3, domTimeSelect);
    	}

    	$$self.$$set = $$props => {
    		if ("errors" in $$props) $$invalidate(0, errors = $$props.errors);
    		if ("range" in $$props) $$invalidate(9, range = $$props.range);
    	};

    	$$self.$capture_state = () => ({
    		Map: Map$1,
    		Geocoder,
    		controls,
    		onMount,
    		TimeSelect,
    		TestedMarker,
    		TimeFinder,
    		GeolocateControl,
    		NavigationControl,
    		ScaleControl,
    		apiPublicKey,
    		mapComponent,
    		boston,
    		lat,
    		long,
    		currentLocation,
    		domTimeSelect,
    		locationEnabled,
    		errors,
    		range,
    		getLocation
    	});

    	$$self.$inject_state = $$props => {
    		if ("mapComponent" in $$props) $$invalidate(1, mapComponent = $$props.mapComponent);
    		if ("lat" in $$props) $$invalidate(7, lat = $$props.lat);
    		if ("long" in $$props) $$invalidate(8, long = $$props.long);
    		if ("currentLocation" in $$props) $$invalidate(2, currentLocation = $$props.currentLocation);
    		if ("domTimeSelect" in $$props) $$invalidate(3, domTimeSelect = $$props.domTimeSelect);
    		if ("locationEnabled" in $$props) $$invalidate(4, locationEnabled = $$props.locationEnabled);
    		if ("errors" in $$props) $$invalidate(0, errors = $$props.errors);
    		if ("range" in $$props) $$invalidate(9, range = $$props.range);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		errors,
    		mapComponent,
    		currentLocation,
    		domTimeSelect,
    		locationEnabled,
    		NavigationControl,
    		ScaleControl,
    		lat,
    		long,
    		range,
    		map_binding,
    		timeselect_domRep_binding
    	];
    }

    class TestedMap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { errors: 0, range: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestedMap",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get errors() {
    		throw new Error("<TestedMap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errors(value) {
    		throw new Error("<TestedMap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get range() {
    		throw new Error("<TestedMap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set range(value) {
    		throw new Error("<TestedMap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind$1 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        if (
          (utils.isBlob(requestData) || utils.isFile(requestData)) &&
          requestData.type
        ) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = unescape(encodeURIComponent(config.auth.password)) || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind$1(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    /* src/components/forms/Login.svelte generated by Svelte v3.24.1 */

    const { console: console_1$2 } = globals;
    const file$5 = "src/components/forms/Login.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let form;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*title*/ ctx[2]}`;
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Password";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Login";
    			add_location(h1, file$5, 31, 4, 719);
    			attr_dev(label0, "for", "email");
    			add_location(label0, file$5, 33, 8, 807);
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Email");
    			add_location(input0, file$5, 34, 8, 848);
    			attr_dev(label1, "for", "password");
    			add_location(label1, file$5, 35, 8, 927);
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file$5, 36, 8, 974);
    			attr_dev(button, "action", "submit");
    			add_location(button, file$5, 37, 8, 1066);
    			attr_dev(form, "method", "POST");
    			add_location(form, file$5, 32, 4, 740);
    			attr_dev(div, "class", "formContainer svelte-16pc5cb");
    			add_location(div, file$5, 30, 0, 687);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, form);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(form, t7);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button, "submit", /*postData*/ ctx[3], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*postData*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let title = "Login";
    	let email = "";
    	let password = "";

    	async function postData() {
    		// console.log(event);
    		// console.log(event.target);
    		// console.log(event.target.email.value);
    		// console.log(event.target.password.value);
    		console.log(email);

    		console.log(password);

    		await axios$1.post("localhost:1337/API/v1/user/login", { email, password }).then(response => {
    			console.log(response);
    		}).catch(err => {
    			console.log(err);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Login", $$slots, []);

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		axios: axios$1,
    		onMount,
    		title,
    		email,
    		password,
    		postData
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("email" in $$props) $$invalidate(0, email = $$props.email);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [email, password, title, postData, input0_input_handler, input1_input_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */
    const file$6 = "src/App.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(login.$$.fragment);
    			attr_dev(main, "class", "svelte-18c34wo");
    			add_location(main, file$6, 6, 0, 146);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(login, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(login);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ TestedMap, Login });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
