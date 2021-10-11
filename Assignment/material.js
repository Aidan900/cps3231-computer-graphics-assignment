//--------------------------------------------------------------------------------------------------------//
//  Material
//--------------------------------------------------------------------------------------------------------//
function Material() 
{
	this.ambient = [0.2, 0.2, 0.2];
	this.diffuse = [1, 1, 1];
	this.specular = [1, 1, 1];
	this.shininess = 32.0;
	
	this.albedoTexture = 0;

	this.shaderIndices = {
		bound : false, ambient : 0, diffuse : 0, specular : 0, shininess : 0, samplerIndex : 0
	}
}

Material.prototype.setAlbedo = function(gl, albedo)
{
	var textureImage = albedo;

	this.albedoTexture = gl.createTexture();

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.albedoTexture);

	// Flip the image's Y axis to match the WebGL texture coordinate space.
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	  
	// Set the parameters so we can render any size image.        
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
}

Material.prototype.setAmbient = function(ambientContribution) {
	this.ambient = ambientContribution;
}

Material.prototype.setDiffuse = function(diffuseContribution) {
	this.diffuse = diffuseContribution;
}

Material.prototype.setSpecular = function(specularContribution) {
	this.specular = specularContribution;
}

Material.prototype.setShininess = function(shininessFactor) {
	this.shininess = shininessFactor;
}

Material.prototype.bind = function(gl, shaderProgram)
{
	this.shaderIndices.bound = true;
	this.shaderIndices.ambient = gl.getUniformLocation(shaderProgram, "uAmbient");
	this.shaderIndices.diffuse = gl.getUniformLocation(shaderProgram, "uDiffuse");
	this.shaderIndices.specular = gl.getUniformLocation(shaderProgram, "uSpecular");
	this.shaderIndices.shininess = gl.getUniformLocation(shaderProgram, "uShininess");
	this.shaderIndices.samplerIndex = gl.getUniformLocation( shaderProgram, "uTexture_0" );
}

Material.prototype.use = function(gl)
{
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.albedoTexture);

	if (!this.shaderIndices.bound) { 
		alert("Please bind material before using it!");
		return;
	}

  	gl.uniform1i(this.shaderIndices.samplerIndex, 0);
	gl.uniform3f(this.shaderIndices.ambient, this.ambient[0], this.ambient[1], this.ambient[2]);
	gl.uniform3f(this.shaderIndices.diffuse, this.diffuse[0], this.diffuse[1], this.diffuse[2]);
	gl.uniform3f(this.shaderIndices.specular, this.specular[0], this.specular[1], this.specular[2]);
	gl.uniform1f(this.shaderIndices.shininess, this.shininess);
}