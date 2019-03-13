// This file was generated by modules-webmake (modules for web) project.
// See: https://github.com/medikoo/modules-webmake

(function (modules) {
	'use strict';

	var resolve, getRequire, wmRequire, notFoundError, findFile
	  , extensions = {".js":[],".json":[],".css":[],".html":[]}
	  , envRequire = typeof require === 'function' ? require : null;

	notFoundError = function (path) {
		var error = new Error("Could not find module '" + path + "'");
		error.code = 'MODULE_NOT_FOUND';
		return error;
	};
	findFile = function (scope, name, extName) {
		var i, ext;
		if (typeof scope[name + extName] === 'function') return name + extName;
		for (i = 0; (ext = extensions[extName][i]); ++i) {
			if (typeof scope[name + ext] === 'function') return name + ext;
		}
		return null;
	};
	resolve = function (scope, tree, path, fullPath, state, id) {
		var name, dir, exports, module, fn, found, ext;
		path = path.split(/[\\/]/);
		name = path.pop();
		if ((name === '.') || (name === '..')) {
			path.push(name);
			name = '';
		}
		while ((dir = path.shift()) != null) {
			if (!dir || (dir === '.')) continue;
			if (dir === '..') {
				scope = tree.pop();
				id = id.slice(0, id.lastIndexOf('/'));
			} else {
				tree.push(scope);
				scope = scope[dir];
				id += '/' + dir;
			}
			if (!scope) throw notFoundError(fullPath);
		}
		if (name && (typeof scope[name] !== 'function')) {
			found = findFile(scope, name, '.js');
			if (!found) found = findFile(scope, name, '.json');
			if (!found) found = findFile(scope, name, '.css');
			if (!found) found = findFile(scope, name, '.html');
			if (found) {
				name = found;
			} else if ((state !== 2) && (typeof scope[name] === 'object')) {
				tree.push(scope);
				scope = scope[name];
				id += '/' + name;
				name = '';
			}
		}
		if (!name) {
			if ((state !== 1) && scope[':mainpath:']) {
				return resolve(scope, tree, scope[':mainpath:'], fullPath, 1, id);
			}
			return resolve(scope, tree, 'index', fullPath, 2, id);
		}
		fn = scope[name];
		if (!fn) throw notFoundError(fullPath);
		if (fn.hasOwnProperty('module')) return fn.module.exports;
		exports = {};
		fn.module = module = { exports: exports, id: id + '/' + name };
		fn.call(exports, exports, module, getRequire(scope, tree, id));
		return module.exports;
	};
	wmRequire = function (scope, tree, fullPath, id) {
		var name, path = fullPath, t = fullPath.charAt(0), state = 0;
		if (t === '/') {
			path = path.slice(1);
			scope = modules['/'];
			if (!scope) {
				if (envRequire) return envRequire(fullPath);
				throw notFoundError(fullPath);
			}
			id = '/';
			tree = [];
		} else if (t !== '.') {
			name = path.split('/', 1)[0];
			scope = modules[name];
			if (!scope) {
				if (envRequire) return envRequire(fullPath);
				throw notFoundError(fullPath);
			}
			id = name;
			tree = [];
			path = path.slice(name.length + 1);
			if (!path) {
				path = scope[':mainpath:'];
				if (path) {
					state = 1;
				} else {
					path = 'index';
					state = 2;
				}
			}
		}
		return resolve(scope, tree, path, fullPath, state, id);
	};
	getRequire = function (scope, tree, id) {
		return function (path) {
			return wmRequire(scope, [].concat(tree), path, id);
		};
	};
	return getRequire(modules, [], '');
})({
	"7. Project Electronic Life": {
		"creatures": {
			"action-types.js": function (exports, module, require) {
				let { elementFromChar } = require('../helpers.js');

				var actionTypes = Object.create(null);

				actionTypes.grow = function (critter) {
				    critter.energy += 0.5;
				    return true;
				};

				actionTypes.move = function (critter, vector, action) {
				    var dest = this.checkDestination(action, vector);
				    if (dest == null ||
				        critter.energy <= 1 ||
				        this.grid.get(dest) != null)
				        return false;
				    critter.energy -= 1;
				    this.grid.set(vector, null);
				    this.grid.set(dest, critter);
				    return true;
				};

				actionTypes.eat = function (critter, vector, action) {
				    var dest = this.checkDestination(action, vector);
				    var atDest = dest != null && this.grid.get(dest);
				    if (!atDest || atDest.energy == null)
				        return false;
				    critter.energy += atDest.energy;
				    this.grid.set(dest, null);
				    return true;
				};

				actionTypes.reproduce = function (critter, vector, action) {
				    var baby = elementFromChar(this.legend,
				        critter.originChar);
				    var dest = this.checkDestination(action, vector);
				    if (dest == null ||
				        critter.energy <= 2 * baby.energy ||
				        this.grid.get(dest) != null)
				        return false;
				    critter.energy -= 2 * baby.energy;
				    this.grid.set(dest, baby);
				    return true;
				};

				module.exports = actionTypes;
			},
			"animal.js": function (exports, module, require) {
				function Animal() {
				    this.energy = 20;
				    this.food = "*";
				    this.hungryEnergy = 40;
				    this.reproductiveEnergy = 60;
				}
				Animal.prototype.act = function (context) {
				    var space = context.find(" ");
				    var food = context.find(this.food);
				    var canReproduct = this.canReproduct(food, space);

				    if (canReproduct && space) return { type: "reproduce", direction: space };

				    if (this.energy > this.reproductiveEnergy) {
				        if (space) return { type: "move", direction: space };
				        if (food) return { type: "eat", direction: food };
				    } else {
				        if (food) return { type: "eat", direction: food };
				        if (space) return { type: "move", direction: space };
				    }
				};
				Animal.prototype.canReproduct = function(food) {
				    if (this.energy < this.hungryEnergy) return false;
				    if (food) return true;
				    if (this.energy > this.reproductiveEnergy) return true;
				    return false;
				};

				module.exports = Animal;
			},
			"plant-eater.js": function (exports, module, require) {
				var Animal = require('./animal.js');

				function PlantEater() {
				    Animal.call(this);
				    this.food = "*";
				}
				PlantEater.prototype = Object.create(Animal.prototype);
				PlantEater.prototype.constructor = PlantEater;

				module.exports = PlantEater;
			},
			"plant.js": function (exports, module, require) {
				function Plant() {
				    this.energy = 3 + Math.random() * 4;
				}
				Plant.prototype.act = function (context) {
				    if (this.energy > 15) {
				        var space = context.find(" ");
				        if (space)
				            return { type: "reproduce", direction: space };
				    }
				    if (this.energy < 20)
				        return { type: "grow" };
				};

				module.exports = Plant;
			},
			"predator.js": function (exports, module, require) {
				var Animal = require('./animal.js');

				function Predator() {
				    Animal.call(this);
				    this.food = "O";
				}
				Predator.prototype = Object.create(Animal.prototype);
				Predator.prototype.constructor = Predator;

				module.exports = Predator;
			}
		},
		"draw.js": function (exports, module, require) {
			function draw(world) {
			    var turn = function() {
			        world.turn();
			        document.getElementById('world').innerHTML = world.toString();
			        setTimeout(turn, 1 * 1000) 
			    }

			    turn();
			}

			module.exports = draw;
		},
		"helpers.js": function (exports, module, require) {
			function elementFromChar(legend, ch) {
			    if (ch == " ")
			        return null;
			    var element = new legend[ch]();
			    element.originChar = ch;
			    return element;
			}

			function charFromElement(element) {
			    if (element == null)
			        return " ";
			    else
			        return element.originChar;
			}

			function randomElement(array) {
			    return array[Math.floor(Math.random() * array.length)];
			}

			module.exports = {
			    charFromElement, elementFromChar, randomElement
			}
		},
		"script.js": function (exports, module, require) {
			const { plan, legend } = require('./world/map.js');
			const World = require('./world/world.js');

			const draw = require('./draw.js');

			var world = new World(plan, legend);

			draw(world);

		},
		"vector.js": function (exports, module, require) {
			function Vector(x, y) {
			    this.x = x;
			    this.y = y;
			}
			Vector.prototype.plus = function (other) {
			    return new Vector(this.x + other.x, this.y + other.y);
			};

			module.exports = Vector;
		},
		"world": {
			"directions.js": function (exports, module, require) {
				const Vector = require('../vector.js');

				var directions = {
				    "n": new Vector(0, -1),
				    "ne": new Vector(1, -1),
				    "e": new Vector(1, 0),
				    "se": new Vector(1, 1),
				    "s": new Vector(0, 1),
				    "sw": new Vector(-1, 1),
				    "w": new Vector(-1, 0),
				    "nw": new Vector(-1, -1)
				};

				module.exports = directions;
			},
			"grid.js": function (exports, module, require) {
				const Vector = require('../vector.js');

				function Grid(width, height) {
				    this.space = new Array(width * height);
				    this.width = width;
				    this.height = height;
				}
				Grid.prototype.isInside = function (vector) {
				    return vector.x >= 0 && vector.x < this.width &&
				        vector.y >= 0 && vector.y < this.height;
				};
				Grid.prototype.get = function (vector) {
				    return this.space[vector.x + this.width * vector.y];
				};
				Grid.prototype.set = function (vector, value) {
				    this.space[vector.x + this.width * vector.y] = value;
				};
				Grid.prototype.forEach = function (f, context) {
				    for (var y = 0; y < this.height; y++) {
				        for (var x = 0; x < this.width; x++) {
				            var value = this.space[x + y * this.width];
				            if (value != null)
				                f.call(context, value, new Vector(x, y));
				        }
				    }
				};

				module.exports = Grid;
			},
			"map.js": function (exports, module, require) {
				const Wall = require('./wall.js');
				// const BouncingCritter = require('./bouncing-critter.js');
				// const WallFollower = require('./wall-follower.js');

				const Plant = require('../creatures/plant.js');
				const PlantEater = require('../creatures/plant-eater.js');
				const Predator = require('../creatures/predator.js');

				var plan = ["############################",
				            "#####         X       ######",
				            "##   ***                **##",
				            "#   *##**         **  O  *##",
				            "#    ***     O    ##**    *#",
				            "#       O         ##***    #",
				            "#                 ##**X    #",
				            "#   O       #*             #",
				            "#*          #**       O    #",
				            "#***        ##**    O    **#",
				            "##****     ###***       *###",
				            "############################"];

				var legend = { 
				    "#": Wall, 
				    "O": PlantEater,
				    "*": Plant,
				    "X": Predator,
				    //"o": BouncingCritter,
				    //"~": WallFollower
				};

				module.exports = {
				    plan, legend
				};
			},
			"view.js": function (exports, module, require) {
				var directions = require('./directions.js');
				let { charFromElement, randomElement } = require('../helpers.js');

				function View(world, vector) {
				    this.world = world;
				    this.vector = vector;
				}
				View.prototype.look = function (dir) {
				    var target = this.vector.plus(directions[dir]);
				    if (this.world.grid.isInside(target))
				        return charFromElement(this.world.grid.get(target));
				    else
				        return "#";
				};
				View.prototype.findAll = function (ch) {
				    var found = [];
				    for (var dir in directions)
				        if (this.look(dir) == ch)
				            found.push(dir);
				    return found;
				};
				View.prototype.find = function (ch) {
				    var found = this.findAll(ch);
				    if (found.length == 0) return null;
				    return randomElement(found);
				};

				module.exports = View;
			},
			"wall.js": function (exports, module, require) {
				function Wall() { }

				module.exports = Wall;
			},
			"world.js": function (exports, module, require) {
				const Vector = require('../vector.js');
				const Grid = require('./grid.js');
				const View = require('./view.js');

				var directions = require('./directions.js');
				let { charFromElement, elementFromChar } = require('../helpers.js');

				var actionTypes = require('../creatures/action-types.js');

				function World(map, legend) {
				    var grid = new Grid(map[0].length, map.length);
				    this.grid = grid;
				    this.legend = legend;

				    map.forEach(function (line, y) {
				        for (var x = 0; x < line.length; x++)
				            grid.set(new Vector(x, y),
				                elementFromChar(legend, line[x]));
				    });
				}

				World.prototype.toString = function () {
				    var output = "";
				    for (var y = 0; y < this.grid.height; y++) {
				        for (var x = 0; x < this.grid.width; x++) {
				            var element = this.grid.get(new Vector(x, y));
				            output += charFromElement(element);
				        }
				        output += "\n";
				    }
				    return output;
				};

				World.prototype.turn = function () {
				    var acted = [];
				    this.grid.forEach(function (critter, vector) {
				        if (critter.act && acted.indexOf(critter) == -1) {
				            acted.push(critter);
				            this.letAct(critter, vector);
				        }
				    }, this);
				};

				World.prototype.letAct = function (critter, vector) {
				    var action = critter.act(new View(this, vector));
				    var handled = action &&
				        action.type in actionTypes &&
				        actionTypes[action.type].call(this, critter,
				            vector, action);
				    if (!handled) {
				        critter.energy -= 0.2;
				        if (critter.energy <= 0)
				            this.grid.set(vector, null);
				    }
				};

				World.prototype.checkDestination = function (action, vector) {
				    if (directions.hasOwnProperty(action.direction)) {
				        var dest = vector.plus(directions[action.direction]);
				        if (this.grid.isInside(dest))
				            return dest;
				    }
				};

				module.exports = World;
			}
		}
	}
})("7. Project Electronic Life/script");
