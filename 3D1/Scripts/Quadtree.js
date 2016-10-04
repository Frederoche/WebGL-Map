/// <reference path="Chunck.js" />
/// <reference path="BoundingBox.js" />
/// <reference path="gl-Matrix.js" />
function Quadtree(option)
{
    this.initialRootSize = option.initialRootSize;
    
    this.chunck = new Chunck(option.chunckSize);
    this.chunck.create();
    this.nodeCenter = vec3.create();

    this.initialtexturePath = option.initialtexturePath;
    this.initialElevationPath = option.initialElevationPath;
    
    this.rootNode = new QuadtreeNode(vec3.create([0, 0, 0]), option.initialRootSize, vec3.create([255, 0, 0]), vec3.create([0, 0, 0]), "", option.quadtreeDepth, "", "-1",undefined, this.chunck.bbox);

    this._build(this.rootNode);
    this._Wms = new Wms(option.initialRootSize);
    

};


Quadtree.prototype =
{
    _build: function (node)
    {
        if (node.depth > 1)
        {
            this._addNode(node);

            for (var i = 0; i < 4; i++)
            {
                this._build(node.child[i]);
            }
        }
    },

    _removeChilds : function(node) {
        node.child = [];
    },



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
           
        var upperLeft  = new QuadtreeNode(centerUpperLeft, scaling, vec3.create([255, 0, 0]), centerUpperLeft, this.initialtexturePath, node.depth - 1, this.initialElevationPath, 2, node, this.chunck.bbox, node.elevation);
        var upperRight = new QuadtreeNode(centerUpperRight, scaling, vec3.create([0, 255, 0]), centerUpperRight, this.initialtexturePath, node.depth - 1, this.initialElevationPath, 3, node, this.chunck.bbox, node.elevation);
        var lowerLeft  = new QuadtreeNode(centerLowerLeft, scaling, vec3.create([0, 0, 255]), centerLowerLeft, this.initialtexturePath, node.depth - 1, this.initialElevationPath, 0, node, this.chunck.bbox, node.elevation);
        var lowerRight = new QuadtreeNode(centerLowerRight, scaling, vec3.create([255, 0, 255]), centerLowerRight, this.initialtexturePath, node.depth - 1, this.initialElevationPath, 1, node, this.chunck.bbox, node.elevation);

        node.child[0] = upperLeft;
        node.child[1] = upperRight;
        node.child[2] = lowerLeft;
        node.child[3] = lowerRight;
        
        node.type = 1;
        
    },

    setMatrixUniforms : function(projMatrix, viewMatrix, spherify, camera)
    {
        this.chunck.setMatrixUniforms(projMatrix, viewMatrix, spherify, camera);
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

    drawBBox: function (frustum, node, delta)
    {
        if (node === undefined || !frustum.isBoxInsideFrustum(node.bbox))
            return;


        this.chunckDistFromCamera = Math.sqrt((frustum.position[0] - this.nodeCenter[0]) * (frustum.position[0] - this.nodeCenter[0]) +
                                              (frustum.position[1] - this.nodeCenter[1]) * (frustum.position[1] - this.nodeCenter[1]) +
                                              (frustum.position[2] - this.nodeCenter[2]) * (frustum.position[2] - this.nodeCenter[2]));

        if (this.chunckDistFromCamera > delta && node.type === 1)
        {
            this.chunck.prerenderBbox(node);
            this.chunck.drawBBox();
        }
        else
        {
            for (var i = 0; i < 4; i++) {
                this.drawBBox(frustum, node.child[i], delta / 2.0);
            }
        }
    },


    draw: function (wireframe, frustum, node, ext, delta, tile, spherify, Wms) {
        
        if (node === undefined || !frustum.isBoxInsideFrustum(node.bbox)) {
            return;
        }

        if (spherify)
            this.nodeCenter = node.spherifyCenter;
        else
            this.nodeCenter = node.center;

        //SHOULD BE NODE OUTER BORDER.
        this.chunckDistFromCamera = Math.sqrt((frustum.position[0] - this.nodeCenter[0]) * (frustum.position[0] - this.nodeCenter[0]) +
                                              (frustum.position[1] - this.nodeCenter[1]) * (frustum.position[1] - this.nodeCenter[1]) +
                                              (frustum.position[2] - this.nodeCenter[2]) * (frustum.position[2] - this.nodeCenter[2]));

        if (this.chunckDistFromCamera > delta && node.type === 1) {
            
            if (spherify)
                node.updateBBoxToSphere();
            else
                node._constructBBox(false);
           
            if (tile !== node.initialtexturePath)
            {
                node.updateTexturePath(tile);
            }
            
            if (node.parent!=undefined && node.parent.child[0].textureLoaded && node.parent.child[0].elevationLoaded
                && node.parent.child[1].textureLoaded && node.parent.child[1].elevationLoaded
                && node.parent.child[2].textureLoaded && node.parent.child[2].elevationLoaded
                && node.parent.child[3].textureLoaded && node.parent.child[3].elevationLoaded) {
               
                this.chunck.prerender(node);
                this.chunck.draw(wireframe);
                     
            }
            else
            {
                if (!node.textureLoaded && node.type === 1) {
                    
                    node.getTexture(ext, function ()
                    {
                        node.textureLoaded = true;

                    }.bind(this));
                }

                if (!node.elevationLoaded && node.type === 1) {
                    this._Wms.prepareRequest(node);

                    node.getElevationFromWms(this._Wms.url, function ()
                    {
                        node.elevationLoaded = true;
                    }.bind(this));
                    
                }
                if ((!node.elevationLoaded || !node.textureLoaded) && node.type === 1)
                    this.draw(wireframe, frustum, node.parent, ext, delta / 2.0, tile, spherify, Wms);
                else
                    return;
            }
        }
        else
        {
            if (node.type !== 1)
            {
                this.draw(wireframe, frustum, node.parent, ext, delta / 2.0, tile, spherify, Wms);

                this._Wms.prepareRequest(node);

                node.getElevationFromWms(this._Wms.url, function ()
                {
                    this._addNode(node);   
                }.bind(this));
                return;
            }
            else
            {
                for (var i = 0; i < 4; i++) {
                    
                    this.draw(wireframe, frustum, node.child[i], ext, delta/2.0, tile, spherify, Wms); //Problem  here with coefficient
                    //dist/1.8 spherify
                }
            }

            return;
        }
    }
};