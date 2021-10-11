function generateBlock(positions, normals, colours, uvs)
{
    var vertexList = [], indexList = [];

    for (var i = 0; i < 8; ++i) // up to 8 since we're also counting back face/depth
    {
      for (var k = 0; k<3; ++k)
       vertexList[vertexList.length] = positions[i][k];
      for (var k = 0; k<3; ++k)
       vertexList[vertexList.length] = normals[i][k];
      for (var k = 0; k<3; ++k)
       vertexList[vertexList.length] = colours[i][k];
      for (var k = 0; k<2; ++k)
       vertexList[vertexList.length] = uvs[i][k];
    }

    var faces = [
              [0, 1, 2, 3],
              [1, 5, 6, 2],
              [5, 4, 7, 6],
              [4, 0, 3, 7],
              [2, 6, 7, 3],
              [4, 5, 1, 0]
          ]
      
    //treating each face as a square
    for(var i = 0; i < faces.length; ++i)
    {
        indexList[indexList.length] = faces[i][0];
        indexList[indexList.length] = faces[i][1]; 
        indexList[indexList.length] = faces[i][2]; 

        indexList[indexList.length] = faces[i][2]; 
        indexList[indexList.length] = faces[i][3]; 
        indexList[indexList.length] = faces[i][0]; 
    };

    return {vertex : vertexList, index : indexList};
}
