class Item {
	constructor( name ) {
		this.name = name
	}
}

class UseCase1 {
	constructor() {
		this.items = [ "one", "two", "three", "four", "five" ].map( n => new Item(n) )
		console.dir(this.items)
		this.sel = []
	}

	add(args) {
		console.log(args.data)
		//this.sel.push(
	}
	
	remove(args) {
	}
}

module.exports = UseCase1