 XMap.bbox = function() {
    this.p1 = vec3.create();
    this.p2 = vec3.create();
    this.p3 = vec3.create();
    this.p4 = vec3.create();
    this.p5 = vec3.create();
    this.p6 = vec3.create();
    this.p7 = vec3.create();
    this.p8 = vec3.create();

    this.min = 0;
    this.max = 0;
};

XMap.bbox.prototype =
{
    setPoints: function (options) {
        this.p1 = options.p1;
        this.p2 = options.p2;
        this.p3 = options.p3;
        this.p4 = options.p4;
        this.p5 = options.p5;
        this.p6 = options.p6;
        this.p7 = options.p7;
        this.p8 = options.p8;

        this.min = this._calculateMin();
        this.max = this._calculateMax();
    },

    _calculateMin : function()
    {
        var minX = Math.min.apply(null,[this.p1[0], this.p2[0], this.p3[0], this.p4[0], this.p5[0], this.p5[0], this.p6[0], this.p7[0], this.p8[0]]);
        var minY = Math.min.apply(null,[this.p1[1], this.p2[1], this.p3[1], this.p4[1], this.p5[1], this.p5[1], this.p6[1], this.p7[1], this.p8[1]]);
        var minZ = Math.min.apply(null,[this.p1[2], this.p2[2], this.p3[2], this.p4[2], this.p5[2], this.p5[2], this.p6[2], this.p7[2], this.p8[2]]);

        return vec3.create([minX, minY, minZ]);
    },

    _calculateMax : function()
    {
        var maxX = Math.max.apply(null,[this.p1[0], this.p2[0], this.p3[0], this.p4[0], this.p5[0], this.p5[0], this.p6[0], this.p7[0], this.p8[0]]);
        var maxY = Math.max.apply(null,[this.p1[1], this.p2[1], this.p3[1], this.p4[1], this.p5[1], this.p5[1], this.p6[1], this.p7[1], this.p8[1]]);
        var maxZ = Math.max.apply(null,[this.p1[2], this.p2[2], this.p3[2], this.p4[2], this.p5[2], this.p5[2], this.p6[2], this.p7[2], this.p8[2]]);
        
        return vec3.create([maxX,maxY, maxZ]);
    },

    

    getPVertex : function(normal)
    {
        var px = this.min[0];
        var py = this.min[1];
        var pz = this.min[2];

        if(normal[0] >= 0)
        {
            px = this.max[0];
        }

        if(normal[1] >= 0)
        {
            py = this.max[1];
        }

        if(normal[2] >= 0)
        {
            pz = this.max[2];
        }
        
        return vec3.create([px,py, pz]);

    },

    getNVertex : function(normal)
    {
        var nx = this.max[0];
        var ny = this.max[1];
        var nz = this.max[2];

        if(normal[0] >= 0)
        {
            nx = this.min[0];
        }

        if(normal[1] >= 0)
        {
            ny = this.min[1];
        }

        if(normal[2] >= 0)
        {
            nz = this.min[2];
        }
        
        return vec3.create([nx,ny, nz]);
    },

    _distance : function(p1 ,p2)
    {
        return Math.abs( (p1[0] - p2[0]) + (p1[1] - p2[1])  + (p1[2] - p2[2]));
    },

    updateByRotation: function (rotationMatrix) {
        mat4.multiplyVec3(rotationMatrix, this.p1);
        mat4.multiplyVec3(rotationMatrix, this.p2);
        mat4.multiplyVec3(rotationMatrix, this.p3);
        mat4.multiplyVec3(rotationMatrix, this.p4);
    },

    getPoints: function ()
    {
        return [this.p1, this.p2, this.p3, this.p4, this.p5, this.p6, this.p7, this.p8];
    },
};