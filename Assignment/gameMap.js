var materials = []

function arkanoidMap()
{
    this.blocksLeft = 0;
    this.lives = 3;
    this.blocks = {};
}

function convertTextures(textureList) {
    for (var e in textureList) {
      var img = document.createElement("img");
      var imgContainer = document.getElementById("imageCollection");
      img.src = textureList[`${e}`];
      imgContainer.appendChild(img);
  
      textureList[`${e}`] = img;
    };
  }
  

arkanoidMap.prototype.generateMap = function(blockColumns, blockRows, gl, scene)
{
    var Mat4x4 = matrixHelper.matrix4;

    const rowLimit = 7;

    if (blockRows> rowLimit) {
        alert("Number of rows exceeds limit");
        return;
    }

    var blockId = 0;
    const width = 3.0;
    const height = 1.0;

    const bHeight = height/2.0;
    const bWidth = width/2.0;
    const bDepth = 2.0;
    const blockOffset = 0.1;
    var mapCentreX = (width * blockColumns + (blockColumns - 1) * blockOffset)/2;

    var mapNode = scene.addNode(scene.root, this, "mapNode", Node.NODE_TYPE.GROUP);

    var dirLightNode = setUpLights(gl, scene, mapNode);

    materials = loadMaterials(gl,scene);

    console.log(materials)

    Mat4x4.makeTranslation(mapNode.transform, [-mapCentreX,10,0]);
    
    var brickGroupNode = scene.addNode(dirLightNode, new Object(), "BrickGroupNode", Node.NODE_TYPE.GROUP);

    var blockColor = [0.0,0.0,0.0];
    var block = generateBlock(
        [[-bWidth, -bHeight, 0], [bWidth, -bHeight, 0], [bWidth, bHeight, 0], [-bWidth, bHeight, 0],    [-bWidth, -bHeight, -bDepth], [bWidth, -bHeight, -bDepth], [bWidth, bHeight, -bDepth], [-bWidth, bHeight, -bDepth]], 
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],        [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]], 
        [blockColor, blockColor, blockColor, blockColor,        blockColor, blockColor, blockColor, blockColor, blockColor],
        [[0,0], [1,0], [1,1], [0,1],                                             [0,1], [0,0], [0,1], [1,1]]
        );
    
    this.blocksLeft = blockColumns * blockRows;

    for(var i = 0; i < blockRows; ++i)
    {
        var x = bWidth;
        for(var j = 0; j < blockColumns; ++j)
        {
            var matIndex = Math.round(Math.random() * 3);

            var blockModel = new Model();
            blockModel.name = "Block" + blockId++;
            blockModel.index = block.index;
            blockModel.vertex = block.vertex;
            blockModel.material = materials[matIndex];
            blockModel.compile(scene);

            var rand = Math.random();
            if(rand <= 0.1) {
              blockModel.powerup = generateRandomPowerup();
              console.log("GENERATED POWERUP: ", blockModel.powerup);
            }

            this.blocks[blockModel.name] = [[x, -i * (height +blockOffset) , 0]];
            x += width + blockOffset;
            var blockNode = scene.addNode(brickGroupNode, blockModel, blockModel.name, Node.NODE_TYPE.MODEL);
            blockNode.isDestructible = true;
            Mat4x4.makeTranslation(blockNode.transform, this.blocks[blockModel.name][0]);

            var pBody = new physicsBody();
            pBody.transform = blockNode.transform;
            pBody.generateBoxBody(width,height);
            blockNode.physicsBody = pBody;
        };
    };

    const borderColor = [0.0, 0.0, 0.0];
    //var bH = (blockRows * height * 2 + blockRows) / 2; //border height
    var bH = (rowLimit + (rowLimit-1) * blockOffset) * 2;
    var bW = 2; //border width
    var borderBlock = generateBlock(
        [[-bW, -bH, 0], [bW, -bH, 0], [bW, bH, 0], [-bW, bH, 0],    [-bW, -bH, -2], [bW, -bH, -2], [bW, bH, -2], [-bW, bH, -2]], 
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],                [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]], 
        [borderColor, borderColor, borderColor, borderColor,        borderColor, borderColor, borderColor, borderColor, borderColor],
        [[0,0], [0,1], [1,1], [1,0],                                 [1,0], [0,0], [1,1], [0,1]]
        );

    var y = -(rowLimit + (rowLimit-1) * blockOffset - bHeight/2) * 2;

    var borderBlockLeft = new Model();
    borderBlockLeft.name = "BorderBlockLeft";
    borderBlockLeft.index = borderBlock.index;
    borderBlockLeft.vertex = borderBlock.vertex;
    borderBlockLeft.material = materials[5];
    borderBlockLeft.compile(scene);

    var lBorderNode = scene.addNode(brickGroupNode, borderBlockLeft, borderBlockLeft.name, Node.NODE_TYPE.MODEL);
    Mat4x4.makeTranslation(lBorderNode.transform, [-bW, y, 0]);
    
    var physicsBodyLeft = new physicsBody();
    physicsBodyLeft.transform = lBorderNode.transform;
    physicsBodyLeft.generateBoxBody(bW*2, bH * 2);
    lBorderNode.physicsBody = physicsBodyLeft;

    //======================================

    var borderBlockRight = new Model();
    borderBlockRight.name = "BorderBlockRight";
    borderBlockRight.index = borderBlock.index;
    borderBlockRight.vertex = borderBlock.vertex;
    borderBlockRight.material = materials[5];
    borderBlockRight.compile(scene);

    var rBorderNode = scene.addNode(brickGroupNode, borderBlockRight, borderBlockRight.name, Node.NODE_TYPE.MODEL);
    Mat4x4.makeTranslation(rBorderNode.transform, [mapCentreX*2 + bW, y, 0]);

    var physicsBodyRight = new physicsBody();
    physicsBodyRight.transform = rBorderNode.transform;
    physicsBodyRight.generateBoxBody(bW*2, bH * 2);
    rBorderNode.physicsBody = physicsBodyRight;


    //var tW = ((blockColumns +2) * width) / 2; /*+2 for border blocks */
    var tW = mapCentreX + 2*(bW);

    var tH = 2;
    var topBlock = generateBlock(
        [[-tW, -tH, 0], [tW, -tH, 0], [tW, tH, 0], [-tW, tH, 0],    [-tW, -tH, -2], [tW, -tH, -2], [tW, tH, -2], [-tW, tH, -2]], 
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],                            [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]], 
        [borderColor, borderColor, borderColor, borderColor,    borderColor, borderColor, borderColor, borderColor, borderColor],
        [[0,0], [0,1], [1,1], [1,0],                                             [1,0], [0,0], [1,1], [0,1]]
        );

    var borderBlockTop = new Model();
    borderBlockTop.name = "BorderBlockTop";
    borderBlockTop.index = topBlock.index;
    borderBlockTop.vertex = topBlock.vertex;
    borderBlockTop.material = materials[5];
    borderBlockTop.compile(scene);

    var tBorderNode = scene.addNode(brickGroupNode, borderBlockTop, borderBlockTop.name, Node.NODE_TYPE.MODEL);
    Mat4x4.makeTranslation(tBorderNode.transform, [mapCentreX, tH + bHeight, 0]);

    var physicsBodyTop = new physicsBody();
    physicsBodyTop.transform = tBorderNode.transform;
    physicsBodyTop.generateBoxBody(tW*2, tH * 2);
    tBorderNode.physicsBody = physicsBodyTop;

    //Fail block ============================
    var fBlock = generateBlock(
        [[-0, -0, 0], [0, -0, 0], [0, 0, 0], [-0, 0, 0],    [-0, -0, -2], [0, -0, -2], [0, 0, -2], [-0, 0, -2]], 
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],                            [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]], 
        [[0.0,0.0,0.0], [0.0,0.0,0.0], [0.0,0.0,0.0], [0.0,0.0,0.0],    [0.0,0.0,0.0], [0.0,0.0,0.0], [0.0,0.0,0.0], [0.0,0.0,0.0], [0.0,0.0,0.0]],
        [[0,0], [1,0], [1,1], [0,1],                                             [0,1], [0,0], [0,1], [1,1]]
        );

    var failBlockModel = new Model();
    failBlockModel.name = "failBlock";
    failBlockModel.index = fBlock.index;
    failBlockModel.vertex = fBlock.vertex;
    failBlockModel.material = materials[4];
    failBlockModel.compile(scene);

    //var ballPaddleGroupNode = scene.addNode(dirLightNode, new Object(), "ballPaddleNode", Node.NODE_TYPE.GROUP)

    var fBlockNode = scene.addNode(dirLightNode, failBlockModel, failBlockModel.name, Node.NODE_TYPE.MODEL);
    Mat4x4.makeTranslation(fBlockNode.transform, [mapCentreX, (y * 2) - 20, 0]);

    var fBlockPhysics = new physicsBody();
    fBlockPhysics.transform = fBlockNode.transform;
    fBlockPhysics.generatePaddleBody(100, 15);
    fBlockNode.physicsBody = fBlockPhysics;

    // ======================================
    
    paddleColor = [0.0,0.0,0.0]
    var paddle = generateBlock(
        [[-3, -0.5, 0], [3, -0.5, 0], [3, 0.5, 0], [-3, 0.5, 0],    [-3, -0.5, -2], [3, -0.5, -2], [3, 0.5, -2], [-3, 0.5, -2]], 
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],                            [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]], 
        [paddleColor, paddleColor, paddleColor, paddleColor,    paddleColor, paddleColor, paddleColor, paddleColor, paddleColor],
        [[0,0], [1,0], [1,1], [0,1],                                             [0,1], [0,0], [0,1], [1,1]]
        );

    var paddleModel = new Model();
    paddleModel.name = "Paddle";
    paddleModel.index = paddle.index;
    paddleModel.vertex = paddle.vertex;
    paddleModel.material = materials[4];
    paddleModel.compile(scene);

    //var ballPaddleGroupNode = scene.addNode(dirLightNode, new Object(), "ballPaddleNode", Node.NODE_TYPE.GROUP)

    var paddleNode = scene.addNode(dirLightNode, paddleModel, paddleModel.name, Node.NODE_TYPE.MODEL);
    Mat4x4.makeTranslation(paddleNode.transform, [mapCentreX, y * 2, 0]);

    var paddlePhysics = new physicsBody();
    paddlePhysics.transform = paddleNode.transform;
    paddlePhysics.generatePaddleBody(6, 1);
    paddleNode.physicsBody = paddlePhysics;


    var ball = makeSphere([0.0,0.0,0.0], 0.7, 50, 50, [0.5,0.5,0.5])

    var ballModel = new Model();
    ballModel.name = "ball";
    ballModel.index = ball.index;
    ballModel.vertex = ball.vertex;
    ballModel.material = materials[3];
    ballModel.compile(scene);

    var ballNode = scene.addNode(dirLightNode, ballModel, ballModel.name, Node.NODE_TYPE.MODEL);
    Mat4x4.makeTranslation(ballNode.transform, [mapCentreX, y * 2 + 1.3, -0.7]);

    var ballPhysics = new physicsBody(true);
    ballPhysics.direction = [0, 1, 0];
    ballPhysics.transform = ballNode.transform;
    ballPhysics.generateSphereBody(0.71);
    ballNode.physicsBody = ballPhysics;
    ballNode.physicsBody.speed = 1;

    //console.log(paddleNode);

    //console.log(ballNode);

    return paddleNode;
};


