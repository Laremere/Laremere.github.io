var view = document.getElementById("view");
var cView = view.getContext("2d");
cView.textAlign = "center";
cView.textBaseline = "middle";

cView.fillStyle = "pink";
cView.fillRect(0, 0, view.width, view.height);

var aCorehurt = new Audio("corehurt.wav");
var aExplosion = {
	play: function(){
		this.channels[this.i].play();
		this.i += 1;
		if(this.i >= this.channels.length){
			this.i = 0;
		}
	},
	i: 0,
	channels: function(){
		var l = [];
		for(var i = 0; i < 10; i++){
			l.push(new Audio("explosion.wav"));
			l[i].volume = 0.75;
		}
		return l;
	}()
}
var aSelect = new Audio("select.wav");
var aShoot = new Audio("shoot.wav");
var aEngine = new Audio("engine.wav");

var mWave1 = new Audio("music_wave1.ogg");
var mWave2 = new Audio("music_wave2.ogg");
var mWave3 = new Audio("music_wave3.ogg");
var mWave4 = new Audio("music_wave4.ogg");
var mBoss = new Audio("music_boss.ogg");

mWave1.loop = true;
mWave2.loop = true;
mWave3.loop = true;
mWave4.loop = true;
mBoss.loop = true;

mWave1.volume = 0.5;
mWave2.volume = 0.5;
mWave3.volume = 0.5;
mWave4.volume = 0.5;
mBoss.volume = 0.5;

// cSheet.beginPath();
// cSheet.arc(50, 50, 45, 0, 2*Math.PI, false);
// cSheet.fillStyle = "green";
// cSheet.fill();

// cView.drawImage(sheet, 0, 0, 100, 100, 0, 0, 100, 100);

// cSheet.clearRect(0, 0, 100, 100);

// cSheet.beginPath();
// cSheet.arc(50, 50, 40, 0, 2*Math.PI, false);
// cSheet.fillStyle = "blue";
// cSheet.fill();

// cView.drawImage(sheet, 0, 0, 100, 100, 0, 0, 100, 100);

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

var sheetItems = []
function refresh(sprite, stage){
	sprite.c.clearRect(0, 0, sprite.width, sprite.height);
	sprite.refresh(stage);
	var imgd = sprite.c.getImageData(0, 0, sprite.width, sprite.height).data;
	if(sprite.collision == undefined){
		sprite.collision = new Array(imgd.length / 4);
	}
	var j = 0;
	for(var i = 3; i < imgd.length; i+= 4){
		sprite.collision[j] = imgd[i] > 0;
		j += 1;
	}
}


function draw(sprite, x, y){
	cView.drawImage(sprite.canvas, x, y, sprite.width, sprite.height); 
}


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

function blendColor(stage, colors){
	// colors = [value, r, g, b, value, r, g, b, value, r, g, b...]
	if (stage <= colors[0]){
		return "rgb(" + colors[1] + "," + colors[2] + "," + colors[3] + ")";
	}
	if (stage >= colors[colors.length - 4]){
		var i = colors.length - 3;
		return "rgb(" + colors[i] + "," + colors[i+1] + "," + colors[i+2] + ")";
	}

	var i = 0;
	while(stage > colors[i + 4]){
		 i += 4
	}
	var right = (stage  - colors[i]) / (colors[i+4] - colors[i])
	var left = 1 - right;
	var r = Math.round(Math.sqrt(colors[i+1]*colors[i+1]*left +
		colors[i+5]*colors[i+5]*right));
	var g = Math.round(Math.sqrt(colors[i+2]*colors[i+2]*left +
		colors[i+6]*colors[i+6]*right));
	var b = Math.round(Math.sqrt(colors[i+3]*colors[i+3]*left +
		colors[i+7]*colors[i+7]*right));

	return "rgb(" + r + "," + g + "," + b + ")";
}

function drawPointBlend(c, stage, points){
	var left = 1 - stage;
	var right = stage;
	c.moveTo((points[0]*left + points[2]*right) * c.canvas.width, 
		(points[1]*right + points[3]*left) * c.canvas.height);
	for (var i = 4; i < points.length; i+=4){
		c.lineTo((points[i]*left + points[i+2]*right) * c.canvas.width,
				 (points[i+1]*left + points[i+3]*right)  * c.canvas.height);
	}
	c.lineTo((points[0]*left + points[2]*right) * c.canvas.width,
		(points[1]*right + points[3]*left) * c.canvas.height);
}

function drawMirrorPointsBlend(c, stage, points){
	var left = 1 - stage;
	var right = stage;
	c.moveTo((points[0]*left + points[2]*right) * c.canvas.width, 
		(points[1]*right + points[3]*left) * c.canvas.height);
	for (var i = 4; i < points.length; i+=4){
		c.lineTo((points[i]*left + points[i+2]*right) * c.canvas.width,
				 (points[i+1]*left + points[i+3]*right)  * c.canvas.height);
	}
	for (var i = points.length - 4; i >= 0; i -= 4){
		c.lineTo((points[i]*left + points[i+2]*right) * c.canvas.width,
				 (1 -(points[i+1]*left + points[i+3]*right))  * c.canvas.height);

	}
	c.lineTo((points[0]*left + points[2]*right) * c.canvas.width,
		(points[1]*right + points[3]*left) * c.canvas.height);

}



