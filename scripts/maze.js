"use strict";

var Maze = (function() {
  
  var NEIGHBOURHOOD = [
    {x: -1, y: 0},
    {x: 1, y: 0},
    {x: 0, y: -1},
    {x: 0, y: 1}
  ];
  
  
  var Cell = function(x, y) {
    this.position = { x: x, y: y };
    this.visited = false;
    this.parent = null;
    this.connections = [];
  }
  
  
  function Maze(width, height) {
    var width = width || 10;
    var height = height || 10;
    
    this.width = width;
    this.height = height;
    this.data = [];
    for (var i = 0; i < width; ++i) {
      this.data.push([]);
      for (var j = 0; j < height; ++j) {
        this.data[i].push(new Cell(i, j));
      }
    }
  }
  
  
  function randn() {
    return Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random());
  }
  
  
  Maze.prototype.make = function(x, y, cb) {
    var x = x || 0;
    var y = y || 0;
    
    var current = this.data[x][y];
    var neighbours = this.findNeighbours(current.position.x, current.position.y);
    
    current.visited = true;
    while (current != null || neighbours.length > 0) {
      if (neighbours.length > 0) {  // pick random neighbour
      
        //var next = neighbours[Math.floor(neighbours.length * Math.random())];
        var next = null;
        while (!next) {
          var tx = randn();
          var ty = randn();
          
          var fi = 0;
          var sx = 1, sy = 1; //5*Math.abs(25-current.position.y)+1, sy = 5*Math.abs(25-current.position.x)+1;
          //var sx = 5*Math.abs(y/x)+1, sy = 5*Math.abs(y/x)+1;
      var nx = sx*Math.cos(fi) * tx - sy*Math.sin(fi) * ty ; //- 1.9*(current.position.x-25)/Math.abs(current.position.x-25 || 1);
          var ny = sx*Math.sin(fi) * tx + sy*Math.cos(fi) * ty; // - 1.9*(current.position.y-25)/Math.abs(current.position.y-25 || 1);
          
          if (ny > Math.abs(nx) && current.position.y < this.height-1 && !this.data[current.position.x][current.position.y+1].visited)
            next = this.data[current.position.x][current.position.y+1];
          if (ny < -Math.abs(nx) && current.position.y > 0 && !this.data[current.position.x][current.position.y-1].visited)
            next = this.data[current.position.x][current.position.y-1];
          if (nx > Math.abs(ny) && current.position.x < this.width-1 && !this.data[current.position.x+1][current.position.y].visited)
            next = this.data[current.position.x+1][current.position.y];
          if (nx < -Math.abs(ny) && current.position.x > 0 && !this.data[current.position.x-1][current.position.y].visited)
            next = this.data[current.position.x-1][current.position.y];
        }
        
        next.visited = true;
        next.parent = current.position;
        next.connections.push(current.position);
        current.connections.push(next.position);
        current = next;
        neighbours = this.findNeighbours(current.position.x, current.position.y);
      } else {                      // backtrack
        if (current.parent === null) break;
        current = this.data[current.parent.x][current.parent.y];
        neighbours = this.findNeighbours(current.position.x, current.position.y);
      }
      
      if (cb) cb(this, current);
    }
  };
  

  Maze.prototype.render = function(ctx, cellSize, passWidth, wallColor, passColor) {
    var passWidth = passWidth  || 5;
    var passColor = passColor || 'white';
    var wallColor = wallColor || 'black';
    var cellSize = cellSize || 10;
    
    var imgWidth = this.width*cellSize;
    var imgHeight = this.height*cellSize;
    var tmp = document.createElement('canvas');
    tmp.width = imgWidth;
    tmp.height = imgHeight;
    var tctx = tmp.getContext('2d');
    
    tctx.save();
    tctx.clearRect(0, 0, imgWidth, imgHeight);
    tctx.strokeStyle = passColor;
    tctx.lineWidth = passWidth;
    tctx.lineCap = 'square';
    
    tctx.beginPath();
    for (var i = 0; i < this.width; ++i) {
      for (var j = 0; j < this.height; ++j) {
        var current = this.data[i][j];
        for (var k = 0; k < current.connections.length; ++k) {
          tctx.moveTo(cellSize*(current.position.x+0.5), cellSize*(current.position.y+0.5));
          tctx.lineTo(cellSize*(current.connections[k].x+0.5), cellSize*(current.connections[k].y+0.5));
        }
      }
    }
    tctx.stroke();
    
    var imgData = tctx.getImageData(0, 0, imgWidth, imgHeight);
    var pColor = tinycolor(passColor);
    var wColor = tinycolor(wallColor).toRgb();
    for (var i = 0, len = imgData.data.length; i < len; i += 4) {
      var c = tinycolor({ r: imgData.data[i], g: imgData.data[i+1], b: imgData.data[i+2], a: imgData.data[i+3]/255.0});
      if (!tinycolor.equals(pColor, c)) {
        imgData.data[i] = wColor.r;
        imgData.data[i+1] = wColor.g;
        imgData.data[i+2] = wColor.b;
        imgData.data[i+3] = 255;
      }
    }
    tctx.putImageData(imgData, 0, 0);
    
    //tctx.fillStyle = wallColor;
    //tctx.globalCompositeOperation = 'xor';
    //tctx.fillRect(0, 0, imgWidth, imgHeight);
    
    tctx.restore();
    
    ctx.save();
    ctx.drawImage(tmp, 0, 0);
    ctx.restore();
  };
  
  
  Maze.prototype.findNeighbours = function(x, y) {
    var neighbours = [];
    
    for (var i = 0, n = NEIGHBOURHOOD.length; i < n; ++i) {
      if ((x+NEIGHBOURHOOD[i].x < 0) || (x+NEIGHBOURHOOD[i].x >= this.width)) continue;
      if ((y+NEIGHBOURHOOD[i].y < 0) || (y+NEIGHBOURHOOD[i].y >= this.height)) continue;
      var candidate = this.data[x+NEIGHBOURHOOD[i].x][y+NEIGHBOURHOOD[i].y];
      if (!candidate.visited) neighbours.push(candidate);
    }
    
    return neighbours;
  };
  
  
  return Maze;
} ());

