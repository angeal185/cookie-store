//animated background
function initParticles() {

  function particle(obj){

    function Particles() {

      this.colors = obj.colors;
      this.blurry = obj.blurry;
      this.border = obj.border;
      this.minRadius = obj.minRadius;
      this.maxRadius = obj.maxRadius;
      this.minOpacity = obj.minOpacity;
      this.maxOpacity = obj.maxOpacity;
      this.minSpeed = obj.minSpeed;
      this.maxSpeed = obj.maxSpeed;
      this.fps = obj.fps.fps;
      this.numParticles = obj.numParticles;
      this.canvas = document.getElementById(obj.cnv);
      this.ctx = this.canvas.getContext('2d');
    }

    Particles.prototype.init = function() {
      this.render();
      this.createCircle();
    }

    Particles.prototype._rand = function(min, max) {
      return Math.random() * (max - min) + min;
    }

    Particles.prototype.render = function() {
      var self = this,
        wHeight = $(window).height(),
        wWidth = $(window).width();

      self.canvas.width = wWidth;
      self.canvas.height = wHeight;

      $(window).on('resize', self.render);
    }

    Particles.prototype.createCircle = function() {
      var particle = [];

      for (var i = 0; i < this.numParticles; i++) {
        var self = this,
          color = self.colors[~~(self._rand(0, self.colors.length))];

        particle[i] = {
          radius: self._rand(self.minRadius, self.maxRadius),
          xPos: self._rand(0, canvas.width),
          yPos: self._rand(0, canvas.height),
          xVelocity: self._rand(self.minSpeed, self.maxSpeed),
          yVelocity: self._rand(self.minSpeed, self.maxSpeed),
          color: 'rgba(' + color + ',' + self._rand(self.minOpacity, self.maxOpacity) + ')'
        }
        self.draw(particle, i);
      }
      self.animate(particle);
    }

    Particles.prototype.draw = function(particle, i) {
      var self = this,
        ctx = self.ctx;
      if (self.blurry === true) {
        var grd = ctx.createRadialGradient(particle[i].xPos, particle[i].yPos, particle[i].radius, particle[i].xPos, particle[i].yPos, particle[i].radius / 1.25);
        grd.addColorStop(1.000, particle[i].color);
        grd.addColorStop(0.000, 'rgba(' + obj.dotBorder + ')');
        ctx.fillStyle = grd;
      } else {
        ctx.fillStyle = particle[i].color;
      }
      if (self.border === true) {
        ctx.strokeStyle = obj.strokeStyle;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(particle[i].xPos, particle[i].yPos, particle[i].radius, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    Particles.prototype.animate = function(particle) {
      var self = this,
        ctx = self.ctx;
      setInterval(function() {
        self.clearCanvas();
        for (var i = 0; i < self.numParticles; i++) {
          particle[i].xPos += particle[i].xVelocity;
          particle[i].yPos -= particle[i].yVelocity;
          if (particle[i].xPos > self.canvas.width + particle[i].radius || particle[i].yPos > self.canvas.height + particle[i].radius) {
            self.resetParticle(particle, i);
          } else {
            self.draw(particle, i);
          }
        }
      }, obj.fps.time / self.fps);
    }

    Particles.prototype.resetParticle = function(particle, i) {
      var self = this;
      var random = self._rand(0, 1);
      if (random > .5) {
        particle[i].xPos = -particle[i].radius;
        particle[i].yPos = self._rand(0, canvas.height);
      } else {
        particle[i].xPos = self._rand(0, canvas.width);
        particle[i].yPos = canvas.height + particle[i].radius;
      }
      self.draw(particle, i);
    }

    Particles.prototype.clearCanvas = function() {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    new Particles().init();
  }
  csl.get(function(i) {
    try {
      let obj = i.config.cnv;
      particle(i.config.cnv)
    } catch (e) {
      if (e) {
        $.getJSON(urls.cnvConfig, function(data, textStatus) {
          i.config.cnv = data;
          csl.set(i)
          particle(data)
          console.log('prt not found!')
        })
      }
    }
  });
}