////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
var sStarfield = {
	width: 300,
	height: 300,
	refresh: function(stage){
		this.c.fillStyle="black";
		this.c.fillRect(0, 0, this.width, this.height);
		var innerRadius = 1 + stage;
		var outerRadius = 1 + stage * 5;
		this.c.fillStyle="#999900";

		for(var i = 0; i < 40; i+= 2){
			for(var j = -1; j <= 1; j++){
				for(var k = -1; k <= 1; k++){
					var starX = this.starLocations[i] + 
						this.starChanges[i] * stage + this.width * j;
					var starY = this.starLocations[i+1] + 
						this.starChanges[i+1] * stage + this.height * k;
					this.c.beginPath();
					this.c.moveTo(this.starXPoints[0]*innerRadius + starX,
						this.starYPoints[0]*innerRadius + starY);
					for(var m = 1; m < 9; m += 2){
						this.c.lineTo(this.starXPoints[m]*outerRadius + starX,
						 this.starYPoints[m]*outerRadius + starY);
						this.c.lineTo(this.starXPoints[m+1]*innerRadius + starX,
						 this.starYPoints[m+1]*innerRadius + starY);
					}
					this.c.lineTo(this.starXPoints[9]*outerRadius + starX,
						this.starYPoints[9]*outerRadius + starY);
					this.c.closePath();					


					this.c.fill();					
				}
			}
		}
	},
	starLocations: [31.448291544802487, 0.33335681073367596, 251.15929555613548, 153.8811925565824, 76.06377436313778, 140.4080344364047, 128.00467482302338, 58.96022168453783, 183.31521805375814, 21.888783643953502, 149.26386571023613, 217.92258883360773, 9.74335209466517, 193.9888214925304, 179.4797205599025, 194.88034285604954, 120.45998093672097, 174.08011173829436, 66.13641302101314, 228.00488455686718, 11.018067598342896, 41.43341782037169, 25.419061607681215, 144.55367128830403, 190.59379000682384, 175.75005639810115, 210.6303859502077, 239.11123119760305, 180.16995617654175, 70.04728736355901, 296.92757728043944, 55.88937329594046, 48.94289437215775, 94.81988749466836, 156.56979186460376, 263.5112654417753, 275.7253007031977, 90.50410387571901, 88.65878989454359, 76.17733308579773],
	//  function(){
	// 	var l = [];
	// 	for(var i = 0; i < 40; i++){
	// 		l.push(Math.random() * 300);
	// 	}
	// 	return l;
	// }(),
	starChanges: [41.82826881296933, 6.913304212503135, 2.795916050672531, -33.09752105269581, 10.481304675340652, 31.807006895542145, 45.87130707222968, 26.125967991538346, 2.4230143520981073, 31.84744690079242, -41.04409695137292, 38.07946625165641, 4.359073517844081, 47.351619438268244, 4.821793618611991, 13.428511028178036, -32.866268628276885, -32.341377646662295, 18.911156803369522, 6.074640853330493, -7.37568901386112, -25.631267158314586, 21.925377985462546, -29.163833032362163, 40.64073436893523, -0.4021326079964638, 11.875618109479547, -41.109592583961785, 49.58567670546472, -30.708519811742008, -20.99709319882095, -31.773624010384083, -43.5094294603914, -38.16462706308812, 31.729638390243053, 29.396061995066702, -16.60600770264864, -36.862770142033696, 6.523887207731605, -34.30989449843764],
	//  function(){
	// 	var l = [];
	// 	for(var i = 0; i < 40; i++){
	// 		l.push((Math.random() - 0.5) * 100);
	// 	}
	// 	return l;
	// }(),
	starXPoints: function(){
		var l = [];
		for(var i = 0; i < 10; i++){
			l.push(Math.cos(i * Math.PI / 5));
		}
		return l;
	}(),
	starYPoints: function(){
		var l = [];
		for(var i = 0; i < 10; i++){
			l.push(Math.sin(i * Math.PI / 5));
		}
		return l;
	}()
};
sheetItems.push(sStarfield);

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
var sPlayerShip = {
 	width: 75, //75,
 	height: 75,
 	refresh: function(stage){
		this.c.fillStyle = blendColor(stage, this.colorPrimary);
 		this.c.beginPath();
		drawPointBlend(this.c, stage, this.pointsPrimary);
		this.c.fill();
		this.c.strokeStyle = "#999999"
		this.c.stroke();

		this.c.fillStyle = blendColor(stage, this.colorSecondary);
		this.c.beginPath();
		drawPointBlend(this.c, stage, this.pointsSecondary);
		this.c.fill();

		this.c.fillStyle = "#dddddd";
		this.c.beginPath();
		drawPointBlend(this.c, stage, this.pointsCockpit);
		this.c.fill();
 	},
 	colorPrimary: [ 
					0,	10,	30,	200,
					1,10,	150,150],
	colorSecondary:[
					0,	30,	50,	250,
					1,30, 200, 200],
	pointsPrimary: [1,		0.5,		1,		0.5,

					0.98,	0.55,		0.95,	0.54,
					0.95,	0.6,		0.93,	0.55,
					0.9,	0.65,		0.8,	0.6,
					0.75,	0.7,		0.7,	0.63,
					0.6,	0.8,		0.55,	0.75,
					0.3,	0.95,		0.4,	0.9,
					0,		1,			0.1,	1,
					0,		0.9,		0,		0.9,
					0.1,	0.8,		0.3,	0.8,
					0.15,	0.6,		0.35,	0.6,
					0.05,	0.61,		0.25,	0.61,

					0.05,	0.5,		0.27,	0.5,

					0.05,	0.39,		0.25,	0.39,
					0.15,	0.4,		0.35,	0.4,
					0.1,	0.2,		0.3,	0.2,
					0,		0.1,		0,		0.1,
					0,		0,			0.1,	0,
					0.3,	0.05,		0.4,	0.1,
					0.6,	0.2,		0.6,	0.25,
					0.75,	0.3,		0.7,	0.37,
					0.9,	0.35,		0.8,	0.4,
					0.95,	0.4,		0.93,	0.45,
					0.98,	0.45,		0.95,	0.46],
	pointsSecondary:[
					0.9,	0.5,		0.9,	0.5,
					0.85,	0.6,		0.85,	0.55,
					0.7,	0.65,		0.7,	0.6,
					0.35,	0.85,		0.4,	0.85,
					0.15,	0.85,		0.3,	0.85,

					0.2,	0.5,		0.4,	0.5,

					0.15,	0.15,		0.3,	0.15,
					0.35,	0.15,		0.4,	0.15,
					0.7,	0.35,		0.7,	0.4,
					0.85,	0.4,		0.85,	0.45],
	pointsCockpit:[
					0.8,	0.5,		0.8,	0.5,
					0.75,	0.55,		0.75,	0.55,
					0.3,	0.6,		0.45,	0.63,
					0.32,	0.5,		0.46,	0.5,
					0.3,	0.4,		0.45,	0.37,
					0.75,	0.45,		0.75,	0.45,
	],
}
sheetItems.push(sPlayerShip)

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
sEnemyShip = {
	width: 75,
	height: 75,
	refresh: function(stage){
		this.c.fillStyle = blendColor(stage, this.colorPrimary);
 		this.c.beginPath();
		drawPointBlend(this.c, stage, this.pointsPrimary);
		this.c.fill();
		this.c.strokeStyle = "#999999"
		this.c.stroke();

		this.c.fillStyle = blendColor(stage, this.colorSecondary);
		this.c.beginPath();
		drawPointBlend(this.c, stage, this.pointsSecondary);
		this.c.fill();

		this.c.fillStyle = "#dddddd";
		this.c.beginPath();
		drawPointBlend(this.c, stage, this.pointsCockpit);
		this.c.fill();
	},
 	colorPrimary: [ 0, 200, 10, 30,
					1, 150, 10, 150],
 	colorSecondary: [ 0, 250, 30, 50,
					1, 200, 30, 200],
	pointsPrimary: [0.3,	0.5,		0.5,	0.5,

					0.35,	0.4,		0.55,	0.4,
					0.45,	0.35,		0.6,	0.35,
					0.45,	0.15,		0.55,	0.2,
					0.4,	0.1,		0.4,	0.15,
					0, 		0.1,		0,		0.1,
					0,		0.05,		0,		0.05,
					0.05,	0,			0.05,	0,
					0.95,	0,			0.75,	0,
					1,		0.05,		0.8,	0.05,
					1,		0.1,		0.8,	0.1,
					0.65,	0.1,		0.8,	0.1,
					0.6,	0.15,		0.75,	0.2,
					0.6,	0.35,		0.8,	0.35,
					0.65, 	0.4,		0.85,	0.4,
					
					0.7,	0.5,		0.9,	0.5,

					0.65,	0.6,		0.85,	0.6,
					0.6,	0.65,		0.8,	0.65,
					0.6,	0.85,		0.75,	0.8,
					0.65,	0.9,		0.8,	0.9,
					1,		0.9,		0.8,	0.9,
					1,		0.95,		0.8,	0.95,
					0.95,	1,			0.75,	1,
					0.05,	1,			0.05,	1,
					0,		0.95,		0,		0.95,
					0,		0.9,		0,		0.9,
					0.4,	0.9,		0.4,	0.85,
					0.45,	0.85,		0.55,	0.8,
					0.45,	0.65,		0.6,	0.65,
					0.35,	0.6,		0.55,	0.6,
	],
	pointsSecondary: [0.4,	0.5,		0.6,	0.5,

					0.5,	0.35,		0.65,	0.35,
					0.5,	0.05,		0.55,	0.05,
					0.55,	0.05,		0.65,	0.05,
					0.55,	0.35,		0.8,	0.41,
					0.62,	0.45,		0.83,	0.45,

					0.65,	0.5,		0.85,	0.5,

					0.62,	0.55,		0.83,	0.55,
					0.55,	0.65,		0.8,	0.59,
					0.55,	0.95,		0.65,	0.95,
					0.5,	0.95,		0.55,	0.95,
					0.5,	0.65,		0.65,	0.65
	],
	pointsCockpit: [0.35,	0.5,		0.55,	0.5,

					0.4,	0.4,		0.6,	0.4,
					0.5,	0.37,		0.65,	0.35,
					0.55,	0.45,		0.75,	0.4,

					0.55,	0.55,		0.75,	0.6,
					0.5, 	0.63,		0.65,	0.65,
					0.4,	0.6,		0.6,	0.6,
	],
};
sheetItems.push(sEnemyShip);

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

