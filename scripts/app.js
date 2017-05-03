"use strict";

var App = (function() {
 
  /**
   * @brief Constructor.
   */
  function App() {
    this._initialize();
  };
  
  
  App.prototype._initialize = function() {
    // create view
    this._viewContainer = $('#view').get(0);
    this._view = new Concrete.Viewport({
      container: this._viewContainer,
      width: 800,
      height: 600
    });
    this._backgroundLayer = new Concrete.Layer();   this._backgroundLayer.setSize(800, 600);
    this._mazeLayer = new Concrete.Layer();
    this._view.add(this._backgroundLayer).add(this._mazeLayer);
  };
  
  
  App.prototype._update = function() {
    
  };
  
  App.prototype.run = function() {
    var maze = new Maze(10, 10);
    
    var img = new Image();
    img.src = 'images/dagothar.jpg';
    console.log(img);
    var self = this;
    //img.onload = function() { self._backgroundLayer.scene.context.drawImage(img, 0, 0); };
    this._backgroundLayer.scene.context.scale(0.5, 0.5);
    this._backgroundLayer.scene.context.translate(800-240, 600-320);
    
    //this._mazeLayer.scene.context.translate(400-120, 300-160);
    
    //setInterval(function() {
    var maze = new Maze(50, 50);
    maze.make();
    self._mazeLayer.scene.context.clearRect(0, 0, 800, 600);
    maze.render(self._mazeLayer.scene.context, 10, 8, 'rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)');
    //}, 100);
    
    
  };
  
  
  return App;
} ());

