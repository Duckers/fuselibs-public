class Inner {
	constructor(v) {
		this.value = v
	}
	
	incr() {
		this.value++
	}
}

var cur = new Inner(5)
var next = new Inner(10)

class ModelDisconnected {
	constructor() {
		this.inner = cur
	}
	
	updateNext() {
		next.incr()
	}
	
	swap() {
		var t = cur
		cur = next
		next = t
		this.inner = cur
		console.log( "->" + this.inner.value )
	}
}

module.exports = ModelDisconnected