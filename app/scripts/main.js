/* global PIXI */
/* global MainLoop */
/* exported game */
'use strict';

var game = (function(){
	var ROTATION_SPEED = 0.1;
	var MAX_SPEED = 5;
	var ACCELERATION = 0.1;
	var PI = 3.14159265359;

	var renderer;
	var stage;
	var playerShip;
	var shots = [];
	var ships = [];
	var stageSize = { x: 800, y: 600 };

	function Ship(isPlayer) {
		this.isPlayer = isPlayer || false;
		this.texture = PIXI.Texture.fromImage('images/speedship.png');
		this.model = new PIXI.Sprite(this.texture);

		this.model.position.x = 400;
		this.model.position.y = 300;

		this.model.scale.x = 0.5;
		this.model.scale.y = 0.5;

		this.model.anchor.x = 0.5;
		this.model.anchor.y = 0.5;

		this.rotating = {};
		this.rotating.left = false;
		this.rotating.right = false;

		this.accelerating = false;
		this.decelerating = false;

		this.shooting = false;

		this.speed = 0;

		this.direction = {};
		this.direction.x = 0;
		this.direction.y = 1;

		if(this.isPlayer) {
			playerShip = this;
		}
	}	

	Ship.prototype.move = function() {
		if(this.rotating.left) {
			this.model.rotation -= ROTATION_SPEED;

			if(this.model.rotation < -PI){
				this.model.rotation = PI;
			}
		}

		if(this.rotating.right) {
			this.model.rotation += ROTATION_SPEED;

			if(this.model.rotation > PI) {
				this.model.rotation = -PI;
			}
		}

		this.direction.x = Math.sin(this.model.rotation);
		this.direction.y = -Math.cos(this.model.rotation);

		if(this.accelerating) {
			this.speed = Math.min(MAX_SPEED, this.speed + ACCELERATION);
		}

		if(this.decelerating) {
			this.speed = Math.max(0, this.speed - ACCELERATION);
		}

		this.model.position.x += this.speed * this.direction.x;
		this.model.position.y += this.speed * this.direction.y;

		if(this.model.position.x < 0) {
			this.model.position.x = stageSize.x;
		} else if (this.model.position.x > stageSize.x) {
			this.model.position.x = 0;
		}

		if(this.model.position.y < 0) {
			this.model.position.y = stageSize.y;
		} else if (this.model.position.y > stageSize.y) {
			this.model.position.y = 0;
		}

		if(this.shooting) {
			var shot = new Shot(this.direction, this.model.position);
			shots.push(shot);
			this.shooting = false;
		}
	};	

	function Shot (direction, position) {
		this.color = 0xFFFFFF;
		this.radius = 1.5;
		this.speed = MAX_SPEED * 1.5;
		this.disposed = false;

		this.model = new PIXI.Graphics();
		this.model.beginFill(this.color);
		this.model.drawCircle(position.x, position.y, this.radius);
		stage.addChild(this.model);

		this.direction = { x: direction.x, y: direction.y };
	}

	Shot.prototype.move = function() {
		if(this.disposed) {
			return;
		}

		this.model.position.x += this.speed * this.direction.x;
		this.model.position.y += this.speed * this.direction.y;
	};

	function init () {
		renderer = new PIXI.WebGLRenderer(stageSize.x, stageSize.y);
		document.body.appendChild(renderer.view);	
		stage = new PIXI.Container();
		var ship = new Ship(true);
		addShip(ship);		

		$(document).keydown(keyDown);
		$(document).keyup(keyUp);

		MainLoop.setUpdate(update).setDraw(animate).start();
	}

	function addShip(ship) {		
		ships.push(ship);
		stage.addChild(ship.model);
	}

	function animate () {
		renderer.render(stage);
	}

	function update() {
		playerShip.move();

		for(var index = 0; index < shots.length; index++) {
			shots[index].move();
		}
	}

	function startGame() {
		console.log('Starting Game');
	}

	function keyDown(event){
		/*
			W: 87
			S: 83
			A: 65
			D: 68
		*/
		switch(event.which) {
			case 87:
				playerShip.accelerating = true;
				break;
			case 83:
				playerShip.decelerating = true;
				break;
			case 65:
				playerShip.rotating.left = true;
				break;
			case 68:
				playerShip.rotating.right = true;
				break;
			case 32:
				playerShip.shooting = true;
				break;
		}
	}

	function keyUp(event) {		
		switch(event.which) {
			case 87:
				playerShip.accelerating = false;
				break;
			case 83:
				playerShip.decelerating = false;
				break;
			case 65:
				playerShip.rotating.left = false;
				break;
			case 68:
				playerShip.rotating.right = false;
				break;
			case 32:
				playerShip.shooting = false;
				break;
		}
	}

	$(function(){
		init();
	});

	function getPlayerShip () {
		return playerShip;
	}

	return {
		start: startGame,
		getPlayerShip: getPlayerShip
	};
})();

