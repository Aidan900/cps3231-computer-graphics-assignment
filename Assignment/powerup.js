
function powerupHandler(scene){
    this.scene = scene;
    this.activePowerups = new Map();
    this.materials = loadMaterials(this.scene.gl, this.scene);

    //Putting the handler as a node so as to make use of the animation callback
    var pNode = scene.addNode(scene.root, this, "PowerupHandler",Node.NODE_TYPE.GROUP);

    pNode.animationCallback = function(deltaTime)
    {
        this.nodeObject.activePowerups.forEach((_value, key, _map) => {
            //console.log("KEY: ", key)
            switch(key){
                case POWER.BREAK_BRICKS: this.nodeObject.breakBrickPowerup();break;
                case POWER.SLOW_BALL: this.nodeObject.slowBallPowerup();break;
                case POWER.STICKY_BALL: this.nodeObject.stickyBallPowerup();break;
                case POWER.SCALE_PADDLE: this.nodeObject.scalePaddlePowerup();break;
                case POWER.LASER: this.nodeObject.laserPowerup();break;
            }
        });
    }
}

function powerupObject(initTime = 0){
    this.maximumTime = initTime;
    this.time = Date.now();
    this.prevSpeed = 0;
    this.laserNode = null
    this.unscaledPaddleInfo = null;
}

powerupHandler.prototype.breakBrickPowerup = function ()
{
    var currentTime =  Date.now();
    var timeDiff = (currentTime - this.activePowerups.get(POWER.BREAK_BRICKS).time) / 1000 //removing ms
    var ballNode = this.scene.findNode("ball");
    if(timeDiff > this.activePowerups.get(POWER.BREAK_BRICKS).maximumTime){//End powerup
        ballNode.nodeObject.break = false;
        this.activePowerups.delete(POWER.BREAK_BRICKS);
    }
    else
        ballNode.nodeObject.break = true;
}

powerupHandler.prototype.slowBallPowerup = function ()
{
    var powerup = this.activePowerups.get(POWER.SLOW_BALL);
    var currentTime =  Date.now();
    var timeDiff = (currentTime - powerup.time) / 1000 //removing ms
    var ballNode = this.scene.findNode("ball");
    if(timeDiff > powerup.maximumTime)
    {
        ballNode.physicsBody.speed = powerup.prevSpeed;
        this.activePowerups.delete(POWER.SLOW_BALL);
    }
    else
    {
        if (!ballNode.nodeObject.isCharging && ballNode.physicsBody.speed != powerup.prevSpeed / 2)
        {
            //If not stuck to paddle and there is a change in speed, halve the new speed instead
            powerup.prevSpeed = ballNode.physicsBody.speed;
            ballNode.physicsBody.speed /= 2;
        }
    }
}

powerupHandler.prototype.stickyBallPowerup = function()
{
    var powerup = this.activePowerups.get(POWER.STICKY_BALL);
    var currentTime =  Date.now();
    var timeDiff = (currentTime - powerup.time) / 1000 //removing ms
    var ballNode = this.scene.findNode("ball");
    if (timeDiff > powerup.maximumTime)
        ballNode.nodeObject.stick = false;
    else
        ballNode.nodeObject.stick = true;
}

powerupHandler.prototype.scalePaddlePowerup = function()
{
    var powerup = this.activePowerups.get(POWER.SCALE_PADDLE);
    var currentTime =  Date.now();
    var timeDiff = (currentTime - powerup.time) / 1000 //removing ms

    if(powerup.unscaledPaddleInfo === null){
        var paddleStuff = this.createScaledPaddle();
        var pNode = this.scene.findNode("Paddle");
        powerup.unscaledPaddleInfo = {
            model: pNode.nodeObject,
            physics: pNode.physicsBody
        }
        pNode.nodeObject = paddleStuff.model;
        paddleStuff.physics.transform = pNode.transform;
        paddleStuff.physics.generatePaddleBody(10, 1);
        pNode.physicsBody = paddleStuff.physics;
       // pNode.physicsBody.transform = pNode.transform;
    }
    //console.log("Time: ", timeDiff);
    var pNode = this.scene.findNode("Paddle");
    if (timeDiff > powerup.maximumTime){
        pNode.nodeObject = powerup.unscaledPaddleInfo.model;
        pNode.physicsBody = powerup.unscaledPaddleInfo.physics;
        pNode.physicsBody.transform = pNode.transform;
        this.activePowerups.delete(POWER.SCALE_PADDLE);
    }
}

