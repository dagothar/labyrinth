"use strict";

var App = (function() {
  
  //! Configuration.
  var CONFIG = {
    VIEW_WIDTH:     800,
    VIEW_HEIGHT:    600,
    MAZE_WIDTH:     10,
    MAZE_HEIGHT:    10,
    CELL_SIZE:      10,
    PATH_WIDTH:     8,
    WALL_COLOR:     '#000000', //'rgba(0, 0, 0, 1)',
    PATH_COLOR:     '#ffffff', //'rgba(255, 255, 255, 1)',
    VIEW_ID:        '#view',
    GENERATE_ID:    '.button-generate',
    MAZE_WIDTH_ID:  '#maze-width',
    MAZE_HEIGHT_ID: '#maze-height',
    CELL_SIZE_ID:   '#cell-size',
    PATH_WIDTH_ID:  '#path-width',
    WALL_COLOR_ID:  '#wall-color',
    PATH_COLOR_ID:  '#path-color',
  };
  
 
  /**
   * @brief Constructor.
   */
  function App() {
    this._viewContainer = undefined;
    this._view = undefined;
    this._backgroundLayer = undefined;
    this._mazeLayer = undefined;
    this._maze = undefined;
    this._mazeWidth = CONFIG.MAZE_WIDTH;
    this._mazeHeight = CONFIG.MAZE_HEIGHT;
    this._cellSize = CONFIG.CELL_SIZE;
    this._pathWidth = CONFIG.PATH_WIDTH;
    this._wallColor = CONFIG.WALL_COLOR;
    this._pathColor = CONFIG.PATH_COLOR;
  };
  
  
  App.prototype._initialize = function() {
    var self = this;
  
    // create maze
    this._maze = new Maze(this._mazeWidth, this._mazeHeight);
    this._maze.make();
    
    // create view
    this._viewContainer = $(CONFIG.VIEW_ID).get(0);
    this._view = new Concrete.Viewport({
      container: this._viewContainer,
      width: CONFIG.VIEW_WIDTH,
      height: CONFIG.VIEW_HEIGHT
    });
    this._backgroundLayer = new Concrete.Layer();   this._backgroundLayer.setSize(CONFIG.VIEW_WIDTH, CONFIG.VIEW_HEIGHT);
    this._mazeLayer = new Concrete.Layer();
    this._view.add(this._backgroundLayer).add(this._mazeLayer);
    
    // bind UI
    $(CONFIG.GENERATE_ID).click(function() { self._newMaze(); });
    $(CONFIG.MAZE_WIDTH_ID).val(this._mazeWidth).change(function() { self._newMaze(); });
    $(CONFIG.MAZE_HEIGHT_ID).val(this._mazeHeight).change(function() { self._newMaze(); });
    $(CONFIG.CELL_SIZE_ID).val(this._cellSize).on('input change', function() { self._update(); });
    $(CONFIG.PATH_WIDTH_ID).val(this._pathWidth).on('input change', function() { self._update(); });
    $(CONFIG.WALL_COLOR_ID).spectrum({ showAlpha: true }).val(this._wallColor).on('input change', function() { self._update(); });
    $(CONFIG.PATH_COLOR_ID).spectrum({ showAlpha: true }).val(this._pathColor).on('input change', function() { self._update(); });
  };
  
  
  App.prototype._newMaze = function() {
    this._maze = new Maze(this._mazeWidth, this._mazeHeight);
    this._maze.make();
    this._update();
  };
  
  
  App.prototype._drawMaze = function() {
    var ctx = this._mazeLayer.scene.context;
    
    ctx.save();
    ctx.clearRect(0, 0, CONFIG.VIEW_WIDTH, CONFIG.VIEW_HEIGHT);
    this._maze.render(ctx, this._cellSize, this._pathWidth, this._wallColor, this._pathColor);
    ctx.restore();
  };
  
  
  App.prototype._update = function() {
    this._cellSize = $(CONFIG.CELL_SIZE_ID).val();
    this._pathWidth = $(CONFIG.PATH_WIDTH_ID).val();
    this._wallColor = $(CONFIG.WALL_COLOR_ID).spectrum('get').toRgbString();
    this._pathColor = $(CONFIG.PATH_COLOR_ID).spectrum('get').toRgbString();
    
    this._drawMaze();
  };
  
  
  App.prototype.run = function() {
    this._initialize();
    this._update();
  };
  
  
  return App;
} ());

