 XMap.Plane = function() {
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.d = 0;

};

XMap.Plane.prototype =
{
    getThreePoints: function (p1, p2, p3)
    {
        var vector1   = vec3.create();
        var vector2   = vec3.create();
        var result    = vec3.create();

        vec3.subtract(p2, p1, vector1);
        vec3.subtract(p3, p1, vector2);

        vec3.cross(vector1, vector2, result);
        
        
        this.a = result[0];
        this.b = result[1];
        this.c = result[2];

        this.d = -(this.a * p1[0] + this.b * p1[1] + this.c * p1[2]);

        this.normal = vec3.create([this.a, this.b, this.c]);

        this.normal = vec3.normalize(this.normal);
    },

    distanceToPoint: function (p)
    {
        return (this.a * p[0]  + this.b * p[1] + this.c * p[2] + this.d);
    },

    
};