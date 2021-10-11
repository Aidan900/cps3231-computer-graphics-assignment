//--------------------------------------------------------------------------------------------------------//
//  Scene Element
//--------------------------------------------------------------------------------------------------------//
function Node() 
{
	this.type = 0;
	this.name = "untitled";
	this.parent = null;
	this.children = [];
	this.nodeObject = null;
	this.physicsBody = null;
	this.isDestructible = false;
	this.active = true;

	// Create transform for node (= I)
	this.transform = matrixHelper.matrix4.create();
	matrixHelper.matrix4.makeIdentity(this.transform);

	this.animationCallback = null;
}

Node.NODE_TYPE = {
	GROUP_ROOT : 0,
	GROUP : 1,
	LIGHT : 2,
	MODEL : 3
}

Node.prototype.draw = function(scene, parentTransform) 
{
	var compositeTransform = matrixHelper.matrix4.create();
	matrixHelper.matrix4.multiply(compositeTransform, this.transform, parentTransform);

	if(this.active == true){
		if (this.type == Node.NODE_TYPE.MODEL)
		{
			if (this.nodeObject) {
				this.nodeObject.draw(scene, compositeTransform);
			}
		} 

		else if (this.type == Node.NODE_TYPE.LIGHT)
		{
			// Transform light before setting it
			if (this.nodeObject) {
				this.nodeObject.useTransformed(scene.gl, compositeTransform);
			}
		}

		var _type = this.type;
		var _nodeObject = this.nodeObject;

		this.children.forEach(function(childNode) {
			if (_type == Node.NODE_TYPE.LIGHT)
			{
				// Transform light before setting it
				if (_nodeObject) {
					_nodeObject.useTransformed(scene.gl, compositeTransform);
				}
			}

			childNode.draw(scene, compositeTransform);
		});

		if (this.type == Node.NODE_TYPE.LIGHT)
		{
			this.nodeObject.setUnused();
		}
	}
}

Node.prototype.animate = function(deltaTime)
{
	if (this.animationCallback)
		this.animationCallback(deltaTime);

	this.children.forEach(function(childNode) {
		childNode.animate(deltaTime);
	});
}

Node.prototype.getIntersectingNode = function(sphere)
{
	if(this.active)
	{
		if (this.physicsBody != null)
		{
			if(intersect(sphere, this.physicsBody))
				return this;
		}
		
		var intNode = null;
		if(this.children.length != 0)
		{
			for (var c = 0; c < this.children.length; ++c)
			{
				//console.log(c);
				intNode =  this.children[c].getIntersectingNode(sphere);
				if(intNode != null) return intNode;
			};
		}
		return null;
	}
}

Node.prototype.deactivateNode = function() {
	this.active = false;
}

