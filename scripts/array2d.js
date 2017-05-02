var Array2d = (function() {
	
	function Array2d(width, height, value) {
		var width = width;
		var height = height;
		
		var cells = [];
		for (var x = 0; x < width; ++x) {
			cells.push([]);
			for (var y = 0; y < height; ++y) {
				cells[x].push(typeof(value) === "undefined" ? 0.0 : value);
			};
		};
		
		this.get = function(x, y) {
			if (x < 0 || x >= width || y < 0 || y >= height) throw "Array2d: index out of bounds";
			return cells[x][y];
		};
		
		this.set = function(x, y, value) {
			if (x < 0 || x >= width || y < 0 || y >= height) throw "Array2d: index out of bounds";
			cells[x][y] = value;
		};
		
		this.getWidth = function() { return width; };
		this.getHeight = function() { return height; };
		
		this.getCells = function() { return cells; };
		
		this.print = function() {
			for (var y = 0; y < height; ++y) {
				console.log(cells[y].join(" "));
			}
		};
		
		this.clone = function() {
			var clone = new Array2d(width, height, value);
			
			for (var x = 0; x < width; ++x) {
				for (var y = 0; y < height; ++y) {
					clone.set(x, y, cells[x][y]);
				};
			};
			
			return clone;
		};
		
		/**
		 * Applies a function callback on each of the array elements.
		 * fun is called with three arguments: (value, x, y)
		 */
		this.forEach = function(fun) {
			for (var x = 0; x < width; ++x) {
				for (var y = 0; y < height; ++y) {
					fun(cells[x][y], x, y);
				};
			};
		};

	};
	
	return Array2d;
} ());
