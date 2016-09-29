function Buffer(vertexShaderId, fragmentShaderId, bboxVertexShaderId, bboxFragmentShaderId)
{
    this._vertexShaderId   = vertexShaderId;
    this._fragmentShaderId = fragmentShaderId;

    this._vertexBuffer    = device.createBuffer();
    this._indexBuffer     = device.createBuffer();
    this._texCoordsBuffer = device.createBuffer();
    this._shaderProgram   = device.createProgram();

    //BBOX
    this._BboxvertexShaderId    = bboxVertexShaderId;
    this._BboxfragmentShaderId  = bboxFragmentShaderId;
    this._BboxVertexBuffer      = device.createBuffer();
    this._BboxIndexBuffer       = device.createBuffer();
    this._BBoxshaderProgram     = device.createProgram();
    this._BboxVertexShader   = {};
    this._BboxFragmentShader = {};
    this.ext = {};
};

Buffer.prototype._isTexture = true;
Buffer.prototype.lastScaleFactor = null;
Buffer.prototype._vertexShader = {};
Buffer.prototype._fragmentShader = {};

Buffer.prototype =
{
    init: function (isTexture)
    {
        
        this._isTexture = isTexture;
        this._initShaders();
        this._createShaderProgram();
    },

    initBBox : function()
    {
        this._initBBoxShader();
        this._createBboxProgram();
    },

    _initBBoxShader : function() {
        var vShaderElement = document.getElementById(this._BboxvertexShaderId);
        var fShaderElement = document.getElementById(this._BboxfragmentShaderId);

        this._BboxVertexShader = device.createShader(device.VERTEX_SHADER);
        this._BboxFragmentShader = device.createShader(device.FRAGMENT_SHADER);

        device.shaderSource(this._BboxVertexShader, vShaderElement.textContent);
        device.compileShader(this._BboxVertexShader);

        device.shaderSource(this._BboxFragmentShader, fShaderElement.textContent);
        device.compileShader(this._BboxFragmentShader);
    },

    _initShaders: function ()
    {
        var vShaderElement = document.getElementById(this._vertexShaderId);
        var fShaderElement = document.getElementById(this._fragmentShaderId);

        this._vertexShader = device.createShader(device.VERTEX_SHADER);
        this._fragmentShader = device.createShader(device.FRAGMENT_SHADER);

        device.shaderSource(this._vertexShader, vShaderElement.textContent);
        device.compileShader(this._vertexShader);

        device.shaderSource(this._fragmentShader, fShaderElement.textContent);
        device.compileShader(this._fragmentShader);
    },

    _createBboxProgram : function()
    {
        device.attachShader(this._BBoxshaderProgram, this._BboxVertexShader);
        device.attachShader(this._BBoxshaderProgram, this._BboxFragmentShader);
        device.linkProgram(this._BBoxshaderProgram);

        device.useProgram(this._BBoxshaderProgram);

        this._BBoxshaderProgram.vertexPositionAttribute = device.getAttribLocation(this._BBoxshaderProgram, "position");
        device.enableVertexAttribArray(this._BBoxshaderProgram.vertexPositionAttribute);

        this._BBoxshaderProgram.pMatrixUniform = device.getUniformLocation(this._BBoxshaderProgram, "projMatrix");
        this._BBoxshaderProgram.mvMatrixUniform = device.getUniformLocation(this._BBoxshaderProgram, "viewMatrix");
        this._BBoxshaderProgram.translationVector = device.getUniformLocation(this._BBoxshaderProgram, "translationVector");
        this._BBoxshaderProgram.scaleFactor = device.getUniformLocation(this._BBoxshaderProgram, "scaleFactor");

        device.useProgram(null);
    },

    _createShaderProgram: function ()
    {
      
            device.attachShader(this._shaderProgram, this._vertexShader);
            device.attachShader(this._shaderProgram, this._fragmentShader);

            device.linkProgram(this._shaderProgram);
            
            device.useProgram(this._shaderProgram);

            this._shaderProgram.vertexPositionAttribute = device.getAttribLocation(this._shaderProgram, "position");
            device.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);

            if (this._isTexture) {
                this._shaderProgram.textureCoordAttribute = device.getAttribLocation(this._shaderProgram, "texCoord");
                device.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
            }

            this._shaderProgram.pMatrixUniform = device.getUniformLocation(this._shaderProgram, "projMatrix");
            this._shaderProgram.mvMatrixUniform = device.getUniformLocation(this._shaderProgram, "viewMatrix");
            this._shaderProgram.translationVector = device.getUniformLocation(this._shaderProgram, "translationVector");
            this._shaderProgram.gridColor = device.getUniformLocation(this._shaderProgram, "gridColor");
            this._shaderProgram.scaleFactor = device.getUniformLocation(this._shaderProgram, "scaleFactor");
            this._shaderProgram.spherify = device.getUniformLocation(this._shaderProgram, "spherify");
            this._shaderProgram.cameraPosition = device.getUniformLocation(this._shaderProgram, "cameraPosition");

            this._shaderProgram.samplerUniform = device.getUniformLocation(this._shaderProgram, "sampler");
            this._shaderProgram.elevationSamplerUniform = device.getUniformLocation(this._shaderProgram, "elevationSampler");
            device.useProgram(null);
        
    },

    createBBox: function (vertices, indices) {
        device.useProgram(this._BBoxshaderProgram);
        device.bindBuffer(device.ARRAY_BUFFER, this._BboxVertexBuffer);

        device.bufferData(device.ARRAY_BUFFER, new Float32Array(vertices), device.STATIC_DRAW);
        this._BboxVertexBuffer.numItems = vertices.length / 3;
        this._BboxVertexBuffer.itemSize = 3;

        device.bindBuffer(device.ELEMENT_ARRAY_BUFFER, this._BboxIndexBuffer);
        device.bufferData(device.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), device.STATIC_DRAW);

        this._BboxIndexBuffer.numItems = indices.length;
        this._BboxIndexBuffer.itemSize = 1;

        device.useProgram(null);
    },

    create: function (vertices, indices, texcoords) {
        device.useProgram(this._shaderProgram);
        device.bindBuffer(device.ARRAY_BUFFER, this._vertexBuffer);

        device.bufferData(device.ARRAY_BUFFER, new Float32Array(vertices), device.STATIC_DRAW);
        this._vertexBuffer.numItems = vertices.length / 3;
        this._vertexBuffer.itemSize = 3;

        device.bindBuffer(device.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        device.bufferData(device.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), device.STATIC_DRAW); 
        this._indexBuffer.numItems = indices.length;
        
        this._indexBuffer.itemSize = 1;

        if (texcoords != null)
        {
            device.bindBuffer(device.ARRAY_BUFFER, this._texCoordsBuffer);
            device.bufferData(device.ARRAY_BUFFER, new Float32Array(texcoords), device.STATIC_DRAW);
            this._texCoordsBuffer.numItems = texcoords.length / 2;
            this._texCoordsBuffer.itemSize = 2;
        }
        device.useProgram(null);
    },

    

    updateIndexBuffer : function(node, indices, numIndices)
    {
        if (node != undefined) {
            device.useProgram(this._shaderProgram);

            device.bindBuffer(device.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            device.bufferSubData(device.ELEMENT_ARRAY_BUFFER, 0, new Uint32Array(node.indexArray)); 

            this._indexBuffer.numItems = node.indexArray.length;
            this._indexBuffer.itemSize = 1;

            device.useProgram(null);
        }
        else if (indices != null && numIndices != null)
        {
            device.useProgram(this._shaderProgram);

            device.bindBuffer(device.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            device.bufferSubData(device.ELEMENT_ARRAY_BUFFER, 0, new Uint32Array(indices)); 

            this._indexBuffer.numItems = numIndices;
            this._indexBuffer.itemSize = 1;

            device.useProgram(null);
        }
    },

    update : function (vertices,  indices, numVertices, numIndices)
    {
        device.useProgram(this._shaderProgram);
        
        device.bindBuffer(device.ARRAY_BUFFER, this._vertexBuffer);
        device.bufferSubData(device.ARRAY_BUFFER, 0, new Float32Array(vertices));

        this._vertexBuffer.numItems = numVertices;
        this._vertexBuffer.itemSize = 3;

        this._shaderProgram.vertexPositionAttribute = device.getAttribLocation(this._shaderProgram, "position");
        device.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);
        device.useProgram(null);

        this.updateIndexBuffer(null, indices, numIndices);
    },

    setProgram : function()
    {
        device.useProgram(this._shaderProgram);

        device.bindBuffer(device.ARRAY_BUFFER, this._vertexBuffer);
        device.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, this._vertexBuffer.itemSize, device.FLOAT, false, 0, 0);
        //this.ext.vertexAttribDivisorANGLE(this._shaderProgram.vertexPositionAttribute, 0);

        device.bindBuffer(device.ARRAY_BUFFER, this._texCoordsBuffer);
        device.vertexAttribPointer(this._shaderProgram.textureCoordAttribute, this._texCoordsBuffer.itemSize, device.FLOAT, false, 0, 0);
        //this.ext.vertexAttribDivisorANGLE(this._shaderProgram.textureCoordAttribute, 0);
    },

    setBBboxProgram : function() {
        device.useProgram(this._BBoxshaderProgram);

        device.bindBuffer(device.ARRAY_BUFFER, this._BboxVertexBuffer);
        device.vertexAttribPointer(this._BBoxshaderProgram.vertexPositionAttribute, this._BboxVertexBuffer.itemSize, device.FLOAT, false, 0, 0);
    },

    disableProgram: function ()
    {
        
        device.useProgram(null);
    },

    setBBoxMatrixUniform: function (projMatrix, viewMatrix) {
        device.uniformMatrix4fv(this._BBoxshaderProgram.pMatrixUniform, false, projMatrix);
        device.uniformMatrix4fv(this._BBoxshaderProgram.mvMatrixUniform, false, viewMatrix);
        device.bindBuffer(device.ELEMENT_ARRAY_BUFFER, this._BboxIndexBuffer);
    },

    setMatrixUniforms : function(projMatrix, viewMatrix, spherify, camera)
    {
      device.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, projMatrix);
      device.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, viewMatrix);

      device.uniform3fv(this._shaderProgram.cameraPosition,  camera.position);
        
      if (spherify)
          device.uniform1f(this._shaderProgram.spherify, 1.0);
      else
          device.uniform1f(this._shaderProgram.spherify, 0.0);

      device.uniform1i(this._shaderProgram.elevationSamplerUniform, 0);
      device.uniform1i(this._shaderProgram.samplerUniform, 1);
      device.bindBuffer(device.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    },

    prerenderBbox : function(node) {
        if (node.translationVector !== undefined)
            device.uniform3fv(this._BBoxshaderProgram.translationVector, node.translationVector);
        if (node.scaleFactor !== undefined) {
            device.uniform1f(this._BBoxshaderProgram.scaleFactor, node.scaleFactor);
        }
    },

    prerender: function (node) {
        if (!node.elevationLoaded || !node.textureLoaded)
            return;

        if (node.translationVector !== undefined)
            device.uniform3fv(this._shaderProgram.translationVector, node.translationVector);
        
        if (node.colorVector !== undefined) {
            device.uniform3fv(this._shaderProgram.gridColor, node.colorVector);
        }

        if (node.scaleFactor !== undefined && node.scaleFactor !== this.lastScaleFactor) {
            this.lastScaleFactor = node.scaleFactor;
            device.uniform1f(this._shaderProgram.scaleFactor, node.scaleFactor);
        }

        device.activeTexture(device.TEXTURE0);
        device.bindTexture(device.TEXTURE_2D, node.elevation);
        
        device.activeTexture(device.TEXTURE1);
        device.bindTexture(device.TEXTURE_2D, node.texture);
    },

    draw : function(wireframe, node)
    {
        if (!node.elevationLoaded || !node.textureLoaded)
            return;

        device.drawElements(wireframe, this._indexBuffer.numItems, device.UNSIGNED_INT, 0); //indices
        device.bindTexture(device.TEXTURE_2D, null);
    },

    drawInstanced: function (wireframe) {
        device.drawElements(wireframe, this._indexBuffer.numItems, device.UNSIGNED_INT, 0);
    },

    drawBBox : function() {
        device.drawElements(device.LINES, this._BboxIndexBuffer.numItems, device.UNSIGNED_INT, 0);
    },

    render: function (projMatrix, viewMatrix, texture, wireframe)
    {
        device.useProgram(this._shaderProgram);

        if (wireframe == undefined)
            wireframe = device.LINE_LOOP;

        device.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, projMatrix);
        device.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, viewMatrix);

        device.bindBuffer(device.ARRAY_BUFFER, this._vertexBuffer);
        device.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, this._vertexBuffer.itemSize, device.FLOAT, false, 0, 0);

        if (texture != undefined || texture!= null)
        {
            device.activeTexture(device.TEXTURE0);
            device.bindTexture(device.TEXTURE_2D, texture);
            device.uniform1i(this._shaderProgram.samplerUniform, 0);
        }

        device.bindBuffer(device.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        device.drawElements(wireframe, this._indexBuffer.numItems, device.UNSIGNED_INT, 0); //indices
        
        device.useProgram(null);
    },
};