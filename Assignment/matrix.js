//--------------------------------------------------------------------------------------------------------//
//  Linear algebra objects for Woggle
//--------------------------------------------------------------------------------------------------------//

//  define a matrix helper method to give access to object operations
var matrixHelper = new _matrixHelper();

function _matrixHelper() { };

_matrixHelper.prototype.vector3 = new Vector3();
_matrixHelper.prototype.matrix4 = new Matrix4();

//--------------------------------------------------------------------------------------------------------//
//  Vector3 : methods for creating and manipulating vectors in R^3
//--------------------------------------------------------------------------------------------------------//
function Vector3() { };

//  zero vector
Vector3.prototype.zero = new Float32Array([0,0,0]);

// create new vector
Vector3.prototype.create = function() {
  return new Float32Array(3);
}

//  create vector from components
Vector3.prototype.from = function(x, y, z) {
  return new Float32Array([x,y,z]);
}

//  copy vector to existing object (assignment)
Vector3.prototype.to = function(out, inp)
{
  out[0] = inp[0];
  out[1] = inp[1];
  out[2] = inp[2];
}

//  clone vector to new object
Vector3.prototype.clone = function(inp) {
  return new Float32Array([inp[0], inp[1], inp[2]]);
}

//  add two vectors, storing result in out
Vector3.prototype.add = function(out, a, b)
{
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
}

//  subtract two vectors, storing result in out
Vector3.prototype.sub = function(out, a, b)
{
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
}

// 
Vector3.prototype.neg = function(out, inp)
{
  out[0] = -inp[0];
  out[1] = -inp[1];
  out[2] = -inp[2];
}

// 
Vector3.prototype.mult = function(out, inp, s)
{
  out[0] = inp[0] * s;
  out[1] = inp[1] * s;
  out[2] = inp[2] * s;
}

//  Not sure this is needed since it's the same as Vector3.dot(inp, inp)!
Vector3.prototype.lengthSquared = function(inp)
{
  return inp[0] * inp[0] + inp[1] * inp[1] + inp[2] * inp[2];
}

//  magnitude of vector (length)
Vector3.prototype.length = function(inp)
{
  return Math.sqrt(inp[0] * inp[0] + inp[1] * inp[1] + inp[2] * inp[2]);
}

//  normalise vector (A / length(A))
Vector3.prototype.normalise = function(out, inp)
{
  var _length = Math.sqrt(inp[0] * inp[0] + inp[1] * inp[1] + inp[2] * inp[2]);

  if (_length > Number.EPSILON)
  {
    var reciprocal = 1 / _length;

    out[0] = inp[0] * reciprocal;
    out[1] = inp[1] * reciprocal;
    out[2] = inp[2] * reciprocal;    
  }
  else
    alert("Error normalizing zero-length vector!")
}

//  scalar (dot) product of two vectors
Vector3.prototype.dot = function(a, b)
{
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

//  cross product of two vectors
Vector3.prototype.cross = function(out, a, b)
{
  out[0] = a[1] * b[2] - a[2] * b[1];
  out[1] = a[2] * b[0] - a[0] * b[2];
  out[2] = a[0] * b[1] - a[1] * b[0];
}

//  convert vector elements to formatted string
Vector3.prototype.toString = function(inp)
{
  return "[" + inp[0] + ", " + inp[1] + ", " + inp[2] + "]"; 
}

//--------------------------------------------------------------------------------------------------------//
//  Matrix4 : methods for manipulating 16-element float arrays as 4x4 matrices
//--------------------------------------------------------------------------------------------------------//
function Matrix4() { };

//  zero matrix
Matrix4.prototype.zero = new Float32Array([0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]);

//  identity matrix
Matrix4.prototype.identity = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);

//  create new matrix
Matrix4.prototype.create = function() {
  return new Float32Array(16);
}

//  copy matrix (assignment)
Matrix4.prototype.to = function(out, inp)
{
for (index = 0; index < 16; ++index)
        out[index] = inp[index];

  // out[0] = inp[0];
  // out[1] = inp[1];
  // out[2] = inp[2];
  // out[3] = inp[3];
  // out[4] = inp[4];
  // out[5] = inp[5];
  // out[6] = inp[6];
  // out[7] = inp[7];
  // out[8] = inp[8];  
  // out[9] = inp[9];
  // out[10] = inp[10];
  // out[11] = inp[11];
  // out[12] = inp[12];  
  // out[13] = inp[13];  
  // out[14] = inp[14];  
  // out[15] = inp[15];  
}