Node.prototype.removeNode = function(name)
{
	if(this.active)
	{
		if (this.nodeObject!=null && this.name === name)
		{
			return this;
		}
		else{
			var dNode = null;
			if(this.children.length != 0)
			{
				for (c in this.children)
				{
					//dNode =  this.children[c].removeNode(name);
					if (this.children[c].name === name)
					{
						dNode = this.children.splice(c, 1);
						return dNode;
					}
					else{
						dNode = this.children[c].removeNode(name);
					}

					if(dNode !=null) return dNode;
				};
			}
			return null;
		}	
	}
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph
//--------------------------------------------------------------------------------------------------------//
function Scene() 
{
	this.gl = null;
	this.canvas = null;
	this.root = new Node();

	this.indexColour = 0;
	this.indexNormal = 0;
	this.indexPosition = 0;
	this.indexTexCoords = 0;

	this.indexMatrixView = 0;
	this.indexMatrixModel = 0;
	this.indexMatrixProjection = 0;

	this.matrixView = matrixHelper.matrix4.create();
	this.matrixModel = matrixHelper.matrix4.create();
	this.matrixProjection = matrixHelper.matrix4.create();

	this.shaderVertex = null;
	this.shaderFragment = null;

	this.shaderProgram = null;

	this.lastUpdate = Date.now();
}

//--------------------------------------------------------------------------------------------------------//
//  Helpers
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.loadShader = function(shaderName, shaderType, shaderTypeString)
{
  try 
  {
    var source = document.getElementById(shaderName).text;
    var shader = this.gl.createShader(shaderType);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
      return shader;

    alert("Error compiling shader '" + shaderName + "', " + this.gl.getShaderInfoLog(shader));
    return false;
  }

  catch (e)
  { 
    alert("Exception : Cannot load shader '" + shaderName + "'!"); 
  }
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Initialisation
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.initialiseShaders = function ()
{
	// Load vertex and fragment shaders
	this.shaderVertex = this.loadShader("vertex-shader", this.gl.VERTEX_SHADER, "VERTEX");
	this.shaderFragment = this.loadShader("fragment-shader", this.gl.FRAGMENT_SHADER, "FRAGMENT");

	// Create shader program context and attach compiled shaders
	this.shaderProgram = this.gl.createProgram();
	this.gl.attachShader(this.shaderProgram, this.shaderVertex);
	this.gl.attachShader(this.shaderProgram, this.shaderFragment);
	this.gl.linkProgram(this.shaderProgram);

	// Get attribute locations for color, normal, position and texture coordinates in vertex format
	this.indexColour = this.gl.getAttribLocation(this.shaderProgram, "color");
	this.indexNormal = this.gl.getAttribLocation(this.shaderProgram, "normal");
	this.indexPosition = this.gl.getAttribLocation(this.shaderProgram, "position");
	this.indexTexCoords = this.gl.getAttribLocation(this.shaderProgram, "texcoords");

	// Enable attributes
	this.gl.enableVertexAttribArray(this.indexColour);
	this.gl.enableVertexAttribArray(this.indexNormal);
	this.gl.enableVertexAttribArray(this.indexPosition);
	this.gl.enableVertexAttribArray(this.indexTexCoords);

	// Enable the use of shader program
	this.gl.useProgram(this.shaderProgram);
}

Scene.prototype.initialiseMatrices = function ()
{
	this.indexMatrixView = this.gl.getUniformLocation( this.shaderProgram, "viewMatrix" ); 
  	this.indexMatrixModel = this.gl.getUniformLocation( this.shaderProgram, "modelMatrix" );
  	this.indexMatrixProjection = this.gl.getUniformLocation( this.shaderProgram, "projectionMatrix" );

	matrixHelper.matrix4.makeIdentity(this.matrixView);
	matrixHelper.matrix4.makeIdentity(this.matrixModel);
	matrixHelper.matrix4.makeIdentity(this.matrixProjection);
}

Scene.prototype.initialiseFlags = function ()
{
	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  	this.gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);

  	this.gl.enable(this.gl.DEPTH_TEST);
  	this.gl.depthFunc(this.gl.LESS);
}

Scene.prototype.initialise = function(gl, canvas)
{
	this.gl = gl;
	this.canvas = canvas;

	this.initialiseShaders();
	this.initialiseMatrices();
	this.initialiseFlags();
}

//--------------------------------------------------------------------------------------------------------//
//  Bind model prior to rendering
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.bindModelData = function(vertexBuffer, indexBuffer) 
{
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);

    // Show how to interpret vertex format attributes
    this.gl.vertexAttribPointer(this.indexPosition, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11*4, 0);
    this.gl.vertexAttribPointer(this.indexNormal, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11*4, 3*4);
    this.gl.vertexAttribPointer(this.indexColour, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11*4, 6*4);
    this.gl.vertexAttribPointer(this.indexTexCoords, 2, this.gl.FLOAT, this.gl.GL_FALSE, 11*4, 9*4);

    // Bind index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph transform management
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.updateView = function() {
    this.gl.uniformMatrix4fv(this.indexMatrixView, false, this.matrixView);
}

Scene.prototype.updateProjection = function() {
    this.gl.uniformMatrix4fv(this.indexMatrixProjection, false, this.matrixProjection);  	
}

Scene.prototype.updateModel = function() {
    this.gl.uniformMatrix4fv(this.indexMatrixModel, false, this.matrixModel); 
}

Scene.prototype.setViewFrustum = function(near, far, fov)
{
	matrixHelper.matrix4.makeProjection(this.matrixProjection, near, far, fov, this.canvas.aspect);	
}

Scene.prototype.lookAt = function(position, target, up)
{
	matrixHelper.matrix4.lookAt(this.matrixView, position, target, up);
}

Scene.prototype.setModel = function(model)
{
	matrixHelper.matrix4.to(this.matrixModel, model);
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph node managment
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.findNode = function(nodeName) 
{
	var stack = [this.root];

	while(stack.length != 0) {
		var node = stack.pop();
		
		if (node.name.localeCompare(nodeName) == 0)
			return node;

		node.children.forEach(function(childNode) {
			stack.push(childNode);
		});
	}
}

Scene.prototype.removeNode = function (name)
{
	return this.root.removeNode(name);
}

Scene.prototype.addNode = function(parent, nodeObject, nodeName, nodeType) 
{
	var node = new Node();
	node.name = nodeName;
	node.type = nodeType;
	node.nodeObject = nodeObject;
	node.parent = parent;

	parent.children[parent.children.length] = node;

	return node;
}

//--------------------------------------------------------------------------------------------------------//
//  Animation and Rendering scene graph methods
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.beginFrame = function() 
{
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	this.updateProjection();
	this.updateView();
}

Scene.prototype.endFrame = function() {
	this.gl.flush();
}

Scene.prototype.animate = function() 
{
	var now = Date.now();
	var deltaTime = now - this.lastUpdate;
	this.lastUpdate = now;

	this.root.animate(deltaTime);
}

Scene.prototype.draw = function() {
	this.root.draw(this, matrixHelper.matrix4.identity);
}