sMissile = {
	width: 50,
	height: 10,
	refresh: function(stage){
		this.c.fillStyle = blendColor(stage, this.colorPrimary);
 		this.c.beginPath();
		drawPointBlend(this.c, stage, this.pointsPrimary);
		this.c.fill();
		this.c.strokeStyle = "#999999"
		this.c.stroke();
	},
 	colorPrimary: [ 0, 30, 30, 30,
				1, 255, 255, 255],
	pointsPrimary: [1,	0.5,		1,		0.5,
					0.6,	1,			0.6,	1,
					0,		1,			0,		1,
					0,		0,			0,		0,
					0.6,	0,			0.6,	0,
	]
}
sheetItems.push(sMissile);



////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

sMothership = {
	height: view.height,
	width: 150,
	refresh: function(stage){
		this.c.fillStyle = blendColor(stage, this.colorPrimary);
 		this.c.beginPath();
		drawMirrorPointsBlend(this.c, stage, this.pointsPrimary);
		this.c.fill();
		this.c.strokeStyle = "#999999"
		this.c.stroke();

		this.c.fillStyle = blendColor(stage, this.colorSecondary);
		this.c.beginPath();
		drawMirrorPointsBlend(this.c, stage, this.pointsSecondary);
		this.c.fill();

	},
	colorPrimary: [0, 100, 90, 90,
				1,	80,	80,	80],
	colorSecondary: [0, 200, 90, 90,
				1,	120,120,120],
	pointsPrimary: [1,		0,		1,		0,
					0.6, 	0.03,	0.6,	0.03,
					0.6,	0.06,	0.6,	0.04,
					0.4,	0.06,	0.4,	0.04,
					0.4,	0.03,	0.4,	0.03,
					0,		0.05,	0,		0.05,
					0,		0.06,	0,		0.06,
					0.1,	0.06,	0.1,	0.06, //right 0.1
					0.1,	0.12,	0.1,	0.08, //down 0.02
					0.5,	0.12,	0.5,	0.08, //right 0.4
					0.7,	0.10,	0.7,	0.06, //right 0.2, up 0.02
					0.8,	0.10,	0.8,	0.06, //right 0.1
					0.8,	0.15,	0.8,	0.19, //down 0.13
					0.7,	0.15,	0.7,	0.19, //left 0.1
					0.5,	0.13,	0.5,	0.17, //left 0.2, up 0.02
					0.1,	0.13,	0.1,	0.17, // left 0.4,
					0.1,	0.19,	0.1,	0.19, // down 0.02
					0,		0.19,	0,		0.19, // left 0.1
					0,		0.25,	0,		0.25,//////////////////////
					0.1,	0.25,	0.1,	0.25,
					0.1,	0.31,	0.1,	0.27,
					0.5,	0.31,	0.5,	0.27,
					0.7,	0.29,	0.7, 	0.25,
					0.8,	0.29,	0.8,	0.25,
					0.8,	0.33,	0.8,	0.37,
					0.7,	0.33,	0.7,	0.37,
					0.5,	0.31,	0.5,	0.35,
					0.1,	0.31,	0.1,	0.35,
					0.1,	0.37,	0.1,	0.37,
					0,		0.37,	0,		0.37,
					0,		0.49,	0,		0.44,
					0.15,	0.49,	0.15,	0.44,
					0.35,	0.39,	0.35,	0.39,
					0.5,	0.39,	0.5,	0.39,
					0.85,	0.5,	0.85,	0.5,
	],
	pointsSecondary: [1,	0.03,	1,		0.03,
					0.85,	0.05,	0.85,	0.05,
					0.85,	0.2,	0.85,	0.2,
					0.2,	0.2,	0.2,	0.2,
					0.2,	0.24,	0.2,	0.24,
					0.85,	0.24,	0.85,	0.24,
					0.85,	0.38,	0.85,	0.38,
					0.5,	0.38,	0.5,	0.38,

					0.9,	0.5,	0.9,	0.5],
}
sheetItems.push(sMothership);



