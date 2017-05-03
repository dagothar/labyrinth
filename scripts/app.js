"use strict";

var App = (function() {
 
  /**
   * @brief Constructor.
   */
  function App() {
  };
  
  
  App.prototype._initialize = function() {
    
  };
  
  
  App.prototype._update = function() {
    
  };
  
  
  App.prototype.run = function() {
    var maze = new Maze(10, 10);
    console.log(maze.data);
    maze.make(0, 0, null);
    console.log(maze.data);
    var ctx = $('#tmp').get(0).getContext('2d');
    maze.render(ctx);
  };
  
  
  return App;
} ());