//  clone matrix
Matrix4.prototype.clone = function(inp)
{
  var out = Float32Array(16);

  out[0] = inp[0];
  out[1] = inp[1];
  out[2] = inp[2];
  out[3] = inp[3];
  out[4] = inp[4];
  out[5] = inp[5];
  out[6] = inp[6];
  out[7] = inp[7];
  out[8] = inp[8];  
  out[9] = inp[9];
  out[10] = inp[10];
  out[11] = inp[11];
  out[12] = inp[12];  
  out[13] = inp[13];  
  out[14] = inp[14];  
  out[15] = inp[15];  

  return out;
}

//  add two matrices
Matrix4.prototype.add = function(out, a, b) 
{
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];  
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];  
  out[13] = a[13] + b[13];  
  out[14] = a[14] + b[14];  
  out[15] = a[15] + b[15];  
}

//  subtract two matrices
Matrix4.prototype.sub = function(out, a, b) 
{
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];  
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];  
  out[13] = a[13] - b[13];  
  out[14] = a[14] - b[14];  
  out[15] = a[15] - b[15];  
}

// matrix inverse
Matrix4.prototype.inverse = function(out, m)
{
    var inv = new Float32Array(16), 
      det;
 
    inv[ 0] =  m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    inv[ 4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    inv[ 8] =  m[4] * m[ 9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[ 9];
    inv[12] = -m[4] * m[ 9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[ 9];
    inv[ 1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    inv[ 5] =  m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    inv[ 9] = -m[0] * m[ 9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[ 9];
    inv[13] =  m[0] * m[ 9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[ 9];
    inv[ 2] =  m[1] * m[ 6] * m[15] - m[1] * m[ 7] * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[ 7] - m[13] * m[3] * m[ 6];
    inv[ 6] = -m[0] * m[ 6] * m[15] + m[0] * m[ 7] * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[ 7] + m[12] * m[3] * m[ 6];
    inv[10] =  m[0] * m[ 5] * m[15] - m[0] * m[ 7] * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[ 7] - m[12] * m[3] * m[ 5];
    inv[14] = -m[0] * m[ 5] * m[14] + m[0] * m[ 6] * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[ 6] + m[12] * m[2] * m[ 5];
    inv[ 3] = -m[1] * m[ 6] * m[11] + m[1] * m[ 7] * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[ 9] * m[2] * m[ 7] + m[ 9] * m[3] * m[ 6];
    inv[ 7] =  m[0] * m[ 6] * m[11] - m[0] * m[ 7] * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[ 8] * m[2] * m[ 7] - m[ 8] * m[3] * m[ 6];
    inv[11] = -m[0] * m[ 5] * m[11] + m[0] * m[ 7] * m[ 9] + m[4] * m[1] * m[11] - m[4] * m[3] * m[ 9] - m[ 8] * m[1] * m[ 7] + m[ 8] * m[3] * m[ 5];
    inv[15] =  m[0] * m[ 5] * m[10] - m[0] * m[ 6] * m[ 9] - m[4] * m[1] * m[10] + m[4] * m[2] * m[ 9] + m[ 8] * m[1] * m[ 6] - m[ 8] * m[2] * m[ 5];
 
    det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
 
    if (Math.abs(det) > Number.EPSILON) {
      det = 1.0 / det;
 
      for(var i = 0; i < 16; i++)
          out[i] = inv[i] * det;
    }
}

//  matrix multiply
Matrix4.prototype.multiply = function(out, a, b)
{
  out[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
  out[1] = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
  out[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
  out[3] = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];

  out[4] = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
  out[5] = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
  out[6] = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
  out[7] = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];

  out[8] = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
  out[9] = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
  out[10] = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
  out[11] = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];

  out[12] = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];
  out[13] = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];
  out[14] = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];
  out[15] = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];
}

// M * p
Matrix4.prototype.multiplyPoint = function(out, m, p)
{
  out[0] = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
  out[1] = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
  out[2] = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
}

// M * v
Matrix4.prototype.multiplyVector = function(out, m, v)
{
  out[0] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2];
  out[1] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2];
  out[2] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2];
}

//  transpose matrix
Matrix4.prototype.transpose = function(out, inp)
{
  out[0] = inp[0];
  out[1] = inp[4];    
  out[2] = inp[8];    
  out[3] = inp[12];    
  out[4] = inp[1];    
  out[5] = inp[5];
  out[6] = inp[9];    
  out[7] = inp[13];    
  out[8] = inp[2];    
  out[9] = inp[6];    
  out[10] = inp[10];
  out[11] = inp[14];    
  out[12] = inp[3];    
  out[13] = inp[7];    
  out[14] = inp[11];    
  out[15] = inp[15];
}