////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

sRealityDrive = {
	width: 50,
	height: 50,
	refresh: function(stage){
		this.c.fillStyle = blendColor(stage, this.colorPrimary);
 		this.c.beginPath();
 		this.c.arc(25, 25, 10 + 15 * stage, 0, 2 * Math.PI, false);
		//drawPointBlend(this.c, stage, this.pointsPrimary);
		this.c.fill();
		this.c.strokeStyle = "#999999"
		this.c.stroke();
	},
 	colorPrimary: [ 0, 255, 30, 30,
				1, 30, 30, 255],
}
sheetItems.push(sRealityDrive);


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

var Missile = function(x, y){
	this.x = x;
	this.y = y;
	this.alive = true;
}
Missile.prototype.width = sMissile.width;
Missile.prototype.height = sMissile.height;
Missile.prototype.sprite = sMissile;

Missile.prototype.update = function(dt){
	this.x += dt / 2;

	for(var i in this.collisions){
		if(this.collisions[i] instanceof EnemyShip){
			this.alive = false;
			this.collisions[i].alive=false;
			newGameObjects.push(new Explosion(this.collisions[i].x,
				this.collisions[i].y, 1));
			newGameObjects.push(new Explosion(this.x, this.y, 0.3));
			break;
		}
		if(this.collisions[i] instanceof BossScreen){
			newGameObjects.push(new Explosion(this.x, this.y, 0.3));
			this.alive = false;
		}
		if(this.collisions[i] instanceof RealityDrive){
			this.alive = false;
			globalStage = 0;
			this.collisions[i].damage += 1;
			aCorehurt.play();
			newGameObjects.push(new Explosion(this.x, this.y, 0.3));
		}
	}
	return this.alive;
}