powerupHandler.prototype.createScaledPaddle = function ()
{
    paddleColor = [0.0,0.0,0.0];
    var paddle = generateBlock(
        [[-5, -0.5, 0], [5, -0.5, 0], [5, 0.5, 0], [-5, 0.5, 0],    [-5, -0.5, -2], [5, -0.5, -2], [5, 0.5, -2], [-5, 0.5, -2]], 
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],                            [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]], 
        [paddleColor, paddleColor, paddleColor, paddleColor,    paddleColor, paddleColor, paddleColor, paddleColor, paddleColor],
        [[0,0], [1,0], [1,1], [0,1],                                             [0,1], [0,0], [0,1], [1,1]]
        );

    var paddleModel = new Model();
    paddleModel.name = "Paddle";
    paddleModel.index = paddle.index;
    paddleModel.vertex = paddle.vertex;
    paddleModel.material = this.materials[4];
    paddleModel.compile(scene);

    var paddlePhysics = new physicsBody();
    //paddlePhysics.generatePaddleBody(10, 1);

    return {model: paddleModel, physics: paddlePhysics};
}

powerupHandler.prototype.splitBallPowerup = function()
{
    var pHandler = this;
    var scene = this.scene;
    var ball = makeSphere([0.0,0.0,0.0], 0.7, 50, 50, [0.5,0.5,0.5]);

    var dirLightNode = scene.findNode("DirLight");
    var ogBallNode = scene.findNode("ball");

    var ballModel = new Model();
    ballModel.name = "splitBall"; //all copies will be named splitball. this should be ok as nodes are stored as they are added therefore first occuring one should be deleted
    ballModel.index = ball.index;
    ballModel.vertex = ball.vertex;
    ballModel.material = ogBallNode.nodeObject.material;
    ballModel.time = Date.now();
    ballModel.compile(this.scene);

    var ballNode = scene.addNode(dirLightNode, ballModel, ballModel.name, Node.NODE_TYPE.MODEL);
    matrixHelper.matrix4.makeTranslation(ballNode.transform, [ogBallNode.transform[12] - 1.5, ogBallNode.transform[13], ogBallNode.transform[14]]);

    var ballPhysics = new physicsBody(false);
    ballPhysics.direction = [-ogBallNode.physicsBody.direction[0], ogBallNode.physicsBody.direction[1], ogBallNode.physicsBody.direction[2]];
    ballPhysics.transform = ballNode.transform;
    ballPhysics.generateSphereBody(0.71);
    ballNode.physicsBody = ballPhysics;
    ballNode.physicsBody.speed = ogBallNode.physicsBody.speed;

    ballNode.animationCallback = function (deltaTime)
    {
        var currentTime =  Date.now();
        var timeDiff = (currentTime - this.nodeObject.time) / 1000 //removing ms
        if(timeDiff > 10)
            scene.removeNode("splitBall");
        else
        {
            var distance = deltaTime * 0.01 * this.physicsBody.speed; //* speed
            var mapNode = scene.findNode("mapNode");
            var intersectNode = mapNode.getIntersectingNode(this.physicsBody);

            if(intersectNode != null)
            {
                intersectNode.physicsBody.bounce(this.physicsBody);
                if (intersectNode.isDestructible) intersectNode.deactivateNode();
                if (intersectNode.nodeObject.powerup != null && intersectNode.name != "powerupDrop") pHandler.createDrop(intersectNode.nodeObject.powerup, intersectNode.transform)
            }
            //transforming ball according to its direction
            var pTranslation = matrixHelper.matrix4.create();
            var newPoint = matrixHelper.vector3.create();
            var newVelocity = matrixHelper.vector3.create();
            matrixHelper.vector3.mult(newVelocity, this.physicsBody.direction, distance);
            matrixHelper.matrix4.makeTranslation(pTranslation, newVelocity);
            matrixHelper.matrix4.multiplyPoint(newPoint, pTranslation, [this.transform[12],this.transform[13],this.transform[14]]);
            this.transform[12] = newPoint[0];
            this.transform[13] = newPoint[1];
            this.transform[14] = newPoint[2];
            this.physicsBody.transform = this.transform;
        }
    }
}

