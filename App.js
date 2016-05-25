/* 
* @Author: hasan
* @Date:   2015-08-11 13:26:45
* @Last Modified by:   hasan
* @Lat Modified time:  2015-08-11 21:10:18
*/

// TODO: Add <<showOverlay>> function in World
// TODO: Add earthquake effect
// TODO: Add some explosions



window.onload = (function() {
	'use strict';

	var scores = document.querySelector(".scores"),
		Snake,
		Food,
		Vec2,
		World;

	var LEFT = 1,
		UP = 2,
		DOWN = 3,
		RIGHT = 4;

	Vec2 = function(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	};

	// Check if multiple n
	Vec2.isMultipleN = function(num, n) {
		if (num % n === 0)
			return true;
		else
			return false;
	};

	// Get number multiple n
	Vec2.multiple = function(pos, n) {
		var rounded = Math.round(pos/n)*n;
		if (Vec2.isMultipleN(rounded, n)) {
			return rounded;
		} else {
			for (var i = n; i < pos; i += n) {
				rounded += i;
				if (Vec2.isMultipleN(rounded, n)) {
					return rounded;
				}
			}
		}
	};

	// Get random vector multiple n
	Vec2.getRandom = function(w, h, n) {
		var x = Vec2.multiple(Math.random()*w, n);
		var y = Vec2.multiple(Math.random()*h, n);

		return new Vec2(x, y);
	};


	Vec2.prototype = {

		add: function(vec) {
			this.x += vec.x;
			this.y += vec.y;
			return this;
		},

		subtracts: function(vec) {
			this.x -= vec.x;
			this.y -= vec.y;
			return this;
		}
	};

	Snake = function(config) {
		this.width = config.width;
		this.height = config.height;
		this.loc = config.loc;
		this.step = config.step;
		this.size = config.size;
		this.train = [];
		this.len = 0;
		this.block = config.width;
		this.world = config.world;
	};

	Snake.direction = RIGHT;

	Snake.prototype = {

		edgeCollision: function(p) {
			if (p.x > this.world.width - p.width ||
				p.x < 0 ||
				p.y > this.world.height - p.height ||
				p.y < 0) {
				return true;
			} else {
				return false;
			}
		},

		collision: function(x, y) {
			for (var i = 1, len = this.train.length; i < len; i += 1) {
				if (x === this.train[i][0] && y === this.train[i][1]) {
					return true;
				}
			}
		},

		update: function() {
			var params = {
				x: this.loc.x, y: this.loc.y,
				width: this.width,
				height: this.height
			};

			if (this.edgeCollision(params) || this.collision(params.x, params.y)) {
				this.world.crash();
			} else {
				if (Snake.direction === LEFT) {
					// Left
					this.loc.x -= this.step;
				} else if (Snake.direction === UP) {
					// Up
					this.loc.y -= this.step;
				} else if (Snake.direction === DOWN) {
					// Down
					this.loc.y += this.step;
				} else if (Snake.direction === RIGHT) {
					// Right
					this.loc.x += this.step;
				}
			}

		// TODO: Edge detection

			if (this.train.length >= this.size) this.train.pop();
			this.train.unshift([this.loc.x, this.loc.y]);
		},

		draw: function() {
			for (var i in this.train) {
				this.world.ctx.fillRect(this.train[i][0], this.train[i][1], this.width, this.height);
			}

			this.drawEyes();
		},

		drawEyes: function() {
			this.world.ctx.fillStyle = 'black';
			if (Snake.direction === UP) {
				this.world.ctx.fillRect(this.loc.x+this.block/10, this.loc.y+this.block/10, this.block/5, this.block/3);
				this.world.ctx.fillRect(this.loc.x+(this.block-this.block/10 - this.block/5), this.loc.y+this.block/10, this.block/5, this.block/3)
			} else if (Snake.direction === DOWN) {
				this.world.ctx.fillRect(this.loc.x+this.block/10, this.loc.y+this.block-this.block/10-this.block/3, this.block/5, this.block/3);
				this.world.ctx.fillRect(this.loc.x+(this.block-this.block/10-this.block/5), this.loc.y+this.block-this.block/10-this.block/3, this.block/5, this.block/3);
			} else if (Snake.direction === RIGHT) {
				this.world.ctx.fillRect(this.loc.x+this.block-this.block/10-this.block/3, this.loc.y+this.block/10, this.block/3, this.block/5);
				this.world.ctx.fillRect(this.loc.x+this.block-this.block/10-this.block/3, this.loc.y+(this.block-this.block/10-this.block/5), this.block/3, this.block/5);
			} else if (Snake.direction === LEFT) {
				this.world.ctx.fillRect(this.loc.x+this.block/10, this.loc.y+this.block/10, this.block/3, this.block/5);
				this.world.ctx.fillRect(this.loc.x+this.block/10, this.loc.y+(this.block-this.block/10-this.block/5), this.block/3, this.block/5);
			}
		},

		addPoints: function() {
			this.size++;
			this.len++;
			scores.innerHTML = this.len;
		}

	};

	Food = function(width, height, world, color) {
		this.width = width;
		this.height = height;
		this.world = world;
		this.color = color;
	};

	Food.prototype = {

		update: function() {
			// Check for food
			for (var i = 0, len = this.world.foods.length; i < len; i += 1) {
				if (this.world.foods[i][0] === this.world.snake.loc.x &&
					this.world.foods[i][1] === this.world.snake.loc.y) {
					this.world.snake.addPoints();
					this.world.foods.splice(i, 1);
					break;
				}
			}
		},

		draw: function() {
			// Draw food
			for (var i = 0, len = this.world.foods.length; i < len; i += 1) {
				this.world.ctx.fillStyle = this.color;
				this.world.ctx.fillRect(this.world.foods[i][0], this.world.foods[i][1], this.width, this.height);
			}
		},

		generateFood: function() {
			// Generate food
			if (this.world.foods.length < this.world.maxFood && Math.round(Math.random()*23) == Math.round(Math.random()*23)) {
				var loc = Vec2.getRandom(this.world.width, this.world.height, 20);
				this.world.foods.push([loc.x, loc.y]);
			}
			this.update();
			this.draw();
		}
	};

	World = function(canvas) {
		this.canvas = canvas;
		this.frameRate = 18;
		this.ctx = canvas.getContext("2d");
		this.width = canvas.width;
		this.height = canvas.height;
		this.controll = {};
		this.snake = undefined;
		this.food = undefined;
		this.maxFood = 7;
		this.foods = [];
	};

	World.active = false;

	World.prototype = {

		grid: function(fieldWidth, fieldHeight) {
			var fw = fieldWidth, fh = fieldHeight;

			for (var i = 0; i < this.height - fh / 2; i += fh) {
				this.ctx.beginPath();
				this.ctx.strokeStyle = "#444";
				this.ctx.strokeWidth = 1;
				this.ctx.moveTo(0, i);
				this.ctx.lineTo(this.width, i);
				this.ctx.stroke();
			}

			for (var j = 0; j < this.width - fw / 2; j += fw) {
				this.ctx.beginPath();
				this.ctx.strokeStyle = "#444";
				this.ctx.strokeWidth = 1;
				this.ctx.moveTo(j, 0);
				this.ctx.lineTo(j, this.height);
				this.ctx.stroke();
			}
		},

		stopEarthquake: function(fl) {
		},

		earthquake: function() {
		},

		addObject: function(obj, constructor) {
			this.snake = new constructor(obj);
			this.food = new Food(20, 20, this, "#898989");
		},

		start: function() {
			this.tick();
		},

		tick: function() {
			if (World.active) {
				this.update();
				this.draw();
				this.food.generateFood();
				return setTimeout(this.tick.bind(this), 1100/this.frameRate);
			}
		},

		crash: function() {
			scores.innerHTML = "Game over!";
			World.active = false;

			this.snake = undefined;
			this.food = undefined;
			this.foods = [];
		},

		update: function() {
			// Update snake position
			this.snake.update();
		},

		draw: function() {
			this.ctx.clearRect(0, 0, this.width, this.height);
			this.ctx.fillStyle = "rgb(190,190,190)";

			// Draw snake
			this.snake.draw();

			// Draw grid
			this.grid(20, 20);

			this.ctx.stroke();
		},

		resize: function() {
			this.canvas.setAttribute("width", Vec2.multiple(window.innerWidth - 160, 20));
			this.canvas.setAttribute("height", Vec2.multiple(window.innerHeight - 120, 20));
							
			this.width = this.canvas.width;
			this.height = this.canvas.height;
		}

	};

	document.getElementById("canvas").setAttribute("width",Vec2.multiple(screen.availWidth-160, 20));
	document.getElementById("canvas").setAttribute("height",Vec2.multiple(screen.availHeight-160, 20));

	var eath = new World(document.getElementById("canvas"));
	scores.innerHTML = "Touch enter for new game";

	window.addEventListener("resize", function() {
		eath.resize();
	});
	
	window.addEventListener("mouseenter", function() {
		document.getElementsByTagName("body").style.cursor = 'none';
	});

	window.addEventListener("keydown", function(e) {
		if (!World.active && e.keyCode === 13) {
			World.active = true;
			Snake.direction = RIGHT;
			scores.innerHTML = "0";

			// Add Snake in world
			eath.addObject({
				width: 20, height: 20,
				loc: new Vec2(100, 120),
				step: 20, size: 7, world: eath }, Snake);

			// Start game
			eath.start();

			// Detect backwards
		} else if (e.keyCode === 38 && Snake.direction !== UP && Snake.direction !== DOWN) {
			Snake.direction = UP;
		} else if (e.keyCode === 40 && Snake.direction !== DOWN && Snake.direction !== UP) {
			Snake.direction = DOWN;
		} else if (e.keyCode === 37 && Snake.direction !== LEFT && Snake.direction !== RIGHT) {
			Snake.direction = LEFT;
		} else if (e.keyCode === 39 && Snake.direction !== RIGHT && Snake.direction !== LEFT) {
			Snake.direction = RIGHT;
		}
	}, false);


}).call(this);

