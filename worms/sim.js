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
	INITIAL_COUNT = 1;
	this.n = INITIAL_COUNT;
	this.canvas = document.getElementById("canvas");
	this.ctx = this.canvas.getContext("2d");
	this.fps = 60;
	this.initializeSimulation();
};

Simulation.initializeSimulation = function() {
	document.getElementById('agent_count').textContent = Simulation.n
	this.ctx.clearRect(0, this.canvas.height*0.45, this.canvas.width, this.canvas.height * 0.35)
	this.image = this.ctx.getImageData(0, this.canvas.height*0.45, this.canvas.width, this.canvas.height * 0.5)
	this.agents = [];
	this.agent_radius = 25.
	this.ambient =  30.
	this.preferred = 37.
	this.mbr = 5.0
	for (var i=0; i < this.n; i++){
		y = 10*Math.random() + 0.65 * this.canvas.height;
		x = 10*Math.random() + 0.5 * this.canvas.width;
		theta = Math.random() * 2 * Math.PI;
		tb = 34.0;
		this.agents[i] = [x,y,theta,tb];
	}
};

Simulation.updateParameters = function() {
	document.getElementById('mbr').textContent = (Simulation.mbr).toFixed(2)
}

Simulation.update = function() {
	dt = 0.1;
	speed = 10;
	turning_speed = 1.0;
	spring = 0.4;
	n_sensors = 20

	for (var i = 0; i < this.n; i++){
		xi = this.agents[i][0];
		yi = this.agents[i][1];
		theta = this.agents[i][2]; // orientation of i
		tb_i = this.agents[i][3];

		dx = Math.cos(theta) * speed;
		dy = Math.sin(theta) * speed;

		sensors = Array(n_sensors).fill(this.ambient)

		for (var j = 0; j < this.n; j++){
			if (i!=j){
				xj = this.agents[j][0];
				yj = this.agents[j][1];
				tb_j = this.agents[j][3];

				xc = xj - xi
				yc = yj - yi

				d = Math.sqrt(Math.pow(xc,2) + Math.pow(yc,2));
				phi = Math.atan2(yc,xc) - Math.atan2(Math.sin(theta), Math.cos(theta))

				if (d < this.agent_radius * 2){
					if (d < this.agent_radius * 1.9){
						dx = dx - (xc) * spring * (this.agent_radius * 1.9 - d);
						dy = dy - (yc) * spring * (this.agent_radius * 1.9 - d);
					} 
					//found = 0
					for (var k = 0; k < n_sensors; k++){
						theta_sensor = theta + 2 * Math.PI*(k+0.5) / n_sensors
						sensor_x = xi + this.agent_radius * Math.cos(theta_sensor)
						sensor_y = yi + this.agent_radius * Math.sin(theta_sensor)
						sensor_dist = Math.sqrt(Math.pow(sensor_x-xj,2) + Math.pow(sensor_y-yj,2))
						if (sensor_dist < this.agent_radius){
							sensors[k] = tb_j
							/*found = 1       //may speed up the code!
						} elif (found == 1){ // once you've found the contact range, and left it
							k = n_sensors */ // there's no point continuing the loop
						}
					}
				}
			}
		}

		// Temperature sensing
		temp_left = 0
		temp_right = 0

		for (t = 0; t < n_sensors / 2; t++){
			temp_left = temp_left + sensors[t + n_sensors/2]
			temp_right = temp_right + sensors[t]
		}
		average_temp = (temp_left + temp_right) / n_sensors

		dtheta = turning_speed * Math.sign(temp_left - temp_right) * Math.sign(this.preferred - tb_i)

		// Thermodynamics
		dTemp = -(tb_i - average_temp) + this.mbr

		// Update Position
		x = xi + dt * dx;
		y = yi + dt * dy;
		// keep em on the table!
		this.agents[i][0] = Math.max(Math.min(x, this.canvas.width - this.agent_radius),this.agent_radius)
		this.agents[i][1] = Math.max(Math.min(y, 0.8 * this.canvas.height - this.agent_radius), 0.45 * this.canvas.height + this.agent_radius)

		// Update Orientation
		theta = theta - dt * dtheta * turning_speed
		this.agents[i][2] = theta % (Math.PI*2)

		//Update Temperature
		this.agents[i][3] = tb_i + dt * dTemp
	}
};


Simulation.draw = function() {
	this.x_scale = 2;	
    this.y_offset = this.canvas.height/1.5;
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = "#FFFFFF"
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.fillStyle = "#000000"
	this.ctx.strokeStyle = "#000000"
	/*
	for (var i = 0; i < this.n; i++){
		var x = parseInt(this.agents[i][0]);
		var y = parseInt(this.agents[i][1]);
		this.ctx.beginPath();
		this.ctx.arc(x,y,5,0,2*Math.PI);
		this.ctx.fill();
	}*/
	
	for (var i = 0; i < this.n; i++){
		this.ctx.strokeStyle = "#000000"

		xi = this.agents[i][0]
		yi = this.agents[i][1]
		x = parseInt(xi);
		y = parseInt(yi);
		this.ctx.beginPath();
		this.ctx.arc(x,y,this.agent_radius,0,2*Math.PI);
		this.ctx.stroke();

		theta = this.agents[i][2];
		u = parseInt(xi+this.agent_radius*Math.cos(theta))
		v = parseInt(yi+this.agent_radius*Math.sin(theta))
		this.ctx.beginPath();
		this.ctx.moveTo(x,y);
		this.ctx.lineTo(u,v);
		this.ctx.stroke();
		/*
		for (var j = 0; j < this.n; j++){
			if (i!=j){
				xj = this.agents[j][0];
				yj = this.agents[j][1];

				xc = xj - xi
				yc = yj - yi

				d = Math.sqrt(Math.pow(xc,2) + Math.pow(yc,2));
				phi = Math.atan2(yc,xc) - Math.atan2(Math.sin(theta), Math.cos(theta)) // angle between i and j

				if (d < this.agent_radius*2){
					cx = parseInt(xi + d * Math.cos(theta+phi))
					cy = parseInt(yi + d * Math.sin(theta+phi))
					this.ctx.strokeStyle = '#FF00FF'
					this.ctx.beginPath();
					this.ctx.moveTo(x,y);
					this.ctx.lineTo(cx,cy);
					this.ctx.stroke();
					
					this.ctx.beginPath();
					this.ctx.moveTo(x,y);
					this.ctx.strokeStyle = '#00FF00'
					this.ctx.lineTo(xj,yj);
					this.ctx.stroke()
				}
			}
		}*/
	}
};

Simulation.run = function () {
	Simulation.update();
	Simulation.draw();
};

Simulation.initialize();

d3.interval(Simulation.run, 1000/Simulation.fps);

document.getElementById('increase_agent_count').onclick = function(){
    Simulation.n=math.min(Simulation.n+1, 20);
    Simulation.initializeSimulation();
};

document.getElementById('decrease_agent_count').onclick = function(){
    Simulation.n=math.max(Simulation.n-1, 1);
    Simulation.initializeSimulation();
};

document.getElementById('increase_mbr').onclick = function(){
    Simulation.mbr=math.min(Simulation.mbr+0.1, 10);
    Simulation.updateParameters();
};

document.getElementById('decrease_mbr').onclick = function(){
    Simulation.mbr=math.max(Simulation.mbr-0.1, 1);
    Simulation.updateParameters();
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