Missile.prototype.render = function(){
		draw(this.sprite, this.x - this.width / 2,
			this.y - this.height / 2 );
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
var RealityDrive = function(x, y){
	this.r = 0;
	this.bx = view.width + 50;
	this.x = this.bx;
	this.by = view.height / 2;
	this.y = y;
	this.alive = true;
	this.damage = 0;
}

RealityDrive.prototype.width = sRealityDrive.width;
RealityDrive.prototype.height = sRealityDrive.height;
RealityDrive.prototype.sprite = sRealityDrive;
RealityDrive.prototype.yTargets = [
	view.height / 2,
	view.height / 3 - 11,
	2 * view.height / 3 + 11,
	view.height / 8,
	7 * view.height / 8,
	view.height / 2,
];

RealityDrive.prototype.update = function(dt){
	if(this.damage >= this.yTargets.length){
		this.globalStageRate = 0;
		this.globalStage = 0;
		return false;
	}
	if(this.by < this.yTargets[this.damage]){
		this.by += dt / 3;
	}
	if(this.by > this.yTargets[this.damage]){
		this.by -= dt / 3;
	}

	this.r += dt / 400;
	if(this.bx > view.width - 40){
		this.bx -= dt / 20;
	}

	this.x = this.bx + Math.cos(this.r * 2) * 10;
	this.y = this.by + Math.sin(this.r * 3) * 7;
	return this.alive;
}

RealityDrive.prototype.render = function(){
		draw(this.sprite, this.x - this.width / 2,
			this.y - this.height / 2 );
}


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

var PlayerShip = function(){
	this.x = 100;
	this.y = view.height / 2 ;
	this.speed = 0.25;
	this.alive = true;
	this.width = sPlayerShip.width;
	this.height = sPlayerShip.height;
	this.sprite = sPlayerShip;
	this.reload = 0;
	aEngine.play();
	aEngine.loop = true;
}

PlayerShip.prototype.update = function(dt){
	var dx = 0;
	var dy = 0;
	if(keys["w"]){
		dy -= 1;
	}
	if(keys["s"]){
		dy += 1;
	}
	if(keys["a"]){
		dx -= 1;
	}
	if(keys["d"]){
		dx += 1;
	}
	var dxy = Math.sqrt(dx*dx + dy*dy);
	if (dxy != 0){
		this.x += dt * this.speed * (dx / dxy);
		this.y += dt * this.speed * (dy / dxy);
		aEngine.volume = 0.5;
	} else {
		aEngine.volume = 0.3;
	}
	if(this.x < sPlayerShip.width){
		this.x = sPlayerShip.width;
	}
	if(this.y < sPlayerShip.height){
		this.y = sPlayerShip.height;
	}
	if(this.x > view.width - sPlayerShip.width){
		this.x = view.width - sPlayerShip.width;
	}
	if(this.y > view.height - sPlayerShip.height){
		this.y = view.height - sPlayerShip.height;
	}

	if (this.reload < 2000){
		this.reload += dt;
	} else {
		if(keys["j"] && playerHasGun){
			aShoot.play();
			newGameObjects.push(new Missile(this.x, this.y));
			this.reload = 0;
		}
	}

	if (this.collisions.length > 0){
		for(var i in this.collisions){
			if(this.collisions[i] instanceof EnemyShip){
				newGameObjects.push(new Explosion(this.collisions[i].x,
					this.collisions[i].y, 1));
				this.collisions[i].alive = false;
				currentPlayer = new Explosion(this.x, this.y, 1.5);
				newGameObjects.push(currentPlayer);
				this.alive = false;
				aEngine.pause();
			}
			if(this.collisions[i] instanceof BossScreen){
				currentPlayer = new Explosion(this.x, this.y, 1.5);
				newGameObjects.push(currentPlayer);
				this.alive = false;
				aEngine.pause();
			}
		}
	}

	return this.alive;
}

PlayerShip.prototype.render = function(){
		draw(sPlayerShip, this.x - this.width / 2,
			this.y - this.height / 2 );
}
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

var EnemyShip = function(x, y, type){
	this.x = x;
	this.y = y;
	this.speed = 0.2;
	this.type = type;
	this.width = sEnemyShip.width;
	this.height = sEnemyShip.height;
	this.sprite = sEnemyShip;
	this.alive = true;
}

EnemyShip.prototype.update = function(dt){
	this.x -= this.speed * dt;
	if(this.type == "s" && this.x < 2 * view.width / 3){
		this.x = 2 * view.width / 3;
	}
	return this.alive && 	 this.x > -1 * sEnemyShip.width;
}


EnemyShip.prototype.render = function(){
	if(this.type == "d" && this.x > view.width / 2){
		cView.fillStyle = "white";
		cView.font = "40px serif";
		cView.fillText("dodge →", this.x -100, this.y);
	}
	draw(sEnemyShip, this.x - this.width / 2,
		this.y - this.height / 2 );
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
var Explosion = function(x, y, scale){
	aExplosion.play();
	this.lifeTime = 0;
	this.x = x;
	this.y = y;
	this.scale = scale;
	this.alive = true;
}

Explosion.prototype.update = function(dt){
	this.lifeTime += dt;
	return this.lifeTime < 5000;
}

Explosion.prototype.colorPrimary = [
	0,    255, 255, 255,
	200,    0,   0, 255,
	400,  200,  20,  30,
	1000,  50,	10,	  5,
	4000,   0,   0,   0,
];

Explosion.prototype.render = function(){
	var size = (-0.00000360085*this.lifeTime * this.lifeTime+0.00464001 * this.lifeTime+39.0533) * this.scale;
	if(size > 0){

		cView.fillStyle = blendColor(this.lifeTime, this.colorPrimary);
		cView.beginPath();
		cView.arc(this.x, this.y, size, 0, 2 * Math.PI, false);
		cView.fill();
	}
}


//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
var playerHasGun = false;
var currentSceneNumber = 0;
function GetScene(num){
	mWave1.pause();
	mWave2.pause();
	mWave3.pause();
	mWave4.pause();
	mBoss.pause();



	playerHasGun = num >= 6;
	switch(num){
	case 0:
		mWave1.play();
		return new StartScreen();
	case 1:
		mWave1.play();
		return new TextScreen("Attention pilot, my name is commander Dare.", 
					"","The base is about to be attacked by a mothership of the",
					"Ludum rebel fleet. Our intellegance states that the rebel",
					"scum have invented a new weapon: The reality drive.");
	case 2:
		mWave1.play();
		return new TextScreen(
					"This reality drive is able to affect people's perception of",
					"reality as they know it. With it the rebels plan to decieve",
					"the citizens of the republic.  You must evade the",
					"incoming fleet then attack and destroy the mothership",
					"before they spread their anarchy further!");
	case 3:
		mWave1.play();
		return new WaveManager(wave0, "First Wave", "Use W to move up, S to move down");
	case 4:
		mWave2.play();
		return new WaveManager(wave1, "Second Wave", "Use A to move left, D to move right");
	case 5:
		mWave3.play();
		return new TextScreen(
					"Pilot, this is commander Dare again.",
					"You're ships missiles are now fully armed.  You'll be",
					"able to shoot incoming enemy fighters.  However the",
					"weapon has a two second reload time, so use your shots",
					"carefully.");
	case 6:
		mWave3.play();
		return new WeaponGetScreen();
	case 7:
		mWave3.play();
		return new WaveManager(wave2, "Third Wave");
	case 8:
		mWave4.play();
		return new WaveManager(wave3, "Fourth Wave");
	case 9:
		mBoss.play();
		return new TextScreen(
			"<signal from Ludum Rebel mothership>",
			"Attention approaching craft: Your weapons are armed.",
			"If you do not stand down your threat towards the reality",
			"restoration drive, we will need to destroy your ship.");
	case 10:
		mBoss.play();
		return new BossScreen();
	case 11:
		mBoss.play();
		return new VictoryScene();
	case 12:
	}
	return null;
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var VictoryScene = function(){
	this.lifeTime = 15000;
};

VictoryScene.prototype.update = function(dt){
	for(var i in gameObjects){
		if(gameObjects[i] instanceof EnemyShip){
			gameObjects[i].alive = false;
		}
	}
	globalStage = 0;
	globalStageRate = 0;

	this.lifeTime -= dt;
	return this.lifeTime > 0;
};

VictoryScene.prototype.render = function(){
	cView.fillStyle = "white";
	cView.font = "100px serif";
	if (Math.round(this.lifeTime) % 10 > Math.round(this.lifeTime / 1000) + 5){
		cView.fillText("You lose!", view.width/2, view.height/2);
	} else {
		cView.fillText("You win!", view.width/2, view.height/2);
	}
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var StartScreen = function(){
	globalStage = 0;
	globalStageRate = 0;
}

StartScreen.prototype.update = function(dt){
	if(keys["j"]){
		globalStageRate = 1;
		aSelect.play();
		return false;
	}
	return true;
}

StartScreen.prototype.render = function(){
	cView.fillStyle = "white";
	cView.font = "100px serif";	
	cView.fillText("Reality Drive", view.width/2, view.height/3);
	cView.font = "40px serif";
	cView.fillText("By Laremere for Ludum Dare #32", view.width/2, view.height/2);
	cView.fillText("Press j to start", view.width/2, view.height/2 + 200);
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var TextScreen = function(){
	this.lines = arguments;
	this.lastJ = keys["j"];
}

TextScreen.prototype.update = function(dt){
	var next = !this.lastJ && keys["j"];
	this.lastJ = keys["j"];
	if(next){
		aSelect.play();
	}
	return !next
}

TextScreen.prototype.render = function(){
	cView.fillStyle = "#444444"
	cView.fillRect(view.width/4 - 10,view.height/2 + 80, view.width/2 + 20, 160);
	cView.fillStyle = "#333333"
	cView.fillRect(view.width/4 - 5,view.height/2 + 85, view.width/2 + 10, 150);

	cView.fillStyle = "#EEEEEE";
	cView.font = "20px serif";
	for(var i in this.lines){
		var text = this.lines[i];
		cView.fillText(text, view.width/4 + cView.measureText(text).width / 2, view.height/2 + 100 + i * 25);
	}
	cView.fillStyle = "#AAAAAA";
	cView.fillText("press j to continue", 
		3 * view.width/4 - cView.measureText("press j to continue").width / 2, 
		view.height/2 + 220);
}


//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var WeaponGetScreen = function(){
}

WeaponGetScreen.prototype.update = function(dt){
	if (this.enemy1 == undefined){
		this.enemy1 = new EnemyShip(view.width + 300, view.height / 3, "s")
		this.enemy2 = new EnemyShip(view.width + 300, 2* view.height / 3, "s")
		newGameObjects.push(this.enemy1);
		newGameObjects.push(this.enemy2);
	}
	return this.enemy1.alive || this.enemy2.alive;
}

WeaponGetScreen.prototype.render = function(){
	cView.fillStyle = "white";
	cView.font = "40px serif";
	cView.fillText("Weapon activated, press j to shoot!", view.width/2, view.height/2 + 200);
}



//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var BossScreen = function(){
	globalStageRate = 25;
	this.wave = {alive:false};
	this.x = view.width + sMothership.width / 2;
	this.death = 0;
}


BossScreen.prototype.sprite = sMothership;
BossScreen.prototype.width = sMothership.width;
BossScreen.prototype.height = sMothership.height;
BossScreen.prototype.y = view.height / 2;

BossScreen.prototype.update = function(dt){
	if(this.core == undefined){
		this.core = new RealityDrive();
		newGameObjects.push(this.core);
	}

	if (this.core.alive){
		this.x -= dt / 5;
	} else {
		this.x += dt / 5;
	}
	if (this.x < view.width - sMothership.width / 2){
		this.x = view.width - sMothership.width / 2;
	}
	if(!this.wave.alive){
		this.wave = new WaveManager(waveBoss, "");
		newGameObjects.push(this.wave);
	}

	if(!this.core.alive){
		this.wave.alive = false;
		this.wave.spawnSet = this.wave.wave[0].length
		for(var i in gameObjects){
			if(gameObjects[i] instanceof EnemyShip){
				newGameObjects.push(new Explosion(gameObjects[i].x,
					 gameObjects[i].y, 1));
				gameObjects[i].alive = false;
			}
		}
		this.death += dt;
		globalStage = 0;
		globalStageRate = 0;
		newGameObjects.push(new Explosion(
			view.width - Math.random() * this.width,
			Math.random() * this.height, 1));			

	}

	return this.death < 5000;
}

BossScreen.prototype.render = function(){
		draw(this.sprite, this.x - this.width / 2,
			this.y - this.height / 2 );
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var wave0 = [
"_________________1_______1_1__________________1___________1____1_______________1________________________",
"_________d_______1_______1_1_______1_1________1___________1___1_____1__________1________________________",
"d________________________1_1_______1__________1___________1__1_____1____________________________________",
"_________d_______1_________________1__________1___________1_1_____1____________1________________________",
"_________________1_______1_1_______1_____________________________1_____________1________________________",
];

var wave1 = [
"1________1____1________________________1_____________1___________________________________",
"1____1____1___1________1_______________1_____1________1_________1________________________",
"_____1_____1__1_______1________________1______1________1________1________________________",
"_____1________1______1_________________1_______1________1_______1________________________",
"1____1___1____1_____1__________________1________1________1_1____1________________________",
"1________1_________1_____________________________1______________1________________________",
];

var wave2 = [
"1_____1_1___________1_1_______________________1_1_1_1____________1_1_1_______1________________________",
"1_____1_1___________1_1_____________1_1_1_1_1__1_1_1_1____________1_1________1________________________",
"1_______1___________1_1____________1_1_1_1_1____1_1_1_1____________1_________1________________________",
"1_____1_1___________1_1___________1_1_1_1_1______1_1_1_1___________1_________1________________________",
"______1_1___________1_1__________1_1_1_1_1________1_1_1_1_________1_1________1________________________",
"1_____1_1___________1_1_________1_1_1_1_1___________1____________1_1_1_______1________________________",
];

var wave3 = [
"1_1_1____1__________1_1_1_1_1_1_____1_1_1_1_1_1_1_1_1_1_______1___________1_1_1_1_1_1________________________",
"1_1_1____1_1_1_1_____1_1_1_1_1______1_______1_________1______1_1_1________1_1_1_1_1_1________________________",
"1_1_1____1_1_1_1_1____1_1_1_1_______1_1_1_1_1_1_1_1_1_1_____1_1_1_1_______1_1________________________________",
"1_1_1____1_1_1_1_1_____1_1_1________1_1_1_1_1_1_1_1_1_1____1_1_1_1________1_1___1_1_1________________________",
"1_1_1____1_1_1_1_1_1____1_1_________1_______1_______1_____1_1_1_1_1_____________1_1_1________________________",
"1________1_1_1_1_1_1_____1__________1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_______1_1_1_1_1_1________________________",
];

var waveBoss = [
// "111111111111111111111111111111",
// "111111111111111111111111111111",
// "111111111111111111111111111111",
// "111111111111111111111111111111",
// "111111111111111111111111111111",

"1_1_1_1_1_1_1_1_____________1_1_1_1_1____1_1_1_1_1_________________1_1_1_1_1_1_1_1_1_1_1_1____________________________________1_1_1_1_1___________",
"____________________1_1_____1_1_1_1_1_________________1_1_1_1_______1_1_1_1_1_1_1_1_1_1_1______1_1_1_1_1___________1_1___________________1_1______",
"________s_________1_1_1_____1_1_1_1_1____1_1_1_1_1__________s________1_1_1_1_1_____s__________1_1_1_1_s___________1_1_1_______1_1_1_1_1_1_1_1_____",
"________________1_1_1_1_____1_1_1_1_1_________________1_1_1_1_________1_1_1_1____1_1_1_1_1_____1_1_1_1_1___________1_1___________________1_1______",
"1_1_1_1_1_1_1_1_1_1_1_1__________________1_1_1_1_1______________________________1_1_1_1_1_1___________________________________1_1_1_1_1___________",

];

var WaveManager = function(wave, text, subtext){
	this.wave = wave;
	this.spawntime = 3000;
	if(text == ""){
		this.spawntime = 0;
	}
	this.spawnSet = 0;
	this.text = text;
	this.subtext = subtext;
	this.alive = true;
}

WaveManager.prototype.update = function(dt){
	this.spawntime -= dt;
	if(this.spawntime < 0){
		this.spawntime += 300;
		var y = sEnemyShip.height;
		var dy = (view.height - sEnemyShip.height * 2) / (this.wave.length - 1)
		for(var i in this.wave){
			if(this.wave[i][this.spawnSet] != "_"){
				newGameObjects.push(new EnemyShip(view.width + 300, y, 
					this.wave[i][this.spawnSet]));
			}
			y += dy;
		}

		this.spawnSet += 1;
	}
	return this.spawnSet < this.wave[0].length;
}

WaveManager.prototype.render = function(){
	cView.fillStyle = "white";
	cView.font = "100px serif";
	if(this.spawntime > 300){
		cView.fillText(this.text, view.width/2, view.height/2);
		if(this.subtext){
			cView.font = "40px serif";
			cView.fillText(this.subtext, view.width/2, view.height/2 + 200);
		}
	}
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

for(var i in sheetItems){
	var s = sheetItems[i];
	s.canvas = document.createElement('canvas');
	s.canvas.width = s.width;
	s.canvas.height = s.height;
	s.c = s.canvas.getContext("2d");
	//document.body.appendChild(s.canvas);
 }

var globalStage = 0; //-0.3;
var globalStageRate = 0;

var previousTimestamp = null;
var starfieldStep = 0;
var nextCanvasUpdate = 0;
var gameObjects = [];
var newGameObjects = [];


var currentScene = {alive:false};
var currentPlayer = {alive:false};


function step(timestamp){
	window.requestAnimationFrame(step);

	var dt = 0;
	if(previousTimestamp){
		dt = timestamp - previousTimestamp
	} 
	previousTimestamp = timestamp;

	for (var nextCanvasUpdate = 0; nextCanvasUpdate < sheetItems.length; nextCanvasUpdate++){
	if (globalStage < 0){
		refresh(sheetItems[nextCanvasUpdate], 0);
	} else if (globalStage > 1){
		refresh(sheetItems[nextCanvasUpdate], 1);
	} else {
		refresh(sheetItems[nextCanvasUpdate], globalStage);
	}
}
	nextCanvasUpdate += 1;
	nextCanvasUpdate %= sheetItems.length;

	globalStage += globalStageRate * dt / (60000 * 3);
	// globalStage += dt / 3000;
	if (globalStage > 1){
	 	globalStage = 1;
	} else if (globalStage < 0){
		globalStage = 0;
	 	globalStageRate *= -1;
	}

	if (!currentPlayer.alive){
		gameObjects = [];
		currentPlayer = new PlayerShip();
		newGameObjects.push(currentPlayer);
		currentScene = GetScene(currentSceneNumber);
		currentScene.alive = true;
		newGameObjects.push(currentScene);
	}
	if (!currentScene.alive && currentPlayer instanceof PlayerShip){
		currentSceneNumber += 1;
		currentScene = GetScene(currentSceneNumber);
		if (currentScene == null){
			currentSceneNumber = 0;
			currentScene = GetScene(currentSceneNumber);
		}
		newGameObjects.push(currentScene);
	}

///////////////////////
//Add new objects
///////////////////////
	if(newGameObjects.length > 0){
		for(var i in newGameObjects){
			gameObjects.push(newGameObjects[i]);
		}
		newGameObjects = [];
	}

///////////////////////
//Collide objects
///////////////////////
	for(var i in gameObjects){
		if(gameObjects[i].collisions == undefined ||
			gameObjects[i].collisions.length != 0){
			gameObjects[i].collisions = [];
		}
	}
	
	for(var i = 0; i < gameObjects.length; i++){
		if(gameObjects[i].sprite == undefined){
			continue;
		}
		var gi = gameObjects[i];
outerCheck:
		for(var j = i + 1; j < gameObjects.length; j++){
			if(gameObjects[j].sprite == undefined){
				continue;
			}
			var gj = gameObjects[j];
			var dx = Math.round((gj.x - gj.width/2) - (gi.x-gi.width/2));
			var dy = Math.round((gj.y-gj.height/2) - (gi.y-gi.height/2));
			var wx = Math.max(gi.width, gj.width);
			var wy = Math.max(gi.height, gj.height);
			if(Math.abs(dx) < wx && Math.abs(dy) < wy ){
				var xMax = Math.min(gi.width, gj.width + dx);
				var yMax = Math.min(gi.height, gj.height + dy);
				var xMin = Math.max(0, dx);
				var yMin = Math.max(0, dy);

				for(var x = xMin; x < xMax; x += 2){
					for(var y = yMin; y < yMax; y += 2){
						if(gi.sprite.collision[x + y*gi.width] &&
							gj.sprite.collision[x - dx + (y-dy)*gj.width]){
							gi.collisions.push(gj);
							gj.collisions.push(gi);
							continue outerCheck;
						}
					}
				}
			}
		}
	}


///////////////////////
//Update objects
///////////////////////
	{
		var j = 0;	
		for(var i in gameObjects){
			gameObjects[i].alive = gameObjects[i].update(dt);
			if(gameObjects[i].alive){
				gameObjects[j] = gameObjects[i];
				j += 1;
			} 
		}
		gameObjects = gameObjects.slice(0, j);
	}

///////////////////////
//Render
///////////////////////
	starfieldStep -= dt / 10;
	if (starfieldStep < sStarfield.width * -1) {
		starfieldStep += sStarfield.width;
	}
	for( var x = starfieldStep; x < view.width; x += sStarfield.width){
		draw(sStarfield, x, 0);
		draw(sStarfield, x, sStarfield.height);
	}

	for(var i = gameObjects.length - 1; i >= 0; i -= 1){
		gameObjects[i].render();
	}

	// draw(sPlayerShip, 50, 50);
	// draw(sEnemyShip, 250, 10);
	// draw(sEnemyShip, 275, 100);

}

var keys = {}
var keyCodes = {
	"32": "space",
	"65": "a",
	"68": "d",
	"74": "j",
	"83": "s",
	"87": "w",
}
document.onkeydown = function(e){
	// console.log(e);
	keys[keyCodes[e.keyCode]] = true;
}

document.onkeyup = function(e){
	keys[keyCodes[e.keyCode]] = false;
}


function stageTestChange(event){
	globalStage = parseFloat(event.target.value);
}
window.requestAnimationFrame(step);