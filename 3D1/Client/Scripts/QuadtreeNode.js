 XMap.QuadtreeNode = function(option) {
    this.parent = option.parent;
    this.scaleFactor = option.scaling;
    this.colorVector = option.color;
    this.center = option.translation;
    
    this.elevation = null;
    this.texture = null;
    this.textureLoaded = false;
    this.elevationLoaded = false;

    this.id = option.id;
    
    this.child = [];

    this.bbox = this._constructBBox(option.bbox);
    
    this.texturePath = this._getTexturePath(option.id, option.texturePath);
    this.elevationDataTexturePath = this._getTexturePath(option.id, option.elevationDataTexturePath);
    
    this.type = 2;
};


XMap.QuadtreeNode.prototype =
{
    _constructBBox: function (bboxOption)
    {
        var p1 = vec3.create();
        var p2 = vec3.create();
        var p3 = vec3.create();
        var p4 = vec3.create();
        var p5 = vec3.create();
        var p6 = vec3.create();
        var p7 = vec3.create();
        var p8 = vec3.create();

        //BBOX scaling;
        vec3.scale(bboxOption.p1, this.scaleFactor, p1);
        vec3.scale(bboxOption.p2, this.scaleFactor, p2);
        vec3.scale(bboxOption.p3, this.scaleFactor, p3);
        vec3.scale(bboxOption.p4, this.scaleFactor, p4);
        vec3.scale(bboxOption.p5, this.scaleFactor, p5);
        vec3.scale(bboxOption.p6, this.scaleFactor, p6);
        vec3.scale(bboxOption.p7, this.scaleFactor, p7);
        vec3.scale(bboxOption.p8, this.scaleFactor, p8);

        vec3.add(p1, this.center, p1);
        vec3.add(p2, this.center, p2);
        vec3.add(p3, this.center, p3);
        vec3.add(p4, this.center, p4);
        vec3.add(p5, this.center, p5);
        vec3.add(p6, this.center, p6);
        vec3.add(p7, this.center, p7);
        vec3.add(p8, this.center, p8);

        var box = new XMap.bbox();

        var points = {
            p1:p1,
            p2:p2,
            p3:p3,
            p4:p4,
            p5:p5,
            p6:p6,
            p7:p7,
            p8:p8,
        }

        box.setPoints(points);
        return box;
    },

    updateTexturePath: function (newTexturePath)
    {
        this.texturePath = this._getTexturePath(this.id, newTexturePath);
        this.textureLoaded = false;
        this.initialtexturePath = newTexturePath;
    },

    loadtextureHandler : function(ext,callback)
    {
        device.bindTexture(device.TEXTURE_2D, this.texture);
            
        device.texImage2D(device.TEXTURE_2D, 0, device.RGBA, device.RGBA, device.UNSIGNED_BYTE, this.texture.image);

        device.texParameteri(device.TEXTURE_2D, device.TEXTURE_MAG_FILTER, device.LINEAR);
        device.texParameteri(device.TEXTURE_2D, device.TEXTURE_MIN_FILTER, device.LINEAR_MIPMAP_LINEAR);
        device.texParameteri(device.TEXTURE_2D, device.TEXTURE_WRAP_S, device.CLAMP_TO_EDGE);
        device.texParameteri(device.TEXTURE_2D, device.TEXTURE_WRAP_T, device.CLAMP_TO_EDGE);
            
        device.texParameterf(device.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
            
        device.generateMipmap(device.TEXTURE_2D);

        device.bindTexture(device.TEXTURE_2D, null);
        callback();
    },

    getTexture: function (ext, callback)
    {
        if(this.textureLoaded)
            callback();

        this.texture = device.createTexture();
        this.texture.image = new Image(256, 256);

        this.texture.image.addEventListener("load", this.loadtextureHandler.bind(this, ext, callback), false);
        this.texture.image.src = this.texturePath;
    },

    loadElevation :function(callback)
    {
        device.bindTexture(device.TEXTURE_2D, this.elevation);

            device.texImage2D(device.TEXTURE_2D, 0, device.RGBA, device.RGBA, device.UNSIGNED_BYTE, this.elevation.image);

            device.texParameteri(device.TEXTURE_2D, device.TEXTURE_WRAP_S, device.CLAMP_TO_EDGE);
            device.texParameteri(device.TEXTURE_2D, device.TEXTURE_WRAP_T, device.CLAMP_TO_EDGE);

            device.texParameteri(device.TEXTURE_2D, device.TEXTURE_MAG_FILTER, device.LINEAR);
            device.texParameteri(device.TEXTURE_2D, device.TEXTURE_MIN_FILTER, device.LINEAR_MIPMAP_LINEAR);
            device.generateMipmap(device.TEXTURE_2D);

            device.bindTexture(device.TEXTURE_2D, null);
            
            callback();
    },

    getElevationFromWms: function (url, callback)
    {
        if(this.elevationLoaded)
            callback();

        this.elevation = device.createTexture();
        this.elevation.image = new Image(128, 128);
        
        this.elevation.image.addEventListener("load", this.loadElevation.bind(this, callback), false);

        this.elevation.image.src = url;
        
    },

    _getTexturePath: function (id, initialtexturePath) {
        if (initialtexturePath === "")
            return "";
        
        if (initialtexturePath.pre.indexOf("google") > -1)
        {
            var tileCoords = this._quadKeyToTile(id);
            return initialtexturePath.pre + "&x="+ tileCoords.x +"&y=" +tileCoords.y +"&z="+ tileCoords.z;
        }

        if (!initialtexturePath.tile)
            return initialtexturePath.pre + id+ initialtexturePath.su;
        
        else if (initialtexturePath.special != undefined)
        {
            var tileCoords = this._quadKeyToTile(id);
            var ymax = Math.pow(2, tileCoords.z);
            var y = ymax - tileCoords.y - 1;
            return initialtexturePath.pre + tileCoords.z + "/" + tileCoords.x + "/" + y + initialtexturePath.su;
        }
        else
        {
            var tileCoords = this._quadKeyToTile(id);
            return initialtexturePath.pre + tileCoords.z + "/" + tileCoords.x + "/" + tileCoords.y + initialtexturePath.su;
        }
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