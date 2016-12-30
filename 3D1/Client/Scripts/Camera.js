XMap.Camera = function(position0, lookAt0, up0, initialtileSize)
{
    this.position = vec3.create(position0);
    this.lookAt = vec3.create(lookAt0);
    this.up = vec3.create(up0);

    this.angle = - Math.PI / 2.0;
    this.pitch =   Math.PI;

    this.speed = 2.0;
    this.Mercator = new XMap.Mercator(initialtileSize);
};


XMap.Camera.prototype =
{
    update: function () {
        var lookAtScale = vec3.create();
        vec3.subtract(this.position, this.lookAt, lookAtScale);
        vec3.cross(lookAtScale, [1, 0, 0], this.up);
    },

    moveForward: function () {
        vec3.add(this.position, [this.speed * Math.cos(this.angle) * Math.sin(this.pitch), this.speed * Math.cos(this.pitch), this.speed * Math.sin(this.angle) * Math.sin(this.pitch)], this.position);
        vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
    },

    moveBackward: function () {
        vec3.add(this.position, [-this.speed * Math.cos(this.angle) * Math.sin(this.pitch), -this.speed * Math.cos(this.pitch), -this.speed * Math.sin(this.angle) * Math.sin(this.pitch)], this.position);
        vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
        
    },

    moveUp: function () {
        vec3.add(this.position, [0, this.speed, 0], this.position);
        vec3.add(this.lookAt, [0, this.speed, 0], this.lookAt);
    },

    moveDown: function () {
        vec3.add(this.position, [0,   -this.speed, 0], this.position);
        vec3.add(this.lookAt,   [0,   -this.speed, 0], this.lookAt);
    },

    getLng: function () {
        return this.Mercator.getLat(this.position);
    },

    getLat: function () {
        return this.Mercator.getLng(this.position);
    },

    lookRight: function () {
        this.angle += 0.01;
        vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
    },

    lookLeft: function () {
        this.angle -= 0.01;
        vec3.add(this.position, [ Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
    },

    lookUp: function () {
        this.pitch += 0.03;
        vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
    },

    lookDown: function () {
        this.pitch -= 0.03;
        vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
    },

    _zoomIn : function() 
    {
        if (this.position[1] < 11.0 && this.position[1] >= 2.0) {
            this.speed = 0.25;
        }
        else if (this.position[1] < 2.0 && this.position[1] >= 1.0) {
            this.speed = 0.05;
        }
        else if (this.position[1] < 1.0) {
            this.speed = 0.005;
        }
        else if (this.position[1] < 0.1) {
            this.speed = 0.0005;
        }
        else {
            this.speed = 5.0;
        }

        this.moveForward();
    },

    _zoomOut: function () {
        if (this.position[1] < 11.0 && this.position[1] >= 2.0) {
            this.speed = 0.25;
        }
        else if (this.position[1] < 2.0 && this.position[1] >= 1.0) {
            this.speed = 0.05;
        }
        else if (this.position[1] < 1.0) {
            this.speed = 0.005;
        }
        else if (this.position[1] < 0.1) {
            this.speed = 0.0005;
        }
        else {
            this.speed = 5.0;
        }

        this.moveBackward();        
    },

};