powerupHandler.prototype.laserPowerup = function ()
{
    var powerup = this.activePowerups.get(POWER.LASER);
    var currentTime =  Date.now();
    var timeDiff = (currentTime - powerup.time) / 1000 //removing ms

    if(powerup.laserNode == null){
        powerup.laserNode = this.createLaser();
    }
    
    if(timeDiff >= 1.5){
        if(powerup.maximumTime > 0){
            var paddleNode = this.scene.findNode("Paddle");
            powerup.maximumTime--;
            powerup.time = Date.now();
            powerup.laserNode.transform[12] = paddleNode.transform[12];
            powerup.laserNode.transform[13] = paddleNode.transform[13] + 2;
        }
        else{
            this.scene.removeNode("laser");
            this.activePowerups.delete(POWER.LASER);
        }
    }
}

powerupHandler.prototype.createLaser = function()
{
    var pHandler = this;
    var scene = this.scene;
    var laser = generateBlock(
        [[-0.25, -0.75, -0.5], [0.25, -0.75, -0.5], [0.25, 0.75, -0.5], [-0.25, 0.75, -0.5],    [-0.25, -0.75, -1], [0.25, -0.75, -1], [0.25, 0.75, -1], [-0.25, 0.75, -1]], 
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],                            [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]], 
        [[1,0,0], [1,0,0], [1,0,0], [1,0,0],    [1,0,0], [1,0,0], [1,0,0], [1,0,0], [1,0,0]],
        [[0,0], [1,0], [1,1], [0,1],                                             [0,1], [0,0], [0,1], [1,1]]
        );

    var laserModel = new Model();
    laserModel.name = "laser";
    laserModel.index = laser.index;
    laserModel.vertex = laser.vertex;
    laserModel.material = this.materials[0];
    laserModel.compile(scene);
    
    var laserNode = scene.addNode(scene.findNode("DirLight"), laserModel, laserModel.name, Node.NODE_TYPE.MODEL);
    matrixHelper.matrix4.makeTranslation(laserNode.transform, [500, 0, 0]); //place it anywhere on map (transform is updated later)

    var laserPhysics = new physicsBody(false);
    laserPhysics.transform = laserNode.transform;
    laserPhysics.generateBoxBody(0.5, 1.5);
    laserPhysics.direction = [0,1,0];
    laserPhysics.speed = 4;
    laserNode.physicsBody = laserPhysics;

    laserNode.animationCallback = function(deltaTime)
    {
        var distance = deltaTime * 0.01 * this.physicsBody.speed; //* speed
        var groupNode = scene.findNode("BrickGroupNode");
        //Only need to test with bricks/blocks
        var intersectNode = groupNode.getIntersectingNode(this.physicsBody);
        if(intersectNode != null){
            if (intersectNode.isDestructible) intersectNode.deactivateNode();
            if (intersectNode.nodeObject.powerup != null) pHandler.createDrop(intersectNode.nodeObject.powerup, intersectNode.transform)
            this.transform[12] = 500; //place it somewhere arbitrary instead of deleting 
            this.transform[13] = 0;
        }
        else{
            var pTranslation = matrixHelper.matrix4.create();
            var newPoint = matrixHelper.vector3.create();
            var newVelocity = matrixHelper.vector3.create();
            matrixHelper.vector3.mult(newVelocity, this.physicsBody.direction, distance);
            matrixHelper.matrix4.makeTranslation(pTranslation, newVelocity);
            matrixHelper.matrix4.multiplyPoint(newPoint, pTranslation, [this.transform[12],this.transform[13],this.transform[14]]);
            this.transform[12] = newPoint[0];
            this.transform[13] = newPoint[1];
            //this.transform[14] = newPoint[2];
            this.physicsBody.transform = this.transform;
        }
    }

    return laserNode;
}

