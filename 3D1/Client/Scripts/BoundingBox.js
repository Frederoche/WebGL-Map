 XMap.bbox = function() {
    this.p1 = vec3.create();
    this.p2 = vec3.create();
    this.p3 = vec3.create();
    this.p4 = vec3.create();
    this.p5 = vec3.create();
    this.p6 = vec3.create();
    this.p7 = vec3.create();
    this.p8 = vec3.create();
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