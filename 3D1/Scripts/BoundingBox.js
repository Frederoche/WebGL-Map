/// <reference path="gl-Matrix.js" />
function bbox() {
    this.p1 = vec3.create();
    this.p2 = vec3.create();
    this.p3 = vec3.create();
    this.p4 = vec3.create();
    this.p5 = vec3.create();
    this.p6 = vec3.create();
    this.p7 = vec3.create();
    this.p8 = vec3.create();
};

bbox.prototype =
{
    setPoints: function (p1, p2, p3, p4, p5, p6, p7, p8) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.p4 = p4;
        this.p5 = p5;
        this.p6 = p6;
        this.p7 = p7;
        this.p8 = p8;
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