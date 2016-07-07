/// <reference path="gl-Matrix.js" />


function Plane() {
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.d = 0;
};

Plane.prototype =
{
    getThreePoints: function (p1, p2, p3)
    {
        var vec1   = vec3.create();
        var vec2   = vec3.create();
        var result = vec3.create();

        vec3.subtract(p2, p1, vec1);
        vec3.subtract(p3, p1, vec2);

        vec3.cross(vec1, vec2, result);
        //vec3.normalize(result, result);
        
        this.a = result[0];
        this.b = result[1];
        this.c = result[2];

        this.d = -(this.a * p3[0] + this.b * p3[1] + this.c * p3[2]);
    },

    distanceToPoint: function (p)
    {
        return (this.a * p[0]  + this.b * p[1] + this.c * p[2] + this.d) / Math.sqrt(this.a * this.a + this.b * this.b + this.c * this.c);
    }
};