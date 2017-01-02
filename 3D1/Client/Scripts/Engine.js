device = {};


XMap.ThreeDEngine = function(options) {
    
    this.canvas = options.canvas;
    
    this.initialRootSize = options.initialRootSize;

    this.viewMatrix = mat4.create();
    this.projMatrix = mat4.create();

    this.elevationUrl = options.elevationUrl;

    this.camera = new XMap.Camera(vec3.create([0, 400, 0]), vec3.create([0, 0, 0]), vec3.create([0, 1, 0]), this.initialRootSize);
    this.birdCamera = new XMap.Camera(vec3.create([0, 400, 0]), vec3.create([0, 0, 0]), vec3.create([0, 1, 0]), this.initialRootSize);

    this.quadtree = {};
    
    this.frustum = {};
    
    this.wireFrame = {};
    
    this.Wms = false;
    
    this._birdCamOn = false;
    this._spherify = false;

    this.tileUrl = options.tileUrl;

    this.animationframeId = 0;
    this.showBBox = false;

    this.translationXMatrix = {};
    
    this.rotationMatrix = mat4.create();
    mat4.identity(this.rotationMatrix);

    this._lastdate = new Date();
    this.lastUpdateCall = null;
};


XMap.ThreeDEngine.prototype =
{
    _getUserPosition: function () {
        var self = this;
        navigator.geolocation.getCurrentPosition(function (pos) {
            var mercator = new XMap.Mercator(self.initialRootSize);

            var x = mercator.getX(pos.coords.longitude);
            var z = mercator.getZ(pos.coords.latitude);

            self.camera.position = vec3.create([x, 0.05, z]);
            self.camera.lookAt = vec3.create([x, -1.05, z]);
            self.camera.update();

        });
    },

    init: function () {
        window.device = null;
        window.device = this.canvas.getContext('experimental-webgl', { alpha: false, antialias: true, stencil: false }) || window.WebGLRenderingContext;

        if(window.device == null)
            window.device = this.canvas.getContext('experimental-webgl');

        this.canvas.width  = document.body.clientWidth ;
        this.canvas.height = document.body.clientHeight ;

        window.device.viewportWidth  = this.canvas.width;
        window.device.viewportHeight = this.canvas.height;

        window.device.viewport(0, 0, window.device.drawingBufferWidth, window.device.drawingBufferHeight);
        
        try
        {
            window.device.getExtension('OES_element_index_uint');

            this.ext = window.device.getExtension("EXT_texture_filter_anisotropic") ||
		               window.device.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
		               window.device.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

            window.device.getExtension("OES_texture_float");
        }
        catch (ex)
        {
            alert("32 bit indices not supported");
        }

        this.frustum = new XMap.Frustum(0.001, 2000, 65, this.canvas.clientWidth / this.canvas.clientHeight);

        var quadtreeOptions =
        {
            initialRootSize: this.initialRootSize,
            quadtreeDepth: 2,
            initialtexturePath: this.tileUrl,
            initialElevationPath: this.elevationUrl,
            chunckSize: 256
        };

        this.quadtree = new XMap.Quadtree(quadtreeOptions);

        window.device.clearColor(100/255, 149/255, 237/255, 1.0);
        window.device.clearDepth(1);
        window.device.enable(window.device.DEPTH_TEST);
        window.device.depthMask(true);
        window.device.disable(window.device.BLEND);
        window.device.enable(window.device.CULL_FACE);
        window.device.cullFace(window.device.FRONT);

        this.wireFrame = window.device.TRIANGLES;

    },

    _computeFps: function () {
        var newDate = new Date();
        var fps = 1000 / (newDate - this._lastdate);
        this._lastdate = newDate;
        return fps.toFixed(1);
    },    

    keyboard: function (event) {
        
        switch (event.which) {
            case 83:
                this.camera.lookDown();
                break;
            case 88:
                this.camera.lookUp();
                break;
        }
    },

    _chooseCamera: function ()
    {
        
        if (this._birdCamOn)
        {
            this.birdCamera.position[1] = this.camera.position[1] + 600;
            mat4.perspective(70, device.viewportWidth / device.viewportHeight, 0.1, 10000.0, this.projMatrix);
            mat4.lookAt(this.birdCamera.position, this.camera.position, this.birdCamera.up, this.viewMatrix);
        }
        else
        {
            mat4.perspective(45, device.viewportWidth / device.viewportHeight, 0.01, 1500, this.projMatrix);
            mat4.lookAt(this.camera.position, this.camera.lookAt, this.camera.up, this.viewMatrix);
        }
    },

    setTileUrl: function (tileUrl) {
        
        this.tileUrl = tileUrl;
    },

    renderScene: function () {
        
        this.lastUpdateCall = requestAnimationFrame(this.renderScene.bind(this));

        device.clear(device.COLOR_BUFFER_BIT | device.DEPTH_BUFFER_BIT);
        
        document.onkeydown = this.keyboard.bind(this);

        this._chooseCamera();
        
        XMap.DOM.Events._displayPosition();

        this.frustum.extractPlanes(this.camera);

        device.disable(device.CULL_FACE);

        if (this.lastUpdateCall)
            cancelAnimationFrame(this.lastUpdateCall);

        //PSEUDO-INSTANCED
        this.quadtree.setProgram();
            this.quadtree.setMatrixUniforms(this.projMatrix, this.viewMatrix, this.camera);
            this.quadtree.draw(this.wireFrame, this.frustum, this.quadtree.rootNode, this.ext, 64, this.tileUrl);
        this.quadtree.disableProgram();

        this.lastUpdateCall = requestAnimationFrame(function () {
            this.renderScene();
        }.bind(this));

        if (this._birdCamOn)
            this.frustum.drawFrustum(this.projMatrix, this.viewMatrix);

        this.camera.update();
        
        this.quadtree.counter= 0;
        
    },
};






