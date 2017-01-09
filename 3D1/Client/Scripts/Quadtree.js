XMap.Quadtree = function(option)
{
    this.initialRootSize = option.initialRootSize;
    
    this.chunck = new XMap.Chunck(option.chunckSize);
    this.chunck.create();
    this.nodeCenter = vec3.create();

    this.initialtexturePath = option.initialtexturePath;
    this.initialElevationPath = option.initialElevationPath;
    
    var rootNodeOption = {
        translation:vec3.create([0, 0, 0]),
        scaling: option.initialRootSize,
        color:vec3.create([255, 0, 0]),
        center : vec3.create([0, 0, 0]),
        texturePath: "",
        elevationDataTexturePath:"",
        parent:undefined, 
        bbox:this.chunck.bbox,
        id:''
    };

    this.rootNode = new XMap.QuadtreeNode(rootNodeOption);

    this._Wms = new XMap.Wms(option.initialRootSize);
    this.counter = 0;
};


XMap.Quadtree.prototype =
{

    _addNode: function (node)
    {
        var scaling = node.scaleFactor * 0.5;

        var centerUpperLeft = vec3.create();
        vec3.add(node.center, vec3.create([-scaling, 0, scaling]), centerUpperLeft);
           
        var centerUpperRight = vec3.create();
        vec3.add(node.center, vec3.create([scaling, 0, scaling]), centerUpperRight);
           
        var centerLowerLeft = vec3.create();
        vec3.add(node.center, vec3.create([-scaling, 0, -scaling]), centerLowerLeft);
           
        var centerLowerRight = vec3.create();
        vec3.add(node.center, vec3.create([scaling, 0, -scaling]), centerLowerRight);

        var upperLeftOptions = {
            translation: centerUpperLeft,
            scaling: scaling,
            color: vec3.create([255, 0, 0]),
            texturePath: this.initialtexturePath,
            depth: node.depth - 1,
            elevationDataTexturePath:this.initialElevationPath,
            parent:node, 
            bbox:this.chunck.bbox,
            id:node.id + "2"
            
        };

        var upperRightOptions = {
            translation:centerUpperRight,
            scaling:scaling,
            color:vec3.create([0, 255, 0]),
            texturePath: this.initialtexturePath,
            depth:node.depth - 1,
            elevationDataTexturePath:this.initialElevationPath,
            parent:node, 
            bbox:this.chunck.bbox,
            id: node.id +"3"
        };

        var lowerLeftOptions = {
            translation:centerLowerLeft,
            scaling:scaling,
            color:vec3.create([0, 0, 255]),
            texturePath: this.initialtexturePath,
            depth:node.depth - 1,
            elevationDataTexturePath:this.initialElevationPath,
            parent:node, 
            bbox:this.chunck.bbox,
            id:node.id + "0"
        };

        var lowerRightOptions = 
        {
            translation:centerLowerRight,
            scaling:scaling,
            color:vec3.create([255, 0, 255]),
            texturePath: this.initialtexturePath,
            depth:node.depth - 1,
            elevationDataTexturePath:this.initialElevationPath,
            parent:node, 
            bbox:this.chunck.bbox,
            id:node.id + "1"
        };
               
        node.child[0]  = new XMap.QuadtreeNode(upperLeftOptions);
        node.child[1]  = new XMap.QuadtreeNode(upperRightOptions);
        node.child[2]  = new XMap.QuadtreeNode(lowerLeftOptions);
        node.child[3]  = new XMap.QuadtreeNode(lowerRightOptions);

        node.type = 1;
        
    },

    setMatrixUniforms : function(projMatrix, viewMatrix, camera)
    {
        this.chunck.setMatrixUniforms(projMatrix, viewMatrix,  camera);
    },

    setBBoxMatrixUniforms: function (projMatrix, viewMatrix)
    {
        this.chunck.setBBoxMatrixUniforms(projMatrix, viewMatrix);
    },

    setProgram: function ()
    {
        this.chunck.setProgram();
    },

    setBBoxProgram : function() {
        this.chunck.setBBoxProgram();
    },

    disableProgram: function ()
    {
        this.chunck.disableProgram();
    },

    removechild:function(parent)
    {
        for(var i =0 ; i < parent.child.length;i++)
        {
            if(parent.child[i].texture!==null && parent.child[i].texture.image!==null)
            {
                
                parent.child[i].texture.image.removeEventListener("load",parent.child[i].loadtextureHandler, false);
                parent.child[i].texture.image = null;
                device.deleteTexture(parent.child[i].texture);
                parent.child[i].texture = null;
            }

            if(parent.child[i].elevation!==null && parent.child[i].elevation.image!==null)
            {
                
                parent.child[i].elevation.image.removeEventListener("load",parent.child[i].loadElevation, false);
                parent.child[i].elevation.image = null;
                device.deleteTexture(parent.child[i].elevation);
                parent.child[i].elevation = null;
            }

            if(parent.child[i].child.length > 0)
            {
                this.removechild(parent.child[i])
                parent.child[i].parent = null;
                parent.child[i] = null; 
            }
        }
    },

    //node.type == 2 ---->leaf
    draw: function (wireframe, frustum, node, ext, delta, tile) {
        
        if (node === undefined) 
        {
            return;
        }

        if(!frustum.isBoxInsideFrustum(node.bbox)){
           
            if(node.child.length > 0)
            {
                this.removechild(node);
            }

            node.child = [];

            if(node.texture!==null && node.texture.image!==null)
            {
                
                node.texture.image.removeEventListener("load",node.loadtextureHandler, false);
                node.texture.image = null;
                device.deleteTexture(node.texture);
            }

            if(node.elevation!==null && node.elevation.image!==null)
            {
                
                node.elevation.image.removeEventListener("load",node.loadElevation, false);
                node.elevation.image = null;
                device.deleteTexture(node.elevation);
            }
            node.type = 2;
            return;
        }

        if(frustum.isBoxInsideFrustum(node.bbox) && node.child.length < 4){
            this._addNode(node);
        }
        
        //should be the closest point not the center.
        this.chunckDistFromCamera = Math.sqrt((frustum.position[0] - node.center[0]) * (frustum.position[0] - node.center[0]) +
                                              (frustum.position[1] - node.center[1]) * (frustum.position[1] - node.center[1]) +
                                              (frustum.position[2] - node.center[2]) * (frustum.position[2] - node.center[2]));
        
        if (delta / this.chunckDistFromCamera <= 0.015  && node.type === 1) {
            
            if (tile !== node.initialtexturePath)
            {
                node.updateTexturePath(tile);
            }

            if (node.elevationLoaded && node.textureLoaded) 
            {
                this.chunck.prerender(node);
                this.chunck.draw(wireframe);   
            }

            if (!node.textureLoaded  && this.counter < 6) {
                
                node.getTexture(ext, function ()
                {
                    if(node.texture.image ===null)
                        return;

                    node.textureLoaded = true;
                    node.texture.image.removeEventListener("load",node.loadtextureHandler, false);
                    node.texture.image = null;
                });
                this.counter++;
            }

            if (!node.elevationLoaded  && this.counter < 6) {
                this._Wms.prepareRequest(node);

                node.getElevationFromWms(this._Wms.url, function ()
                {
                    if(node.elevation.image ===null)
                        return;

                    node.elevationLoaded = true; 
                    node.elevation.image.removeEventListener("load", node.loadElevation, false);
                    node.elevation.image = null;
                });

                this.counter++;
            }

            //Blurring
            if ((!node.elevationLoaded || !node.textureLoaded) && node.type === 1  && node.parent !== undefined)
            { 
              this.draw(wireframe, frustum, node.parent, ext, delta/2 , tile);
              return;
            }
        }
        else
        {
            if (node.type !== 1)
            {

                this._Wms.prepareRequest(node);

                node.getElevationFromWms(this._Wms.url, function ()
                {
                    if(node.elevation.image ===null)
                        return;

                    node.elevationLoaded = true; 
                    node.elevation.image.removeEventListener("load", node.loadElevation, false);
                    node.elevation.image = null;
                });

                this.counter++;
            }
            else if(node.type === 1 && node.child.length > 0)
            {
                for (var i = 0; i < 4; i++) 
                {    
                    this.draw(wireframe, frustum, node.child[i], ext, delta/2.0, tile); 
                }
            }
        }
    }
};