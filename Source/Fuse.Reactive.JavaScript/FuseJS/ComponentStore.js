

var TreeObservable = require("FuseJS/TreeObservable")

function ComponentStore(source)
{
    instrument(this, null, this, [], source)

    var subscribers = []

    this.subscribe = function(callback) {
        subscribers.push(callback);
    }

    function instrument(store, parentNode, node, path, state)
    {
        node.$getState = function() { return state; }

        node.$isClass = false;
        for (var k in state) {
            var v = state[k];
            if (v instanceof Function) {
                node[k] = wrapFunction(k, v);
                state[k] = node[k];
                node.$isClass = true;
            }
            else if (v instanceof Array) {
                node[k] = instrument(store, node, [], path.concat(k), v);
            }
            else if (v instanceof Object) {
                node[k] = instrument(store, node, {}, path.concat(k), v);
            }
            else
            {
                console.log(k + " = " + v)
                node[k] = v;
            }
        }

        var propGetters = {}

        if (!(state instanceof Array)) {
            registerProps(state);
        }

        function registerProps(obj) {

            var descs = Object.getOwnPropertyDescriptors(obj);
            for (var p in descs) {
                if (p === "constructor") { continue; }
                var value = state[p];
                if (value instanceof Function) {
                    node[p] = wrapFunction(p, value);
                    state[p] = node[p];
                }
                else if (descs[p].get instanceof Function)
                {
                    node[p] = value;
                    propGetters[p] = descs[p].get;
                }
            }

            // Include members from object's prototype chain (to allow ES6 classes)
            var proto = Object.getPrototypeOf(obj);
            if (proto && proto !== Object.prototype) { registerProps(proto); }
        }

        node.evaluateDerivedProps = function()
        {
            for (var p in propGetters) {
                var v = propGetters[p].call(state);
                console.log("Re-evaluating " + p + " = "+v)
                set(p, v);
            }
            if (parentNode !== null) parentNode.evaluateDerivedProps();
        }

        function wrapFunction(name, func) {

            var f = function() {
                console.log("WRAP: " + JSON.stringify(arguments))
                func.apply(state, arguments);
                dirty();
            }
            f.$isWrapped = true;

            return f;
        }

        var isDirty = false;

        function dirty() {
            if (isDirty) { return; }
            isDirty = true;
            setTimeout(node.diff, 0);
        }

        node.diff = function() {
            node.evaluateDerivedProps(); // Consider calling this after seeing whether or not any changes have been detected

            console.log("checking for changes in " + JSON.stringify(node))
            isDirty = false;
            for (var k in state) {
                var v = state[k];
                update(k, v);
            }
        }

        node.$requestChange = function(key, value) {
            var changeAccepted = true;
            if ('$requestChange' in state) {
                changeAccepted = state.$requestChange(key, value);
            }

            if (changeAccepted) {
                state[key] = value;
                setInternal(key, value);
            }

            node.diff();
        }

        function update(key, value)
        {
            console.log("Examining '" + key + "' = " + JSON.stringify(value))
            if (value instanceof Function) {
                if (!value.$isWrapped) {
                    state[key] = wrapFunction(k, value)
                    set(key, state[key]);
                }
            }
            else if (value instanceof Array) {
                if (node.$getState() == value && value.length == node[key].length && 'diff' in node[key]) { node[key].diff(); }
                else { set(key, instrument(store, node, [], path.concat(key), value)); }
            }
            else if (value instanceof Object) {
                if (node.$getState() == value && 'diff' in node[key]) {
                    if (node.$isClass === false) {
                        node[key].diff();
                    }
                }
                else { 
                    console.log("Found new object: " + JSON.stringify(value));
                    set(key, instrument(store, node, {}, path.concat(key), value));  
                }
            }
            else if (value !== node[key])
            {
                set(key, value);
            }
        }

        function set(key, value)
        {
            if (!setInternal(key, value)) { return; }

            console.log("HAHAH  " + JSON.stringify(store));

            var argPath = path.concat(key, value instanceof Array ? [value] : value);
            TreeObservable.set.apply(store, argPath);
        }

        function setInternal(key, value) {
            if (node[key] === value) { return false; }
            node[key] = value;

            var msg = {
                operation: "set",
                path: path,
                key: key,
                value: value
            }

            console.log("YAYA!" + JSON.stringify(msg));

            for (var s of subscribers) s.call(store, msg);
            return true;
        }

        return node;
    }
}

ComponentStore.prototype = Object.create(TreeObservable.prototype);

module.exports = ComponentStore;