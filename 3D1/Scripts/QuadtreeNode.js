function QuadtreeNode(translationVector, scaleFactor, colorVector, center, texturePath, depth, elevationDataTexturePath, nodeNr, node, bbox) {
    this.parent = node;
    this.elevation = null;
    this.texture = null;
    this.textureLoaded = false;
    this.elevationLoaded = false;
    this.id = nodeNr === '-1' ? '' : node.id + nodeNr;
    this.parentId = node !== undefined ? node.id : '';
    this.nodeNr = nodeNr;
    this.scaleFactor = scaleFactor;
    this.translationVector = translationVector;
    this.colorVector = colorVector;
    this.child = [];
    this.center = center;
    this.spherifyCenter = this.spherify(center);
    this.cbbox = bbox;
    this.bbox = this._constructBBox(true);
    this.initialtexturePath = texturePath;
    this.texturePath = this._getTexturePath(nodeNr, this.parentId, texturePath);
    this.elevationDataTexturePath = this._getTexturePath(nodeNr, this.parentId, elevationDataTexturePath);
    this.depth = depth;
    this.type = 2;
};


QuadtreeNode.prototype =
{
    _constructBBox: function (spherify)
    {
        //spherify = true;

        var p1 = vec3.create();
        var p2 = vec3.create();
        var p3 = vec3.create();
        var p4 = vec3.create();
        var p5 = vec3.create();
        var p6 = vec3.create();
        var p7 = vec3.create();
        var p8 = vec3.create();

        //BBOX scaling;
        vec3.scale(this.cbbox.p1, this.scaleFactor, p1);
        vec3.scale(this.cbbox.p2, this.scaleFactor, p2);
        vec3.scale(this.cbbox.p3, this.scaleFactor, p3);
        vec3.scale(this.cbbox.p4, this.scaleFactor, p4);
        vec3.scale(this.cbbox.p5, this.scaleFactor, p5);
        vec3.scale(this.cbbox.p6, this.scaleFactor, p6);
        vec3.scale(this.cbbox.p7, this.scaleFactor, p7);
        vec3.scale(this.cbbox.p8, this.scaleFactor, p8);

        vec3.add(p1, this.translationVector, p1);
        vec3.add(p2, this.translationVector, p2);
        vec3.add(p3, this.translationVector, p3);
        vec3.add(p4, this.translationVector, p4);
        vec3.add(p5, this.translationVector, p5);
        vec3.add(p6, this.translationVector, p6);
        vec3.add(p7, this.translationVector, p7);
        vec3.add(p8, this.translationVector, p8);

        /*if (spherify)
        {
            p1 = this.spherify(p1);
            p2 = this.spherify(p2);
            p3 = this.spherify(p3);
            p4 = this.spherify(p4);
            p5 = this.spherify(p5);
            p6 = this.spherify(p6);
            p7 = this.spherify(p7);
            p8 = this.spherify(p8);
        }*/
        
        var box = new bbox();
        box.setPoints(p1, p2, p3, p4, p5, p6, p7, p8);
        return box;
    },

    updateBBoxToSphere: function()
    {
        this.bbox = this._constructBBox(true);
    },

    spherify: function (translatedPoint)
    {
        var lon = translatedPoint[0] / 162.9;
        var lat = 2.0 * Math.atan(Math.exp(translatedPoint[2] / 162.9)) - Math.PI / 2.0;

        return vec3.create([512.0 * Math.cos(lat) * Math.cos(lon), 512.0 * Math.cos(lat) * Math.sin(lon), 512.0 * Math.sin(lat)]);
    },

    updateTexturePath: function (newTexturePath)
    {
        this.texturePath = this._getTexturePath(this.nodeNr, this.parentId, newTexturePath);
        this.textureLoaded = false;
        this.initialtexturePath = newTexturePath;
    },

    

    getTexture: function (ext, callback)
    {
        if (this.texture === null) {
            this.texture = device.createTexture();
            var image = new Image(256, 256);

            var success = function() {
                device.bindTexture(device.TEXTURE_2D, this.texture);

                device.texImage2D(device.TEXTURE_2D, 0, device.RGBA, device.RGBA, device.UNSIGNED_BYTE, image);
                device.texParameteri(device.TEXTURE_2D, device.TEXTURE_MAG_FILTER, device.LINEAR);
                device.texParameteri(device.TEXTURE_2D, device.TEXTURE_MIN_FILTER, device.LINEAR_MIPMAP_LINEAR);
                device.generateMipmap(device.TEXTURE_2D);

                device.texParameteri(device.TEXTURE_2D, device.TEXTURE_WRAP_S, device.CLAMP_TO_EDGE);
                device.texParameteri(device.TEXTURE_2D, device.TEXTURE_WRAP_T, device.CLAMP_TO_EDGE);

                if (ext)
                    device.texParameterf(device.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 16);

                device.bindTexture(device.TEXTURE_2D, null);
                callback();
            };

            image.addEventListener("load", success.bind(this), false);

            image.src = this.texturePath;
        }
    },

    getElevationFromWms: function (url, callback)
    {
        
            var image = new Image(128, 128);
            this.elevation = device.createTexture();
            this.elevation.loading = true;

            var success = function() {
                device.bindTexture(device.TEXTURE_2D, this.elevation);

                device.texImage2D(device.TEXTURE_2D, 0, device.RGBA, device.RGBA, device.UNSIGNED_BYTE, image);

                device.texParameteri(device.TEXTURE_2D, device.TEXTURE_WRAP_S, device.CLAMP_TO_EDGE);
                device.texParameteri(device.TEXTURE_2D, device.TEXTURE_WRAP_T, device.CLAMP_TO_EDGE);

                device.texParameteri(device.TEXTURE_2D, device.TEXTURE_MAG_FILTER, device.LINEAR);
                device.texParameteri(device.TEXTURE_2D, device.TEXTURE_MIN_FILTER, device.LINEAR_MIPMAP_LINEAR);
                device.generateMipmap(device.TEXTURE_2D);

                device.bindTexture(device.TEXTURE_2D, null);

                callback();
            };

            image.addEventListener("load", success.bind(this), false);

            image.src = url;
        
    },

   


    _getTexturePath: function (childId, parentId, initialtexturePath) {
        if (initialtexturePath === "")
            return "";
        
        if (initialtexturePath.pre.indexOf("google") != -1)
        {
            var tileCoords = this._quadKeyToTile(parentId + childId);
            return initialtexturePath.pre + "&x="+ tileCoords.x +"&y=" +tileCoords.y +"&z="+ tileCoords.z;
        }

        if (!initialtexturePath.tile)
            return initialtexturePath.pre + parentId + childId + initialtexturePath.su;
        
        else if (initialtexturePath.special != undefined)
        {
            var tileCoords = this._quadKeyToTile(parentId + childId);
            var ymax = Math.pow(2, tileCoords.z);
            var y = ymax - tileCoords.y - 1;
            return initialtexturePath.pre + tileCoords.z + "/" + tileCoords.x + "/" + y + initialtexturePath.su;
        }
        else
        {
            var tileCoords = this._quadKeyToTile(parentId + childId);
            return initialtexturePath.pre + tileCoords.z + "/" + tileCoords.x + "/" + tileCoords.y + initialtexturePath.su;
        }
    },

    _makeTileString: function (childId, parentId)
    {
       return parentId + childId;
    },

    getZoomLevel: function () {
        
        return this.id.toString().length;
    },

    _quadKeyToTile: function (key) {
        var x = 0;
        var y = 0;

        var zoom = key.length;

        for (var i = zoom; i > 0; i--)
        {
            var mask = 1 << (i - 1);
            var cell = parseInt(key.substr(zoom - i, 1));

            if ((cell & 1) !== 0) {
                x = x + mask;
            }

            if ((cell & 2) !== 0) {
                y = y + mask;
            }
        }

        return { x: x, y: y, z: zoom };
    }
}