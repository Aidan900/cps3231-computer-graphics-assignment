//--------------------------------------------------------------------------------------------------------//
//  Light
//--------------------------------------------------------------------------------------------------------//
function Light() 
{
	this.type = 0; // Directional light
	
	this.position = [0,0,0];
	this.direction = [0,-1,0];
	
	this.ambient = [0.2, 0.2, 0.2];
	this.diffuse = [1, 1, 1];
	this.specular = [1, 1, 1];

	this.alpha = 0.965;
	this.beta = 0.82;
	
	this.attenuation = 0; // No attenuation

	this.inUse = 0;

	this.shaderIndices = {
		bound : false, typeVertex : 0, typeFragment : 0, position : 0, direction : 0,
		ambient : 0, diffuse : 0, specular : 0,
		alpha : 0, beta : 0, attenuation : 0, inUseFragment: 0, inUseVertex: 0		
	}
}

Light.LIGHT_TYPE = {
	DIRECTIONAL : 0,
	POINT : 1,
	SPOT : 2
}

Light.ATTENUATION_TYPE = {
  	NONE : 0,
  	LINEAR : 1,
  	QUAD : 2
}

Light.prototype.setType = function(lightType) {
	this.type = lightType;
}

Light.prototype.setPosition = function (pos) {
	this.position = pos;
}

Light.prototype.setDirection = function(dir) {
	this.direction = dir;
}

Light.prototype.setAmbient = function(ambientContribution) {
	this.ambient = ambientContribution;
}

Light.prototype.setDiffuse = function(diffuseContribution) {
	this.diffuse = diffuseContribution;
}

Light.prototype.setSpecular = function(specularContribution) {
	this.specular = specularContribution;
}

Light.prototype.setAttenuationType = function(type) {
	this.attenuation = type;
}

Light.prototype.setCone = function(inner, outer) {
	this.alpha = inner;
	this.beta = outer;
}

Light.prototype.bind = function(gl, shaderProgram, lightIndex)
{
	var lightVertexPrefix = "LightVertex[" + lightIndex + "].";
	var lightFragmentPrefix = "LightFragment[" + lightIndex + "].";

	this.shaderIndices.bound = true;
	this.shaderIndices.typeVertex = gl.getUniformLocation(shaderProgram, lightVertexPrefix + "type"); 
	this.shaderIndices.position = gl.getUniformLocation(shaderProgram, lightVertexPrefix + "position");
	this.shaderIndices.direction = gl.getUniformLocation(shaderProgram, lightVertexPrefix + "direction");
	this.shaderIndices.inUseVertex = gl.getUniformLocation(shaderProgram, lightVertexPrefix + "inUse");

	this.shaderIndices.typeFragment = gl.getUniformLocation(shaderProgram, lightFragmentPrefix + "type");
	this.shaderIndices.ambient = gl.getUniformLocation(shaderProgram, lightFragmentPrefix + "ambient");
	this.shaderIndices.diffuse = gl.getUniformLocation(shaderProgram, lightFragmentPrefix + "diffuse");
	this.shaderIndices.specular = gl.getUniformLocation(shaderProgram, lightFragmentPrefix + "specular");
	this.shaderIndices.alpha = gl.getUniformLocation(shaderProgram, lightFragmentPrefix + "alpha");
	this.shaderIndices.beta = gl.getUniformLocation(shaderProgram, lightFragmentPrefix + "beta");
	this.shaderIndices.attenuation = gl.getUniformLocation(shaderProgram, lightFragmentPrefix + "attenuation");
	this.shaderIndices.inUseFragment = gl.getUniformLocation(shaderProgram, lightFragmentPrefix + "inUse");
}

Light.prototype.useTransformed = function(gl, transform)
{
	if (!this.shaderIndices.bound) { 
		alert("Please bind light before using it!");
		return;
	}

	this.inUse = 1;

	var d = matrixHelper.vector3.create(),
		p = matrixHelper.vector3.create();

	matrixHelper.matrix4.multiplyVector(d, transform, this.direction);
	matrixHelper.matrix4.multiplyPoint(p, transform, this.position);

	
	gl.uniform1i(this.shaderIndices.inUseVertex, this.inUse);
	gl.uniform1i(this.shaderIndices.inUseFragment, this.inUse);

	gl.uniform1i(this.shaderIndices.typeVertex, this.type);
	gl.uniform1i(this.shaderIndices.typeFragment, this.type);
	gl.uniform1i(this.shaderIndices.attenuation, this.attenuation);
	gl.uniform1f(this.shaderIndices.alpha, this.alpha);
	gl.uniform1f(this.shaderIndices.beta, this.beta);
	gl.uniform3f(this.shaderIndices.position, p[0], p[1], p[2]);
	gl.uniform3f(this.shaderIndices.direction, d[0], d[1], d[2]);
	gl.uniform3f(this.shaderIndices.ambient, this.ambient[0], this.ambient[1], this.ambient[2]);
	gl.uniform3f(this.shaderIndices.diffuse, this.diffuse[0], this.diffuse[1], this.diffuse[2]);
	gl.uniform3f(this.shaderIndices.specular, this.specular[0], this.specular[1], this.specular[2]);
}

Light.prototype.use = function(gl)
{
	if (!this.shaderIndices.bound) { 
		alert("Please bind light before using it!");
		return;
	}

	this.inUse = 1;

	gl.uniform1i(this.shaderIndices.inUseVertex, this.inUse);
	gl.uniform1i(this.shaderIndices.inUseFragment, this.inUse);

	gl.uniform1i(this.shaderIndices.typeVertex, this.type);
	gl.uniform1i(this.shaderIndices.typeFragment, this.type);
	gl.uniform1i(this.shaderIndices.attenuation, this.attenuation);
	gl.uniform1f(this.shaderIndices.alpha, this.alpha);
	gl.uniform1f(this.shaderIndices.beta, this.beta);
	gl.uniform3f(this.shaderIndices.position, this.position[0], this.position[1], this.position[2]);
	gl.uniform3f(this.shaderIndices.direction, this.direction[0], this.direction[1], this.direction[2]);
	gl.uniform3f(this.shaderIndices.ambient, this.ambient[0], this.ambient[1], this.ambient[2]);
	gl.uniform3f(this.shaderIndices.diffuse, this.diffuse[0], this.diffuse[1], this.diffuse[2]);
	gl.uniform3f(this.shaderIndices.specular, this.specular[0], this.specular[1], this.specular[2]);
}

Light.prototype.setUnused = function(){
	this.inUse = 0;
}