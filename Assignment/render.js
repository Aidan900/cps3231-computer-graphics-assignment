// var isQPressed = false;
// var isEPressed = false;
// var isWPressed = false;
// var isSPressed = false;
// var isRPressed = false;
// var isTPressed = false;

var keys = {};

function initContext()
{
    // Get reference to canvas
    var canvas = document.getElementById("canvas-cg-lab");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.aspect = canvas.width / canvas.height;

    // Create context
    var context = {canvas:null, gl:null};
    context.canvas = canvas;
    context.gl = null;
  
    // Assign GL to context
    try { context.gl = canvas.getContext("webgl", {antialias: true}); }
    catch (e) {alert("No webGL compatibility detected!"); return false;}
  
    // Success
    return context;
}

function setUpListeners()
{

  //event.preventDefault();
  document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase())
    {
      case 'q': keys['q'] = true ;break;
      case 'e': keys['e'] = true ;break;
      case 'w': keys['w'] = true ;break;
      case 's': keys['s'] = true ;break;
      case 'r': keys['r'] = true ;break;
      case 't': keys['t'] = true ;break;
      case 'd': keys['d'] = true ;break;
      case 'a': keys['a'] = true ;break;
      case ' ': {
        keys[' '] = true ;
        e.preventDefault(); //to prevent scrolling downwards
      };break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase())
    {
      case 'q': keys['q'] = false ;break;
      case 'e': keys['e'] = false ;break;
      case 'w': keys['w'] = false ;break;
      case 's': keys['s'] = false ;break;
      case 'r': keys['r'] = false ;break;
      case 't': keys['t'] = false ;break;
      case 'd': keys['d'] = false ;break;
      case 'a': keys['a'] = false ;break;
      case ' ': keys[' '] = false ;break;
    }
    //console.log(`Key ${e.key} released`)
  })

  window.addEventListener('resize', resizeWindow, false);
}

function resizeWindow()
{
  var canvas = document.getElementById("canvas-cg-lab");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.aspect = canvas.width / canvas.height;
}


// Load shader program (from DOM element)
function loadShader(gl, shaderName, shaderType)
{
    try
    {
        var source = document.getElementById(shaderName).text;
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            return shader;
        
        alert("Error compiling '" + shaderName + "' shader, " + gl.getShaderInfoLog(shader));
    }
    catch(e)
    {
        alert("Exception : Cannot load shader '" + shaderName + "'!");
    }
}