powerupHandler.prototype.createDrop = function(powerType, transform)
{
    var pHandler = this;
    var scene = this.scene;
    var ball = makeSphere([0.0,0.0,0.0], 0.3, 50, 50, [0.5,0.5,0.5]);

    var dirLightNode = scene.findNode("DirLight");

    var ballModel = new Model();
    ballModel.name = "powerupDrop"; //all copies will be named splitball. this should be ok as nodes are stored as they are added therefore first occuring one should be deleted
    ballModel.index = ball.index;
    ballModel.vertex = ball.vertex;
    ballModel.powerup = powerType;
    ballModel.material = this.materials[2];
    ballModel.compile(this.scene);

    var powerupNode = this.scene.addNode(dirLightNode, ballModel, ballModel.name, Node.NODE_TYPE.MODEL);
    matrixHelper.matrix4.to(powerupNode.transform, transform);

    var ballPhysics = new physicsBody(false);
    ballPhysics.direction = [0, -1, 0];
    ballPhysics.speed = 2;
    ballPhysics.transform = powerupNode.transform;
    ballPhysics.generateSphereBody(0.31);
    powerupNode.physicsBody = ballPhysics;

    powerupNode.animationCallback = function (deltaTime)
    {
        var distance = deltaTime * 0.01 * this.physicsBody.speed; //* speed
        var paddleNode = scene.findNode("Paddle");
        var intersectNode = paddleNode.getIntersectingNode(this.physicsBody); //only interested in colliding with paddle

        if(intersectNode != null)
        {
            pHandler.handlePowerup(this.nodeObject.powerup);
            scene.removeNode(this.name);
        }
        //transforming ball according to its direction
        var pTranslation = matrixHelper.matrix4.create();
        var newPoint = matrixHelper.vector3.create();
        var newVelocity = matrixHelper.vector3.create();
        matrixHelper.vector3.mult(newVelocity, this.physicsBody.direction, distance);
        matrixHelper.matrix4.makeTranslation(pTranslation, newVelocity);
        matrixHelper.matrix4.multiplyPoint(newPoint, pTranslation, [this.transform[12],this.transform[13],this.transform[14]]);
        this.transform[12] = newPoint[0];
        this.transform[13] = newPoint[1];
        this.transform[14] = newPoint[2];
        this.physicsBody.transform = this.transform;
    }
}

powerupHandler.prototype.handlePowerup = function(powerType)
{
    console.log("ACTIVATE POWERUP: ", powerType)
    switch(powerType)
    {
        case POWER.BREAK_BRICKS: {
            if(!this.activePowerups.has(POWER.BREAK_BRICKS))
                this.activePowerups.set(POWER.BREAK_BRICKS, new powerupObject(5));
            else
                this.activePowerups.get(POWER.BREAK_BRICKS).time = Date.now(); //reset timer - dont create a new power up
        };break;

        case POWER.SLOW_BALL: {
            if(!this.activePowerups.has(POWER.SLOW_BALL))
                this.activePowerups.set(POWER.SLOW_BALL, new powerupObject(15));
            else
                this.activePowerups.get(POWER.SLOW_BALL).time = Date.now(); 
        };break;

        case POWER.STICKY_BALL: {
            if(!this.activePowerups.has(POWER.STICKY_BALL))
            this.activePowerups.set(POWER.STICKY_BALL, new powerupObject(10));
        else
            this.activePowerups.get(POWER.STICKY_BALL).time = Date.now();
        };break;

        case POWER.SCALE_PADDLE: {
            if(!this.activePowerups.has(POWER.SCALE_PADDLE))
                this.activePowerups.set(POWER.SCALE_PADDLE, new powerupObject(10));
            else
                this.activePowerups.get(POWER.SCALE_PADDLE).time = Date.now(); 
        };break;

        case POWER.SPLIT_BALL: { //no need to create powerup entry. The ball handles its own termination
            this.splitBallPowerup();
        };break;

        case POWER.LASER: {
            if(!this.activePowerups.has(POWER.LASER))
                this.activePowerups.set(POWER.LASER, new powerupObject(5)); //in this case argument is amount of bullets
            else
                this.activePowerups.get(POWER.LASER).maximumTime = 5; 
        };break;
    }
} 

POWER = {
    BREAK_BRICKS : 0,
    SLOW_BALL: 1,
    STICKY_BALL: 2,
    SCALE_PADDLE: 3,
    SPLIT_BALL: 4,
    LASER: 5
}

function generateRandomPowerup(){
    var min = 0;
    var max = 5;
    var rand = Math.floor(Math.random() * (max - min + 1)) + min;

    switch(rand)
    {
        case 0:return POWER.BREAK_BRICKS;break;
        case 1:return POWER.SLOW_BALL;break;
        case 2:return POWER.STICKY_BALL;break;
        case 3:return POWER.SCALE_PADDLE;break;
        case 4:return POWER.SPLIT_BALL;break;
        case 5:return POWER.LASER;break;
        default: alert("Error generating random powerup");
    }
}