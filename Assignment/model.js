function Model() 
{
	this.name = "untitled";
	
	this.vertex = [];
	this.vertexBuffer = null;

	this.index = [];
	this.indexBuffer = null;
	
	this.material = null;

	//Powerup related studd
	this.powerup = null;
	this.isCharging = null;
	this.setToStatic = false;
	this.break = false;
	this.stick = false;
	this.scale = false;
	this.time = 0;
	//this.unscaledTransform = matrixHelper.matrix4.create();
}

Model.prototype.compile = function(scene)
{
	this.vertexBuffer = scene.gl.createBuffer();
  	scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.vertexBuffer);
  	scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(this.vertex), scene.gl.STATIC_DRAW);

  	this.indexBuffer = scene.gl.createBuffer();
  	scene.gl.bindBuffer(scene.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  	scene.gl.bufferData(scene.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), scene.gl.STATIC_DRAW);
}

Model.prototype.draw = function(scene, transform) 
{
	if (this.indexBuffer == null || this.vertexBuffer == null) 
	{
		alert("Cannot bind index or vertex buffer for model " + this.name + "!");
		return;
	}

	if (this.material == null) 
	{
		alert(this.name + " has no material assigned!");
		return;
	}

	scene.setModel(transform);
	scene.updateModel();
	scene.bindModelData(this.vertexBuffer, this.indexBuffer);

	this.material.use(scene.gl);
    
    scene.gl.drawElements(scene.gl.TRIANGLES, this.index.length, scene.gl.UNSIGNED_SHORT, 0);
}