//  make matrix into identity
Matrix4.prototype.makeIdentity = function(inpout)
{
  inpout[0] = 1;
  inpout[1] = 0;
  inpout[2] = 0;
  inpout[3] = 0;

  inpout[4] = 0;
  inpout[5] = 1;
  inpout[6] = 0;
  inpout[7] = 0;

  inpout[8] = 0;  
  inpout[9] = 0;
  inpout[10] = 1;
  inpout[11] = 0;

  inpout[12] = 0;  
  inpout[13] = 0;  
  inpout[14] = 0;  
  inpout[15] = 1;  
}

//  make translation matrix
Matrix4.prototype.makeTranslation = function(out, translation)
{
  out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
  out[12] = translation[0]; 
  out[13] = translation[1]; 
  out[14] = translation[2]; 
  out[15] = 1;
}

// rotation euler angles
Matrix4.prototype.makeRotationX = function(out, theta)
{
  out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = Math.cos(theta); out[6] = Math.sin(theta); out[7] = 0;
  out[8] = 0; out[9] = -Math.sin(theta); out[10] = Math.cos(theta); out[11] = 0;
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;  
}

Matrix4.prototype.makeRotationY = function(out, theta)
{
  out[0] = Math.cos(theta); out[1] = 0; out[2] = -Math.sin(theta); out[3] = 0;
  out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
  out[8] = Math.sin(theta); out[9] = 0; out[10] = Math.cos(theta); out[11] = 0;
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;  
}

Matrix4.prototype.makeRotationZ = function(out, theta)
{
  out[0] = Math.cos(theta); out[1] = Math.sin(theta); out[2] = 0; out[3] = 0;
  out[4] = -Math.sin(theta); out[5] = Math.cos(theta); out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;  
}

// Scaling matrix
Matrix4.prototype.makeScaling = function(out, s)
{
  out[0] = s[0]; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = s[1]; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = s[2]; out[11] = 0;
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
}

// Scaling matrix
Matrix4.prototype.makeScalingUniform = function(out, s)
{
  out[0] = s; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = s; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = s; out[11] = 0;
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
}

//  make matrix into view matrix
Matrix4.prototype.makeView = function(out, right, up, front, position)
{
  out[0] = right[0]; out[1] = up[0]; out[2] = front[0]; out[3] = 0;
  out[4] = right[1]; out[5] = up[1]; out[6] = front[1]; out[7] = 0;
  out[8] = right[2]; out[9] = up[2]; out[10] = front[2]; out[11] = 0;
  out[12] = -matrixHelper.vector3.dot(right, position); 
  out[13] = -matrixHelper.vector3.dot(up, position);
  out[14] = -matrixHelper.vector3.dot(front, position); 
  out[15] = 1;
}

//  make projection matrix
Matrix4.prototype.makeProjection = function(out, near, far, fov, aspect)
{
  var f = 1.0 / Math.tan(fov * 0.5);
  var a = (far + near) / (near - far);
  var b = (2 * far * near) / (near - far);

  out[0] = f/aspect;  out[1] = 0;   out[2] = 0;   out[3] = 0;
  out[4] = 0;         out[5] = f;   out[6] = 0;   out[7] = 0;
  out[8] = 0;         out[9] = 0;   out[10] = a;  out[11] = -1;
  out[12] = 0;        out[13] = 0;  out[14] = b; out[15] = 0;
}

//  make view matrix from lookAt arguments
Matrix4.prototype.lookAt = function(out, position, target, up)
{
  var direction = matrixHelper.vector3.create(),
      xaxis = matrixHelper.vector3.create(),
      yaxis = matrixHelper.vector3.create(),
      zaxis = matrixHelper.vector3.create();

  matrixHelper.vector3.sub(direction, position, target);
  matrixHelper.vector3.normalise(zaxis, direction);
  matrixHelper.vector3.cross(xaxis, up, zaxis);
  matrixHelper.vector3.normalise(xaxis, xaxis);
  matrixHelper.vector3.cross(yaxis, zaxis, xaxis);

  matrixHelper.matrix4.makeView(out, xaxis, yaxis, zaxis, position);
}

//  convert matrix to string
Matrix4.prototype.toString = function(inp)
{
  return "|" + inp[0] + " " + inp[4] + " " + inp[8] + " " + inp[12] + "|\n" +
         "|" + inp[1] + " " + inp[5] + " " + inp[9] + " " + inp[13] + "|\n" +
         "|" + inp[2] + " " + inp[6] + " " + inp[10] + " " + inp[14] + "|\n" +
         "|" + inp[3] + " " + inp[7] + " " + inp[11] + " " + inp[15] + "|\n"; 
}