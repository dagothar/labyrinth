"use strict";

var App = (function() {
  
  //! Configuration.
  var CONFIG = {
    VIEW_WIDTH:     800,
    VIEW_HEIGHT:    600,
    MAZE_WIDTH:     25,
    MAZE_HEIGHT:    25,
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
    BG_UPLOAD_ID:   '#bg-upload',
    BG_CLEAR_ID:    '.button-clear',
    MAZE_ANIMATE_ID:'.button-animate',
    ANGLE_ID:       '#angle',
    X_SCALE_ID:     '#x-scale',
    Y_SCALE_ID:     '#y-scale',
    X_TRANS_ID:     '#x-translation',
    Y_TRANS_ID:     '#y-translation',
    SPEED_ID:       '.speed',
    SPEED_SLIDER_ID:'#slider-speed',
    DISTR_COLOR:    'rgba(0, 0, 255, 0.2)',
    DISTR_RADIUS:   10,
    SPEED:          10,
    DOWNLOAD_ID:    '.button-download'
  };
  
 
  /**
   * @brief Constructor.
   */
  function App() {
    this._viewContainer = undefined;
    this._view = undefined;
    this._backgroundLayer = undefined;
    this._mazeLayer = undefined;
    this._theseusLayer = undefined;
    this._maze = undefined;
    this._mazeWidth = CONFIG.MAZE_WIDTH;
    this._mazeHeight = CONFIG.MAZE_HEIGHT;
    this._cellSize = CONFIG.CELL_SIZE;
    this._pathWidth = CONFIG.PATH_WIDTH;
    this._wallColor = CONFIG.WALL_COLOR;
    this._pathColor = CONFIG.PATH_COLOR;
    this._theseus = {
      x: 0,
      y: 0
    };
    this._moveModeInt = undefined; // path animation
    this._mazeAnimate = false;
    this._mazeAnimateInt = undefined;
    this._makeSteps = 1;
    this._speed = CONFIG.SPEED;
    this._path = [];
  };
  
  
  App.prototype._initialize = function() {
    var self = this;
  
    // create maze
    this._maze = new Maze(this._mazeWidth, this._mazeHeight, 9999999, function(x, y) { return self._randomOffset(self, x, y); });
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
    this._theseusLayer = new Concrete.Layer();
    this._view.add(this._backgroundLayer).add(this._mazeLayer).add(this._theseusLayer);
    
    // bind UI
    $(CONFIG.GENERATE_ID).click(function() {
      clearInterval(self._mazeAnimateInt);
      self._newMaze();
    });
    
    $(CONFIG.MAZE_WIDTH_ID).val(this._mazeWidth).on('change', function() {
      var newMazeWidth = $(this).val();
      var mazeDim = self._calculateMazeDimensions(newMazeWidth, self._mazeHeight, self._cellSize);
      if (newMazeWidth < 1
        || mazeDim.width >= CONFIG.VIEW_WIDTH
      ) {
        $(this).val(self._mazeWidth);
      } else {
        self._mazeWidth = newMazeWidth;
        if (self._theseus.x >= newMazeWidth) self._theseus.x = newMazeWidth-1;
        self._newMaze();
      }
    });
    
    $(CONFIG.MAZE_HEIGHT_ID).val(this._mazeHeight).on('change', function() {
      var newMazeHeight = $(this).val();
      var mazeDim = self._calculateMazeDimensions(self._mazeWidth, newMazeHeight, self._cellSize);
      if (newMazeHeight < 1
        || mazeDim.height >= CONFIG.VIEW_HEIGHT
      ) {
        $(this).val(self._mazeHeight);
      } else {
        self._mazeHeight = newMazeHeight;
        if (self._theseus.y >= newMazeHeight) self._theseus.y = newMazeHeight-1;
        self._newMaze();
      }
    });
    
    $(CONFIG.CELL_SIZE_ID).val(this._cellSize).on('input change', function() {
      var newCellSize = $(this).val();
      var newPathWidth = newCellSize - (self._cellSize-self._pathWidth);
      var mazeDim = self._calculateMazeDimensions(self._mazeWidth, self._mazeHeight, newCellSize);
      if (newPathWidth < 1
        || newCellSize < 1
        || mazeDim.width >= CONFIG.VIEW_WIDTH
        || mazeDim.height >= CONFIG.VIEW_HEIGHT
      ) {
        $(this).val(self._cellSize);
      } else {
        self._cellSize = newCellSize;
        self._pathWidth = newPathWidth;
        $(CONFIG.PATH_WIDTH_ID).val(newPathWidth);
        self._update();
      }
    });
    
    $(CONFIG.PATH_WIDTH_ID).val(this._pathWidth).on('input change', function() {
      var newPathWidth = $(this).val();
      if (newPathWidth < 1
        || newPathWidth > self._cellSize-1
      ) {
        $(this).val(self._pathWidth);
      } else {
        self._pathWidth = newPathWidth;
        self._update();
      }
    });
    
    $(CONFIG.WALL_COLOR_ID).spectrum({ showAlpha: true }).val(this._wallColor).on('input change', function() { self._update(); });
    $(CONFIG.PATH_COLOR_ID).spectrum({ showAlpha: true }).val(this._pathColor).on('input change', function() { self._update(); });
    
    $(CONFIG.BG_UPLOAD_ID).change(function() {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var img = new Image();
          img.src = e.target.result;
          img.onload = function() {
            var dx = (CONFIG.VIEW_WIDTH-img.width)/2;
            var dy = (CONFIG.VIEW_HEIGHT-img.height)/2;
            self._backgroundLayer.scene.context.clearRect(0, 0, CONFIG.VIEW_WIDTH, CONFIG.VIEW_HEIGHT);
            self._backgroundLayer.scene.context.drawImage(img, dx, dy);
          };
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
    
    $(CONFIG.BG_CLEAR_ID).click(function() {
      self._backgroundLayer.scene.context.clearRect(0, 0, CONFIG.VIEW_WIDTH, CONFIG.VIEW_HEIGHT);
    });
    
    $(window).keypress(function(e) {
      var x = self._theseus.x;
      var y = self._theseus.y;
      
      var keycode = event.keyCode || event.which;
      if (keycode == 119) { // W
        if (y > 0 && !(self._maze.getCell(x, y).walls & 0x01))
          --self._theseus.y;
      }
      if (keycode == 115) { // S
        if (y < self._mazeHeight-1 && !(self._maze.getCell(x, y).walls & 0x02))
          ++self._theseus.y;
      }
      if (keycode == 97) { // A
        if (x > 0 && !(self._maze.getCell(x, y).walls & 0x04))
          --self._theseus.x;
      }
      if (keycode == 100) { // D
        if (x < self._mazeWidth-1 && !(self._maze.getCell(x, y).walls & 0x08))
          ++self._theseus.x;
      }
      clearInterval(self._moveModeInt);
      self._drawTheseus();
    });
    
    $(CONFIG.VIEW_ID).click(function(e) {
      var coord = self._getCellCoordinates({x: e.clientX, y: e.clientY});
      if (coord.x < 0 || coord.x >= self._mazeWidth || coord.y < 0 || coord.y >= self._mazeHeight) return;
      self._path = self._maze.getPath(coord, {x: self._theseus.x, y: self._theseus.y});
      self._path.pop();
      clearInterval(self._mazeAnimateInt);
      self._playPath(self._path);
    });
    
    $(CONFIG.MAZE_ANIMATE_ID).click(function() {
      self._mazeAnimate ^= true;
      if (self._mazeAnimate) {
        self._makeSteps = 1;
      } else {
        self._makeSteps = 9999999;
      }
      $(this).text('Animate: ' + (self._mazeAnimate ? 'ON' : 'OFF'));
      //clearInterval(self._mazeAnimateInt);
    });
    
    $(CONFIG.SPEED_ID).text(self._speed.toFixed(1) + ' [ms]');
    
    $(CONFIG.SPEED_SLIDER_ID).on('input change', function() {
      var val = parseInt($(this).val());
      self._speed = 1000 * Math.pow(1.047129, -val);
      $(CONFIG.SPEED_ID).text(self._speed.toFixed(1) + ' [ms]');
      if (self._moveModeInt) self._playPath(self._path);
      if (self._mazeAnimateInt) {
        clearInterval(self._mazeAnimateInt);
        self._mazeAnimateInt = setInterval(function() { self._newMazeStep(); }, self._speed);
      }
    });
    
    $(CONFIG.DOWNLOAD_ID).click(function() { self._download(); });
  };
  
  
  App.prototype._newMazeStep = function() {
    var self = this;
    var current = self._maze.make(self._theseus.x, self._theseus.y, self._makeSteps, function(x, y) { return self._randomOffset(self, x, y); });
    if (current == null) {
      clearInterval(self._mazeAnimateInt);
      self._update();
      return;
    }
    self._theseus.x = current.x;
    self._theseus.y = current.y;
    self._update();
    
    // draw distribution shade
    self._drawDistribution(current.x, current.y);    
  };
  
  
  App.prototype._newMaze = function() {
    var self = this;
    clearInterval(this._moveModeInt);
    
    this._maze = new Maze(this._mazeWidth, this._mazeHeight);
    
    if (!this._mazeAnimate) {
      this._maze.make(this._theseus.x, this._theseus.y, 9999999, function(x, y) { return self._randomOffset(self, x, y); });
      this._update();
    } else {
      
      clearInterval(this._mazeAnimateInt);
      this._mazeAnimateInt = setInterval(function() { self._newMazeStep(); }, this._speed);
    }
  };
  
  
  App.prototype._calculateMazeDimensions = function(w, h, cs) {
    return {
      width: w*cs,
      height: h*cs
    };
  };
  
  
  App.prototype._getCellCoordinates = function(mousePos) {
    var boundingRect = $(CONFIG.VIEW_ID).get(0).getBoundingClientRect();
    var dim = this._calculateMazeDimensions(this._mazeWidth, this._mazeHeight, this._cellSize);
    var mouseX = Math.floor(mousePos.x - boundingRect.left - (CONFIG.VIEW_WIDTH-dim.width)/2);
    var mouseY = Math.floor(mousePos.y - boundingRect.top - (CONFIG.VIEW_HEIGHT-dim.height)/2);
      
    return {
      x: Math.floor(mouseX / this._cellSize),
      y: Math.floor(mouseY / this._cellSize)
    };
  };
  
  
  function randn() {
    return Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random());
  }
  
  
  App.prototype._getDistributionParameters = function(self, x, y) {
    // initialize useful variables
    var cx = Math.floor(self._mazeWidth/2);
    var cy = Math.floor(self._mazeHeight/2);
    
    // calculate angle
    var fi = eval($(CONFIG.ANGLE_ID).val());
    if (isNaN(fi)) fi = 0;
    
    //calculate scale
    var sx = eval($(CONFIG.X_SCALE_ID).val());
    if (isNaN(sx) || sx == 0) sx = 1;
    var sy = eval($(CONFIG.Y_SCALE_ID).val());
    if (isNaN(sy) || sy == 0) sy = 1;
    
    // calculate translation
    var tx = eval($(CONFIG.X_TRANS_ID).val());
    if (isNaN(tx)) tx = 0;
    var ty = eval($(CONFIG.Y_TRANS_ID).val());
    if (isNaN(ty)) ty = 0;

    return {
      fi: fi,
      sx: sx,
      sy: sy,
      tx: tx,
      ty: ty
    };
  };
  
  
  App.prototype._randomOffset = function(self, x, y) {
    // initial random offset
    var _x = randn();
    var _y = randn();
    
    var params = self._getDistributionParameters(self, x, y);
    
    // calculate offset
    var nx = params.sx*Math.cos(params.fi) * _x - params.sy*Math.sin(params.fi) * _y + params.tx;
    var ny = params.sx*Math.sin(params.fi) * _x + params.sy*Math.cos(params.fi) * _y + params.ty;

    return {
      x: nx,
      y: ny
    };
  };
  
  
  App.prototype._drawMaze = function() {
    var ctx = this._mazeLayer.scene.context;
    var dim = this._calculateMazeDimensions(this._mazeWidth, this._mazeHeight, this._cellSize);
    
    ctx.save();
    ctx.clearRect(0, 0, CONFIG.VIEW_WIDTH, CONFIG.VIEW_HEIGHT);
    ctx.translate((CONFIG.VIEW_WIDTH-dim.width)/2, (CONFIG.VIEW_HEIGHT-dim.height)/2);
    this._maze.render(ctx, this._cellSize, this._pathWidth, this._wallColor, this._pathColor);
    ctx.restore();
  };
  
  
  App.prototype._drawTheseus = function() {
    var ctx = this._theseusLayer.scene.context;
    var dim = this._calculateMazeDimensions(this._mazeWidth, this._mazeHeight, this._cellSize);
    
    ctx.save();
    ctx.clearRect(0, 0, CONFIG.VIEW_WIDTH, CONFIG.VIEW_HEIGHT);
    ctx.translate((CONFIG.VIEW_WIDTH-dim.width)/2, (CONFIG.VIEW_HEIGHT-dim.height)/2);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc((this._theseus.x+0.5)*this._cellSize, (this._theseus.y+0.5)*this._cellSize, this._cellSize/2-1, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  
  
  App.prototype._drawDistribution = function(x, y) {
    var ctx = this._theseusLayer.scene.context;
    var dim = this._calculateMazeDimensions(this._mazeWidth, this._mazeHeight, this._cellSize);
    var params = this._getDistributionParameters(this, x, y);
    var r = CONFIG.DISTR_RADIUS;
    
    ctx.save();
    ctx.translate((CONFIG.VIEW_WIDTH-dim.width)/2, (CONFIG.VIEW_HEIGHT-dim.height)/2);
    ctx.fillStyle = CONFIG.DISTR_COLOR;
    ctx.beginPath();
    ctx.translate((x+0.5)*this._cellSize+r*params.tx, (y+0.5)*this._cellSize+r*params.ty);
    ctx.rotate(params.fi);
    ctx.scale(params.sx, params.sy);
    
    ctx.arc(0, 0, CONFIG.DISTR_RADIUS, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  
  
  App.prototype._playPath = function(path) {
    var self = this;
    
    clearInterval(this._moveModeInt);
    this._moveModeInt = setInterval(function() {
      var step = path.pop();
      if (!step) {
        clearInterval(self._moveModeInt);
        return;
      }
      self._theseus.x = step.x;
      self._theseus.y = step.y;
      self._drawTheseus();
    }, this._speed);
  };
  
  
  App.prototype._download = (function() {
    var id = 0;
    return function() {
      this._view.toScene().download({ fileName: 'maze' + (id++).toFixed(0) + '.png' });
    };
  } ());
  
  
  App.prototype._update = function() {
    this._wallColor = $(CONFIG.WALL_COLOR_ID).spectrum('get').toRgbString();
    this._pathColor = $(CONFIG.PATH_COLOR_ID).spectrum('get').toRgbString();
    
    this._drawMaze();
    this._drawTheseus();
  };
  
  
  App.prototype.run = function() {
    this._initialize();
    this._update();
  };
  
  
  return App;
} ());