var main = function()
{
  var context = initContext();

  var gl = context.gl;
  var canvas = context.canvas;

  setUpListeners();

  //Set up scene
  scene = new Scene();
  scene.initialise(gl, canvas);


  var gameMap = new arkanoidMap();
  gameMap.generateMap(14, 5, gl, scene);

  var pHandler = new powerupHandler(scene);

  var paddleNode = scene.findNode("Paddle");

  paddleNode.animationCallback = function (deltaTime)
  {
    var distance = deltaTime * 0.025; //* speed

    if (keys['a'] || keys['d'])
    {
      var pTranslation = Mat4x4.create();
      var temp = Vec3.create();
      if (keys['a'])
      {
        //console.log("A")
        Mat4x4.makeTranslation(pTranslation, [-distance, 0 ,0])
        Mat4x4.multiplyPoint(temp, pTranslation, [this.transform[12],this.transform[13],this.transform[14]]);
        this.transform[12] = temp[0]
        this.transform[13] = temp[1]
        this.transform[14] = temp[2]
      }
      else if (keys['d'])
      {
        //console.log("D")
        Mat4x4.makeTranslation(pTranslation, [distance, 0 , 0])
        Mat4x4.multiplyPoint(temp, pTranslation, [this.transform[12],this.transform[13],this.transform[14]]);
        this.transform[12] = temp[0]
        this.transform[13] = temp[1]
        this.transform[14] = temp[2]
      }
      //this.nodeObject.unscaledTransform = this.transform;
      this.physicsBody.transform = this.transform;
      this.physicsBody.updateDimensions();
    }
  }

  var Vec3 = matrixHelper.vector3;
  var Mat4x4 = matrixHelper.matrix4;

  var ballNode = scene.findNode("ball");

  ballNode.animationCallback = function (deltaTime)
  {
    if(this.physicsBody.static)
    {
      //this.transform
      if(keys[' ']) //if space is pressed
      {
        //console.log("Pressed")
        this.nodeObject.isCharging = true;
        if(this.physicsBody.speed < 3) this.physicsBody.speed += 0.05;
      }
      else if(!keys[' '] && this.nodeObject.isCharging === true) {
        this.physicsBody.static = false;
        this.nodeObject.isCharging = false;
        this.physicsBody.direction = [0, 1, 0];
      }
      this.transform[12] = paddleNode.transform[12];
      this.transform[13] = paddleNode.transform[13] + 1.5;
      this.transform[14] = paddleNode.transform[14];
    }
    else {
      var distance = deltaTime * 0.01 * this.physicsBody.speed; //* speed
      var mapNode = scene.findNode("mapNode");
      var intersectNode = mapNode.getIntersectingNode(this.physicsBody);

      if(intersectNode != null)
      {
        if (this.nodeObject.stick && intersectNode.name === "Paddle")
        {
          this.physicsBody.static = true;
          this.physicsBody.speed = 1;
        }
        else if (intersectNode.name === "failBlock")
        {
          scene.findNode("mapNode").nodeObject.lives--;
          this.physicsBody.static = true;
        }
        else if(this.nodeObject.break)
        { //Break bricks power up
          if (!intersectNode.isDestructible)
            intersectNode.physicsBody.bounce(this.physicsBody);
          else{
            scene.findNode("mapNode").nodeObject.blocksLeft--;
            intersectNode.deactivateNode();
          }
        }
        else // no powerup
        {
          intersectNode.physicsBody.bounce(this.physicsBody);
          if (intersectNode.isDestructible) {
            scene.findNode("mapNode").nodeObject.blocksLeft--;
            intersectNode.deactivateNode();}
        }
        if (intersectNode.nodeObject.powerup != null && intersectNode.name != "powerupDrop")
          pHandler.createDrop(intersectNode.nodeObject.powerup, intersectNode.transform);
      }

      //transforming ball according to its direction
      var pTranslation = Mat4x4.create();
      var newPoint = Vec3.create();
      var newVelocity = Vec3.create();
      Vec3.mult(newVelocity, this.physicsBody.direction, distance);
      Mat4x4.makeTranslation(pTranslation, newVelocity);
      Mat4x4.multiplyPoint(newPoint, pTranslation, [this.transform[12],this.transform[13],this.transform[14]]);
      this.transform[12] = newPoint[0];
      this.transform[13] = newPoint[1];
      this.transform[14] = newPoint[2];
    }
    this.physicsBody.transform = this.transform;
  }

  //var lightTransform = Mat4x4.create();
  var modelTransform = Mat4x4.create(); 
  var viewTransform = Mat4x4.create(); 
  var observer = Vec3.from(0,0,25);

  //Mat4x4.makeIdentity(blockNode.transform);
  Mat4x4.makeIdentity(viewTransform);
  Mat4x4.makeIdentity(modelTransform);
  //Mat4x4.makeIdentity(lightTransform);

  scene.setViewFrustum(1, 200, 0.5236);

  var theta = 0.0;
  const theta_max = 1.309;
  const theta_min = 0.0;
  var speed = 0.01;
  var prev_time = 0;
  var delta_time = 0;
  console.log(scene);

  var mapNode = scene.findNode("mapNode");
  var end = false;
  var animate = function(timestep)
  {
    timestep += 0.001;
    delta_time = timestep - prev_time;
    prev_time = timestep;

    if(mapNode.nodeObject.lives == 0 || mapNode.nodeObject.blocksLeft == 0)
    {
      //End game
      sleep(2000);
      end = true;
      console.log("END");
      //break;
    }
    else{
      if(keys['q']){ theta = theta_min; }
      else if(keys['e']) {theta = theta_max;} //75 degrees
      else if (keys['w']){
        if(theta > theta_min) theta -= speed;
      }
      else if (keys['s']){
        if(theta < theta_max) theta += speed;
      }

      if(keys['r']) speed += 0.0005;
      else if(keys['t']){if(speed - 0.006  > 0) speed -= 0.005;}

      Mat4x4.makeRotationX(viewTransform, theta);  // rotate camera about X
      Mat4x4.multiplyPoint(observer, viewTransform, [0,0,100]);  // apply camera rotation
      scene.lookAt(observer, [0,0,0], [0,1,0]);    // generate view matrix

      scene.beginFrame();
      //pHandler.breakBrickPowerup();
      //pHandler.slowBallPowerup();
      scene.animate();
      scene.draw();
      scene.endFrame();

      window.requestAnimationFrame(animate);
    }
  }

  animate();
}

function sleep(ms) {
  var date = Date.now();
  var currentDate = null;
  do {
      curDate = Date.now();
  } while (curDate-date < ms);
}
