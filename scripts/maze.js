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
  
  
  Maze.prototype.make = function(x, y, cb) {
    var current = this.data[x][y];
    var neighbours = this.findNeighbours(current.position.x, current.position.y);
    var path = [current];
    
    current.visited = true;
    while (current != null || neighbours.length > 0) {
      if (neighbours.length > 0) {  // pick random neighbour
        var next = neighbours[Math.floor(neighbours.length * Math.random())];
        next.visited = true;
        next.parent = current;
        next.connections.push(current);
        current.connections.push(next);
        current = next;
        neighbours = this.findNeighbours(current.position.x, current.position.y);
      } else {                      // backtrack
        current = current.parent;
        if (current != null) neighbours = this.findNeighbours(current.position.x, current.position.y);
      }
    }
  };
  

  Maze.prototype.render = function(ctx, passWidth, passColor, wallColor) {
    var passWidth = passWidth  || 5;
    var passColor = passColor || 'white';
    var wallColor = wallColor || 'black';
    var off = 1.5*passWidth;
    
    ctx.save();
    ctx.fillStyle = wallColor;
    ctx.fillRect(0, 0, 2*(this.width+0.5)*passWidth, 2*(this.height+0.5)*passWidth);
    ctx.strokeStyle = passColor;
    ctx.lineWidth = passWidth;
    ctx.lineCap = 'square';
    for (var i = 0; i < this.width; ++i) {
      for (var j = 0; j < this.height; ++j) {
        var current = this.data[i][j];
        for (var k = 0; k < current.connections.length; ++k) {
          ctx.moveTo(2*passWidth*current.position.x+off, 2*passWidth*current.position.y+off);
          ctx.lineTo(2*passWidth*current.connections[k].position.x+off, 2*passWidth*current.connections[k].position.y+off);
          ctx.stroke();
        }
      }
    }
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