arkanoidMap.prototype.intersectBlocks = function(sphere,scene)
{
  //loop for each child
  var mapNode = scene.findNode("mapNode");

  var intersectNode = mapNode.getIntersectingNode(sphere);

  if (intersectNode != null)
  {
    if(intersectNode.isDestructible) this.blocksLeft--;
    return intersectNode;
  }

  else return null;
}

function setUpLights(gl, scene, mapNode)
{
  // [0.5, 0.5, 0.5]
  var spotLight2 = new Light();
  spotLight2.type = Light.LIGHT_TYPE.SPOT;
  //light2.type = Light.LIGHT_TYPE.POINT;
  //light.type = Light.LIGHT_TYPE.DIRECTIONAL;
  spotLight2.setDiffuse([2, 2, 2]);
  spotLight2.setSpecular([1, 1, 1]);
  spotLight2.setAmbient([0.4,0.4,0.6]);
  spotLight2.setPosition([0, 0, 0]);
  spotLight2.setDirection([0.2, 1, 0]);
  spotLight2.setCone(0.99, 0.95);
  spotLight2.attenuation = Light.ATTENUATION_TYPE.NONE;
  spotLight2.bind(gl, scene.shaderProgram, 0);

  var spotLight1 = new Light();
  spotLight1.type = Light.LIGHT_TYPE.SPOT;
  //light2.type = Light.LIGHT_TYPE.POINT;
  //light.type = Light.LIGHT_TYPE.DIRECTIONAL;
  spotLight1.setDiffuse([2, 2, 2]);
  spotLight1.setSpecular([1, 1, 1]);
  spotLight1.setAmbient([0.4,0.4,0.6]);
  spotLight1.setPosition([0, 0, 0]);
  spotLight1.setDirection([-0.2, 1, 0]);
  spotLight1.setCone(0.99, 0.95);
  spotLight1.attenuation = Light.ATTENUATION_TYPE.NONE;
  spotLight1.bind(gl, scene.shaderProgram, 1);

  var light = new Light();
  light.type = Light.LIGHT_TYPE.DIRECTIONAL;
  light.setDiffuse([2,2,2]);
  light.setSpecular([1, 1, 1]);
  light.setAmbient([0.4, 0.4, 0.4]);
  //light.setPosition([mapCentreX, 0, 10]);
  light.setDirection([0, 0, 1]);
  light.attenuation = Light.ATTENUATION_TYPE.NONE;
  light.bind(gl, scene.shaderProgram, 2);

  var ballPointLight = new Light();
  ballPointLight.type = Light.LIGHT_TYPE.POINT;
  ballPointLight.setDiffuse([1,1,1]);
  ballPointLight.setSpecular([2, 2, 2]);
  ballPointLight.setAmbient([1.0, 1.0, 1.0]);
  //ballPointLight.setPosition([mapCentreX, 0, 10]);
  //ballPointLight.setDirection([0, 0, 1]);
  ballPointLight.attenuation = Light.ATTENUATION_TYPE.QUAD;
  ballPointLight.bind(gl, scene.shaderProgram, 3);

  var spotLight2Node = scene.addNode(mapNode, spotLight2, "sp2", Node.NODE_TYPE.LIGHT);
  var spotLightNode = scene.addNode(spotLight2Node, spotLight1, "sp1", Node.NODE_TYPE.LIGHT);
  var ballLightNode = scene.addNode(spotLightNode, ballPointLight, "ballLight", Node.NODE_TYPE.LIGHT);
  var dirLightNode = scene.addNode(ballLightNode, light, "DirLight", Node.NODE_TYPE.LIGHT);

  setUpLightCallbacks(scene,  {dirLight: dirLightNode, ballLight: ballLightNode, sp1: spotLightNode, sp2: spotLight2Node});

  return dirLightNode; //returning last attached node so that blocks can attach to it
}

