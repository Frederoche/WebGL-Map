/// <reference path="BoundingBox.js" />
/// <reference path="Buffer.js" />
/// <reference path="Camera.js" />
/// <reference path="Plane.js" />
/// <reference path="gl-Matrix.js" />
function Frustum(nearDist, farDist, fovy, aspect)
{
    this.nearDist = nearDist;
    this.farDist = farDist;
    this.fovy = fovy * Math.PI / 180.0;
    this.aspect = aspect;

    this.hNear = Math.tan(this.fovy / 2.0) * nearDist; 
    this.hFar  = Math.tan(this.fovy / 2.0) * farDist;

    this.wNear = aspect * this.hNear;
    this.wFar  = aspect * this.hFar;

    this.vertices = new Float32Array(24);
    this.indices  = new Uint16Array(12);

    this.nc  = vec3.create();
    this.nlt = vec3.create();
    this.nrt = vec3.create();
    this.nlb = vec3.create();
    this.nrb = vec3.create();

    this.fc  = vec3.create();
    this.flt = vec3.create();
    this.frt = vec3.create();
    this.flb = vec3.create();
    this.frb = vec3.create();

    this.up       = vec3.create();
    this.right    = vec3.create();
    this.lookAt   = vec3.create();
    this.position = vec3.create();

    this.upScale       = vec3.create();
    this.rightScale    = vec3.create();
    this.lookAtScale   = vec3.create();
    this.lookDirection = vec3.create();

    this.indices = [0, 1, 2, 1, 2, 3];

    this.buffer = new Buffer('vfrustShader', 'ffrustShader');
    this.buffer.init(false);
    this.buffer.create(this.vertices, this.indices, null);

    this.nearPlane   = new Plane();
    this.farPlane    = new Plane();
    this.bottomPlane = new Plane();
    this.topPlane    = new Plane();
    this.leftPlane   = new Plane();
    this.rightPlane  = new Plane();

    this.planes = [];
};


