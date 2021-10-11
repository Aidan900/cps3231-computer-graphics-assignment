function physicsBody(static = true)
{
    this.type = "none";
    this.speed = 0;
    this.direction = [0,0,0];
    this.static = static;
    this.transform = 0;
    this.maxX = 0;
    this.maxY = 0;
    this.minY = 0;
    this.minX = 0;
    this.width = 0;
    this.height = 0;
    this.radius = 0;

    this.changed = false; //this is to prevent colliding balls from changing each other's velocities twice. Not the best solution...
}

physicsBody.prototype.generateBoxBody = function(width, height)
{
    this.type = "box";

    this.width = width * 0.5;
    this.height = height * 0.5;

    this.updateDimensions();
}

physicsBody.prototype.generatePaddleBody = function(width, height)
{
    this.generateBoxBody(width, height);
    this.type = "paddle";
}

physicsBody.prototype.generateSphereBody = function(radius)
{
    this.type="sphere";
    this.radius = radius;
}

physicsBody.prototype.bounce = function(bodyHit)
{
    var x = Math.max(this.minX, Math.min(bodyHit.transform[12], this.maxX));
    var y = Math.max(this.minY, Math.min(bodyHit.transform[13], this.maxY));

    //var c = getClosestPointOnBody(bodyHit, this);
    if(this.type === "box")
    {
        //console.log("BOX: " , this);
        if (y == this.minY /*|| y < this.transform[13]*/) 
            bodyHit.direction[1] = -Math.abs(bodyHit.direction[1]);
        else if (x == this.minX /*|| x < this.transform[12]*/)
            bodyHit.direction[0] = -Math.abs(bodyHit.direction[0])
        else if (x == this.maxX /* || x > this.transform[12] */)
            bodyHit.direction[0] = Math.abs(bodyHit.direction[0])
        else if (y == this.maxY /*|| y > this.transform[13]*/)
            bodyHit.direction[1] = Math.abs(bodyHit.direction[1]);
        else { //ball is inside box
            var normalised = matrixHelper.vector3.create();
            matrixHelper.vector3.normalise(normalised , [x - this.transform[12], y - this.transform[13], 0]);
            bodyHit.direction = normalised;
        }
    }
    else if (this.type === "paddle")
    {
       // console.log("PADDLE");
        var normalised = matrixHelper.vector3.create();
        //calculate collision from a point a bit below the paddle for more control
        matrixHelper.vector3.normalise(normalised , [x - this.transform[12], y - (this.transform[13] - 2), 0]); 
        bodyHit.direction = normalised;
    }
    // else if(bodyHit.type=== "sphere")
    // {
    //     if(!this.changed)
    //     {
    //         //swapping directions since no momentum is involved
    //         var temp = this.direction;
    //         this.direction = bodyHit.direction;
    //         bodyHit.direction = temp;
    //         bodyHit.changed = true;
    //     }
    // }
}


physicsBody.prototype.updateDimensions = function()
{
    this.maxX = this.transform[12] + this.width;
    this.minX = this.transform[12] - this.width;             

    this.maxY = this.transform[13] + this.height;
    this.minY = this.transform[13] - this.height;

}

function getClosestPointOnBody(sphere, box)
{
    var x = Math.max(box.minX, Math.min(sphere.transform[12], box.maxX));
    var y = Math.max(box.minY, Math.min(sphere.transform[13], box.maxY));

    return [x, y];
};

function intersect(b1, b2)
{
    if(b1 != b2)
    {
    if (b1.type==="sphere" && (b2.type=="box" || b2.type=="paddle")) return intersectSphereBox(b1,b2);
    else if (b1.type==="sphere" && b2.type=="sphere") return intersectSphereSphere(b1,b2);
    else if ((b1.type==="box" && b2.type=="box"))return intersectBoxBox(b1,b2);//box box intersection
    }
    return false;
}

function intersectSphereSphere(s1, s2)
{
    var dx = s1.transform[12] - s2.transform[12];
    var dy = s1.transform[13] - s2.transform[13];
    var d = Math.sqrt(dx * dx + dy * dy);

    return d < (s1.radius + s2.radius)
}

function intersectBoxBox(b1, b2)
{
    return (
        b1.transform[12] < b2.transform[12] +  b2.width*2 &&
        b1.transform[12] + b1.width*2 > b2.transform[12] &&
        b1.transform[13] < b2.transform[13] + b2.height*2 &&
        b1.transform[13] + b1.height*2 > b2.transform[13]
        );
}


function intersectSphereBox(sphere, box)
{
    //console.log(sphere);
    var x = Math.max(box.minX, Math.min(sphere.transform[12], box.maxX));
    var y = Math.max(box.minY, Math.min(sphere.transform[13], box.maxY));

    var d = (x - sphere.transform[12]) * (x - sphere.transform[12]) +
            (y - sphere.transform[13]) * (y - sphere.transform[13]);

    return d < sphere.radius * sphere.radius;
}