function setUpLightCallbacks(scene, lightNodes)
{
  lightNodes['ballLight'].animationCallback = function (deltaTime)
  {
    var ballNode = scene.findNode("ball");
    this.nodeObject.setPosition([ballNode.transform[12], ballNode.transform[13], ballNode.transform[14]]);
  }

  lightNodes['sp1'].animationCallback = function (deltaTime)
  {
    var pNode = scene.findNode("Paddle");
    this.nodeObject.setPosition([pNode.transform[12] - 3, pNode.transform[13] +0.7, pNode.transform[14]]) ;
  }

  lightNodes['sp2'].animationCallback = function (deltaTime)
  {
    var pNode = scene.findNode("Paddle");
    this.nodeObject.setPosition([pNode.transform[12] + 3, pNode.transform[13] + 0.7, pNode.transform[14]]) ;
  }
}

function loadMaterials(gl, scene)
{
    var textureList = new Textures();

    var materials = []
    convertTextures(textureList);

    var redBlock = new Material();
    redBlock.setAlbedo(gl, textureList.redBlock);
    redBlock.setShininess(32.0);
    redBlock.setSpecular([0,0,0]);
    redBlock.setAmbient([0.5,0.5,0.5]);
    redBlock.setDiffuse([1,1,1]);
    redBlock.bind(gl, scene.shaderProgram);
    materials.push(redBlock);

    var blueBlock = new Material();
    blueBlock.setAlbedo(gl, textureList.blueBlock);
    blueBlock.setShininess(32.0);
    blueBlock.setSpecular([0,0,0]);
    blueBlock.setAmbient([1.0,1.0,1.0]);
    blueBlock.setDiffuse([1,1,1]);
    blueBlock.bind(gl, scene.shaderProgram);
    materials.push(blueBlock);

    var greenBlock = new Material();
    greenBlock.setAlbedo(gl, textureList.greenBlock);
    greenBlock.setShininess(32.0);
    greenBlock.setSpecular([0,0,0]);
    greenBlock.setAmbient([1.0,1.0,1.0]);
    greenBlock.setDiffuse([1,1,1]);
    greenBlock.bind(gl, scene.shaderProgram);
    materials.push(greenBlock);

    var orangeBlock = new Material();
    orangeBlock.setAlbedo(gl, textureList.orangeBlock);
    orangeBlock.setShininess(32.0);
    orangeBlock.setSpecular([0,0,0]);
    orangeBlock.setAmbient([1.0,1.0,1.0]);
    orangeBlock.setDiffuse([1,1,1]);
    orangeBlock.bind(gl, scene.shaderProgram);
    materials.push(orangeBlock);

    var paddle = new Material();
    paddle.setAlbedo(gl, textureList.paddle);
    paddle.setShininess(32.0);
    paddle.setSpecular([0,0,0]);
    paddle.setAmbient([1.0,1.0,1.0]);
    paddle.setDiffuse([1,1,1]);
    paddle.bind(gl, scene.shaderProgram);
    materials.push(paddle);

    var border = new Material();
    border.setAlbedo(gl, textureList.wall);
    border.setShininess(15.0);
    border.setSpecular([0,0,0]);
    border.setAmbient([1.0,1.0,1.0]);
    border.setDiffuse([1,1,1]);
    border.bind(gl, scene.shaderProgram);
    materials.push(border);

    return materials;
}

