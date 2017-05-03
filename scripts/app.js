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
    var maze = new Maze(48, 64);
    maze.make();
    var img = new Image();
    img.src = 'images/dagothar.jpg';
    console.log(img);
    var self = this;
    img.onload = function() { self._backgroundLayer.scene.context.drawImage(img, 0, 0); };
    self._backgroundLayer.scene.context.scale(0.5, 0.5);
    maze.render(this._mazeLayer.scene.context, 5, 1, 'rgba(128, 128, 128, 1)', 'rgba(255, 255, 255, 1)');
  };
  
  
  return App;
} ());

