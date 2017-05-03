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
    setInterval(function() {
    var maze = new Maze(10, 10);
    //console.log(maze.data);
    maze.make(5, 5, null);
    //console.log(maze.data);
    var ctx = $('#tmp').get(0).getContext('2d');
    maze.render(ctx, 10, 8);
    }, 100);
  };
  
  
  return App;
} ());