function makeSphere(centre, radius, h, v, colour)
{
  var vertexList = [], indexList = [];
  for (var i = 0; i <= v + 1; i++) {
    for (var j = 0; j <= h; j++) {
      var theta = 2 * Math.PI * j / h;
      var y = (i / v - 0.5) * 2;
      var r = Math.sqrt(1 - y * y);
      var x = Math.cos(theta) * r; 
      var z = Math.sin(theta) * r;
      var point = [x, y, z];

      for (var k=0; k<3; k++)
        vertexList[vertexList.length] = point[k] * radius + centre[k];
      for (var k=0; k<3; k++)
        vertexList[vertexList.length] = point[k];
      for (var k=0; k<3; k++)
        vertexList[vertexList.length] = colour[k];

      vertexList[vertexList.length] = j/h;
      vertexList[vertexList.length] = i/v;
  }}
  
  for (var i = 0; i < v; i++) {
    for (var j = 0; j < h; j++) {
      indexList[indexList.length] = i * h + j;
      indexList[indexList.length] = (i + 1) * h + (j + 1) % h;
      indexList[indexList.length] = i * h + (j + 1) % h;
      indexList[indexList.length] = i * h + j;
      indexList[indexList.length] = (i + 1) * h + j;
      indexList[indexList.length] = (i + 1) * h + (j + 1) % h;
  }}

  return {vertex : vertexList, index : indexList};
};