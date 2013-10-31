/*
*	App.js
*
* @author Bryan Rusk
* 
 */


var Puzzle = (function(){

	var board, board_w, board_h, tile_size, tiles_w, tiles_h, last, current;
	var image = new Image();
	

	function Puzzle(width, height, tileSize, image_url){
		board_w = width;
		board_h = height;
		tile_size = tileSize;
		tile_w = board_w/tile_size;
		tile_h = board_h/tile_size;
		image.src = image_url;

		var i, j;

		board = new Array(tile_w);
		for(i=0; i < tile_w; i++){
			board[i] = new Array(tile_h);
			for(j=0; j < tile_h; j ++){
				board[i][j] = new Tile(i,j);
			}
		}

		shuffle();
		empty = board[0][0];
		board[0][0].empty = true;
	};

	function shuffle(){
		var i, j, k, tmp;
		for(i=0; i < tile_w; i++){
			for (j = tile_h - 1; j > 0; j--) {
		        k = Math.floor(Math.random() * (j + 1));
		        tmp = board[i][j];
		        board[i][j] =  board[i][k];
		        board[i][k] = tmp;
		    }
		}
	}

	function slide(){
		//Check if slide is legal
		if ( (Math.abs(current[0] - last[0]) == 1 && current[1] - last[1] == 0) || 
			(current[0] - last[0] == 0 && Math.abs(current[1] - last[1]) == 1)){
			tmp = board[last[0]][last[1]]
			board[last[0]][last[1]] = board[current[0]][current[1]]
			board[current[0]][current[1]] = tmp
		}
	}

	function update(pos){
		
		var i = Math.floor(pos[0] / tile_size)
		var j = Math.floor(pos[1] / tile_size)
		if ( i >= 0 && i < tile_w && j >= 0 && j < tile_h ){
			if( !current ) {
				current = [i, j]
				board[i][j].selected = true;
			} else {
				last = current;
				current = [i, j];
				board[i][j].selected = true;
			}

			if ( last && board[current[0]][current[1]].empty ){
				slide(last, current)
			}
		}
	};

	function draw(ctx){
		var i, j, x, y, x_offset, y_offset, i_offset, j_offset;
		ctx.clearRect(0,0,board_w,board_h);
		for(i=0; i < tile_w; i++){
			for(j=0; j < tile_h; j++){
				if (board[i][j].empty){
					continue;
				}

				x = board[i][j].x;
				y = board[i][j].y;

				// Offset witin image
				x_offset = x * tile_size;
				y_offset = y * tile_size;

				// Offset within board
				i_offset = i * tile_size;
				j_offset = j * tile_size;

				ctx.drawImage(image, x_offset, y_offset, tile_size, tile_size, 
					i_offset, j_offset, tile_size, tile_size);
			}
		}
		
	};

	Puzzle.prototype = {
		draw : draw,
		update: update
	};

	return Puzzle;

}());

var Tile = (function(){
	function Tile(x,y){
		this.x = x;
		this.y = y;
		this.empty = false;
		this.selected = false;
	};

	function pos(){
		return [x,y];
	}

	function equals(tile){
		if (tile.x == this.x && tile.y == this.y ){
			return true;
		}

		return false;
	}

	Tile.prototype = {
		pos : pos
	};

	return Tile;
}());




var Game = (function(){

	
	var container, canvas, ctx, info, puzzle;
	var width = 1000;
	var height = 1000;

	function Game(){
		/*
			Initialize
		 */
	}


	function setup(){

		// Get container
		container = document.getElementById('container');
		container.style.margin = "0 auto";

		// Get canvas and set properties
		canvas = document.createElement('canvas');
		canvas.id = "screen";
		canvas.width = width;
		canvas.height = height;
		canvas.style.border = "1px solid black";
		
		ctx = canvas.getContext('2d');	


		puzzle = new Puzzle(1000, 1000, 200, "puzzle.jpg");

		container.appendChild(canvas);
	}

	function translatePos(frame, leapPos){
		var iBox = frame.interactionBox;

	    var left = iBox.center[0] - iBox.size[0]/2;
	    var top = iBox.center[1] + iBox.size[1]/2;

	    var x = leapPos[0] - left;
	    var y = leapPos[1] - top;

	    x /= iBox.size[0];
	    y /= iBox.size[1];

	    x *= width;
	    y *= height;

	    return [ x , -y ];
	}

	function drawPointer(pos){
		ctx.beginPath();
		ctx.arc(pos[0], pos[1] ,5,0,2*Math.PI);
 		ctx.stroke();
	}

	function detectPointer(frame){
		var i, pos;

		for(i=0, len=frame.pointables.length; i < len; i++){
	    	pos = translatePos(frame, frame.pointables[i].tipPosition);
	    }

		return pos;
	}

	function run(frame){

		// Do logic
		var pos = detectPointer(frame);
		if ( pos )
			puzzle.update(pos);
		//console.log(pos);

		// Render
		puzzle.draw(ctx);

		if( pos )
			drawPointer(pos);
	}

	function start() {
		setup();

		Leap.loop(run);
	}

	Game.prototype = {
		start : start
	}


	return Game;
}());
	


window.onload = function(){
	game = new Game();
	game.start();
}