Frustum.prototype =
{
    extractPlanes: function(camera)
    {
        this.position = camera.position;
        vec3.subtract(camera.lookAt, camera.position, this.lookAtScale);
        vec3.normalize(this.lookAtScale, this.lookAtScale);
        
        vec3.scale(this.lookAtScale, this.nearDist, this.lookDirection);
        this.lookAt = this.lookDirection;

        vec3.add(camera.position, this.lookDirection, this.nc);
        vec3.cross(this.lookAtScale, camera.up, this.right);
        
        //nlt
        vec3.scale(camera.up, this.hNear, this.upScale);
        vec3.scale(this.right, -this.wNear, this.rightScale);
        vec3.add(this.nc,  this.upScale, this.nlt);
        vec3.add(this.nlt, this.rightScale, this.nlt);

        //nrt
        vec3.scale(camera.up, this.hNear, this.upScale);
        vec3.scale(this.right, this.wNear, this.rightScale);
        vec3.add(this.nc, this.upScale, this.nrt);
        vec3.add(this.nrt, this.rightScale, this.nrt);

        //nlb 
        vec3.scale(camera.up, -this.hNear, this.upScale);
        vec3.scale(this.right, -this.wNear, this.rightScale);
        vec3.add(this.nc, this.upScale, this.nlb);
        vec3.add(this.nlb, this.rightScale, this.nlb);

        //nrb
        vec3.scale(camera.up, -this.hNear, this.upScale);
        vec3.scale(this.right, this.wNear, this.rightScale);
        vec3.add(this.nc, this.upScale, this.nrb);
        vec3.add(this.nrb, this.rightScale, this.nrb);

        vec3.scale(this.lookAtScale, this.farDist, this.lookDirection);
        this.lookAt = this.lookDirection;

        vec3.add(camera.position, this.lookDirection, this.fc);
        vec3.cross(this.lookAtScale, camera.up, this.right);

        //flt
        vec3.scale(camera.up, this.hFar, this.upScale);
        vec3.scale(this.right, -this.wFar, this.rightScale);
        vec3.add(this.fc, this.upScale, this.flt);
        vec3.add(this.flt, this.rightScale, this.flt);

        //frt 
        vec3.scale(camera.up, this.hFar, this.upScale);
        vec3.scale(this.right, this.wFar, this.rightScale);
        vec3.add(this.fc, this.upScale, this.frt);
        vec3.add(this.frt, this.rightScale, this.frt);

        //flb 
        vec3.scale(camera.up, this.hFar, this.upScale);
        vec3.scale(this.right, -this.wFar, this.rightScale);
        vec3.subtract(this.fc, this.upScale, this.flb);
        vec3.add(this.flb, this.rightScale, this.flb);

        //frb 
        vec3.scale(camera.up, this.hFar, this.upScale);
        vec3.scale(this.right, this.wFar, this.rightScale);
        vec3.subtract(this.fc, this.upScale, this.frb);
        vec3.add(this.frb, this.rightScale, this.frb);
        

        //EXTRACT FRUSTUM PLANES
        this.nearPlane.getThreePoints(this.nlt, this.nrt, this.nlb);
        this.farPlane.getThreePoints(this.frt, this.flt, this.flb);
        this.topPlane.getThreePoints(this.nrt, this.nlt,this.flt);
        this.bottomPlane.getThreePoints(this.nlb, this.nrb, this.frb);
        this.leftPlane.getThreePoints(this.nlt, this.nlb, this.flb);
        this.rightPlane.getThreePoints(this.nrb, this.nrt, this.frb);

        this.planes = [this.nearPlane, this.farPlane, this.topPlane, this.bottomPlane, this.leftPlane, this.rightPlane];
    },

    drawFrustum: function (projMatrix, viewMatrix)
    {
        this.vertices[0]  = this.nlt[0];
        this.vertices[1]  = this.nlt[1];
        this.vertices[2]  = this.nlt[2];
        this.vertices[3]  = this.nrt[0];
        this.vertices[4]  = this.nrt[1];
        this.vertices[5]  = this.nrt[2];
        this.vertices[6]  = this.nlb[0];
        this.vertices[7]  = this.nlb[1];    
        this.vertices[8]  = this.nlb[2];
        this.vertices[9]  = this.nrb[0]; 
        this.vertices[10] = this.nrb[1];
        this.vertices[11] = this.nrb[2];

        this.buffer.update(this.vertices, this.indices, 4, 6);
        this.buffer.render(projMatrix, viewMatrix);

        this.vertices[0]   = this.flt[0];
        this.vertices[1]   = this.flt[1];
        this.vertices[2]   = this.flt[2];
        this.vertices[3]   = this.frt[0];
        this.vertices[4]   = this.frt[1];
        this.vertices[5]   = this.frt[2];
        this.vertices[6]   = this.frb[0];
        this.vertices[7]   = this.frb[1];
        this.vertices[8]   = this.frb[2];
        this.vertices[9]   = this.flb[0];
        this.vertices[10]  = this.flb[1];
        this.vertices[11]  = this.flb[2];

        this.buffer.update(this.vertices, this.indices, 4, 6);
        this.buffer.render(projMatrix, viewMatrix);

        this.vertices[0] = this.flb[0];
        this.vertices[1] = this.flb[1];
        this.vertices[2] = this.flb[2];
        this.vertices[3] = this.nlb[0];
        this.vertices[4] = this.nlb[1];
        this.vertices[5] = this.nlb[2];
        this.vertices[6] = this.nrb[0];
        this.vertices[7] = this.nrb[1];
        this.vertices[8] = this.nrb[2];
        this.vertices[9] = this.frb[0];
        this.vertices[10] = this.frb[1];
        this.vertices[11] = this.frb[2];
        
        this.buffer.update(this.vertices, this.indices, 4, 6);
        this.buffer.render(projMatrix, viewMatrix);

        this.vertices[0] = this.flt[0];
        this.vertices[1] = this.flt[1];
        this.vertices[2] = this.flt[2];
        this.vertices[3] = this.nlt[0];
        this.vertices[4] = this.nlt[1];
        this.vertices[5] = this.nlt[2];
        this.vertices[6] = this.nrt[0];
        this.vertices[7] = this.nrt[1];
        this.vertices[8] = this.nrt[2];
        this.vertices[9] = this.frt[0];
        this.vertices[10] = this.frt[1];
        this.vertices[11] = this.frt[2];

        this.buffer.update(this.vertices, this.indices, 4, 6);
        this.buffer.render(projMatrix, viewMatrix);

    },

    isBoxInsideFrustum: function(bbox) //True = INSIDE, False = OUTSIDE
    {
        var outside = 0;
        var inside = 0;

        for (var l = 0; l < 6; l++)
        {
            outside = 0;
            inside = 0;

            for (var k = 0; k < 8 && (inside == 0 || outside == 0) ; k++)
            {
                if (this.planes[l].distanceToPoint(bbox.getPoints()[k]) < 0) {
                    outside++;
                }
                else
                {
                    inside++;
                }
            }

            if (!inside) {
                return false;
            }
        }
        return true;
    }
};