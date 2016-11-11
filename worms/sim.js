// keep the canvas at the same size as the page
(function() {
    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
    }
    resizeCanvas();
})();


var Simulation = {};

Simulation.initialize = function () {
	INITIAL_COUNT = 5
	this.agents = [];
	this.canvas = document.getElementById("canvas")
	this.ctx = this.canvas.getContext("2d");
	this.fps = 60;
	this.n = INITIAL_COUNT;
	this.initializeSimulation();
}

Simulation.initializeSimulation () {
	document.getElementById('agent_count').textContent = Simulation.n
}

Simulation.update () {
	dt = 0.01;
}


Simulation.draw () {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

Simulation.run () {
	Simulation.update();
	Simulation.draw();
}

Simulation.initialize()

d3.interval(Simulation.run, 1000/Simulation.fps)
document.getElementById('increase_agent_count').onclick = function(){
    Simulation.n=math.min(Simulation.n+1, 10);
    Simulation.initializeSimulation();
};
document.getElementById('decrease_agent_count').onclick = function(){
    Simulation.n=math.max(Simulation.n-1, 1);
    Simulation.initializeSimulation();
};
/*
imgData= this.ctx.createImageData(100,100);
for (var i=0;i<imgData.data.length;i+=4)
  {
  imgData.data[i+0]=255;
  imgData.data[i+1]=0;
  imgData.data[i+2]=0;
  imgData.data[i+3]=255;
  }
ctx.putImageData(imgData,10,10);
*/