/// <reference path="Quadtree.js" />
/// <reference path="gl-Matrix.js" />
/// <reference path="Frustum.js" />
/// <reference path="Chunck.js" />
/// <reference path="Camera.js" />
device = {};

function ThreeDEngine(canvas, tileUrl, elevationUrl, initialRootSize) {
    this.canvas = canvas;
    this.doc = document;

    this.initialRootSize = initialRootSize;

    this.viewMatrix = mat4.create();
    this.projMatrix = mat4.create();

    this.elevationUrl = elevationUrl;

    this.cubeTexture = {};

    this.camera = new Camera(vec3.create([0, 400, 0]), vec3.create([0, 0, 0]), vec3.create([0, 1, 0]), this.initialRootSize);
    this.birdCamera = new Camera(vec3.create([0, 700, 0]), vec3.create([0, 0, 0]), vec3.create([0, 1, 0]), this.initialRootSize);

    this.quadtree = {};
    
    this.frustum = {};
    
    this.wireFrame = {};

    this.Wms = false;
    
    this._birdCamOn = false;
    this._spherify = false;

    this.tileUrl = tileUrl;

    this.animationframeId = 0;
    this.showBBox = false;

    this.translationXMatrix = {};
    
    this.geocoding = new Geocoding('http://api.opencagedata.com/geocode/v1/json?pretty=1&key=2532638cbbd3c34fe376ccdfd6a9bc6c&query=');

    this.rotationMatrix = mat4.create();
    mat4.identity(this.rotationMatrix);

    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mousemove = false;

    this._lastdate = new Date();
    this.lastUpdateCall = null;
};


ThreeDEngine.prototype =
{
    _zoomIn : function() {
        if (this.camera.position[1] < 3.0 && this.camera.position[1] >= 2.0) {
            this.camera.speed = 0.25;
        }
        else if (this.camera.position[1] < 2.0 && this.camera.position[1] >= 1.0) {
            this.camera.speed = 0.05;
        }
        else if (this.camera.position[1] < 1.0) {
            this.camera.speed = 0.005;
        }
        else if (this.camera.position[1] < 0.1) {
            this.camera.speed = 0.0005;
        }
        else {
            this.camera.speed = 5.0;
        }

        this.camera.moveForward();
        this.birdCamera.moveForward();
    },

    _zoomOut: function () {
        if (this.camera.position[1] < 11.0 && this.camera.position[1] >= 2.0) {
            this.camera.speed = 0.25;
        }
        else if (this.camera.position[1] < 2.0 && this.camera.position[1] >= 1.0) {
            this.camera.speed = 0.05;
        }
        else if (this.camera.position[1] < 1.0) {
            this.camera.speed = 0.005;
        }
        else if (this.camera.position[1] < 0.1) {
            this.camera.speed = 0.0005;
        }
        else {
            this.camera.speed = 5.0;
        }

        

        this.camera.moveBackward();
        this.birdCamera.moveBackward();
    },

    _getUserPosition: function () {
        var self = this;
        navigator.geolocation.getCurrentPosition(function (pos) {
            var mercator = new Mercator(self.initialRootSize);

            var x = mercator.getX(pos.coords.longitude);
            var z = mercator.getZ(pos.coords.latitude);

            self.camera.position = vec3.create([x, 0.05, z]);
            self.camera.lookAt = vec3.create([x, -1.05, z]);
            self.camera.update();

        });
    },


    _generateAutocomplete: function (obj) {
        if (obj === null)
            return;
        
        for (var i = 0; i < obj.results.length; i++)
        {
            var listElement = document.createElement('li');

            var img = document.createElement('img');
            img.src = '../Images/pin_marker-256.png';

            var country = document.createElement('span');
            country.textContent = obj.results[i].components.country;

            listElement.textContent = obj.results[i].formatted;
            listElement.id = 'list-element-' + i;
            listElement.appendChild(img);
            listElement.appendChild(country);

            listElement.lat = obj.results[i].geometry.lat;
            listElement.lng = obj.results[i].geometry.lng;
            listElement.cityName = obj.results[i].components.country;

            var self = this;

            listElement.onclick = function ()
            {
                var li = document.getElementById(this.id);
                var mercator = new Mercator(self.initialRootSize);

                var x = mercator.getX(li.lng);
                var z = mercator.getZ(li.lat);

                self.camera.position = vec3.create([x, 0.05, z]);
                self.camera.lookAt = vec3.create([x, -1.05, z]);
                self.camera.update();

                document.getElementById("coordinate").value = li.cityName;
                document.getElementById('autocomplete').innerHTML = '';

            };

            document.getElementById('autocomplete').appendChild(listElement);
        }
    },

    init: function () {
        window.device = null;
        window.device = this.canvas.getContext('experimental-webgl', { alpha: false, antialias: true, stencil: false });

        if(window.device == null)
            window.device = this.canvas.getContext('webgl');

        var realToCSSPixels = window.devicePixelRatio || 1;

        this.canvas.width  = document.body.clientWidth  * realToCSSPixels;
        this.canvas.height = document.body.clientHeight * realToCSSPixels;

        window.device.viewportWidth  = this.canvas.width;
        window.device.viewportHeight = this.canvas.height;

        window.onresize = function ()
        {
            var displayWidth = window.innerWidth;
            var displayHeight = window.innerHeight;
            

            if (this.canvas.width !== displayWidth ||
                this.canvas.height !== displayHeight) {


                this.canvas.width = displayWidth;
                this.canvas.height = displayHeight;
                

                window.device.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
        }.bind(this);

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

        this.frustum = new Frustum(0.01, 3000, 65, this.canvas.clientWidth / this.canvas.clientHeight);

        var quadtreeOptions =
        {
            initialRootSize: this.initialRootSize,
            quadtreeDepth: 2,
            initialtexturePath: this.tileUrl,
            initialElevationPath: this.elevationUrl,
            chunckSize: 128
        };

        this.quadtree = new Quadtree(quadtreeOptions);

        window.device.clearColor(0.0, 0.0, 0.0, 1.0);
        window.device.clearDepth(1);
        window.device.enable(window.device.DEPTH_TEST);
        window.device.depthMask(true);
        window.device.disable(window.device.BLEND);
        window.device.enable(window.device.CULL_FACE);
        window.device.cullFace(window.device.FRONT);

        this.wireFrame = window.device.TRIANGLES;

        var mouseWheel = function (e) {
            if (this.lastUpdateCall)
                cancelAnimationFrame(this.lastUpdateCall);

            if (this.camera.position[1] < 11.0 && this.camera.position[1] >= 2.0) {
                this.camera.speed = 0.25;
            } else if (this.camera.position[1] < 2.0 && this.camera.position[1] >= 1.0) {
                this.camera.speed = 0.05;
            } else if (this.camera.position[1] < 1.0 && this.camera.position[1] >= 0.1) {
                this.camera.speed = 0.005;
            } else if (this.camera.position[1] < 0.1) {
                this.camera.speed = 0.0005;
            } else {
                this.camera.speed = 5.0;
            }


            var delta = e.wheelDelta ? e.wheelDelta : -e.detail;

            if (delta > 0) {
                this.camera.moveForward();
                this.birdCamera.moveForward();
            } else {
                this.camera.moveBackward();
                this.birdCamera.moveBackward();
            }

           

            this.lastUpdateCall = requestAnimationFrame(function () {
                this.renderScene();

            }.bind(this));

        };

        var mouseDown = function(e) {
            this.mousemove = true;

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        };

       
        this.canvas.addEventListener('mousewheel', mouseWheel.bind(this), false);
        this.canvas.addEventListener('DOMMouseScroll', mouseWheel.bind(this), false);
        this.canvas.addEventListener('mousedown', mouseDown.bind(this), false);


        document.getElementById("coordinate").onkeyup = function (e) {
            
            document.getElementById("autocomplete").style.display = 'block';

            var searchString = document.getElementById("coordinate").value;

            if (searchString === "")
                return;

            this.geocoding.constructSearchUrl(searchString, '', '');

            var jObj = {};

            var self = this;
            
            var autocomplete = document.getElementById('autocomplete');

            while (autocomplete.firstChild)
            {
                autocomplete.removeChild(autocomplete.firstChild);
            }

            this.geocoding.sendRequest(function (resp) {

                if (resp !== '') {
                    jObj = JSON.parse(resp);
                    self._generateAutocomplete(jObj);
                }

            });

        }.bind(this);

       
        document.onmousemove = function (e)
        {
            var localPositionX = 2.0 * e.clientX / this.canvas.width - 1.0;
            var localPositionY = -2.0 * e.clientY / this.canvas.height + 1.0;
            var localPositionZ = -1.0;

            var point3D = [localPositionX, localPositionY, localPositionZ, 1.0];

            var invViewMatrix = mat4.create();
            var invProjMatrix = mat4.create();

            mat4.inverse(this.projMatrix, invProjMatrix);
            mat4.inverse(this.viewMatrix, invViewMatrix);

            mat4.multiplyVec4(invProjMatrix, point3D);
            mat4.multiplyVec4(invViewMatrix, point3D);

            if (!this.mousemove)
                return;

            var newX = e.clientX;
            var newY = e.clientY;

            var dX = newX - this.lastMouseX;
            var dY = newY - this.lastMouseY;

            var translation = vec3.create([-dX * this.camera.position[1] / 1000.0, 0, -dY * this.camera.position[1] / 1000.0]);

            vec3.add(this.camera.lookAt, translation, this.camera.lookAt);
            vec3.add(this.camera.position, translation, this.camera.position);

            this.lastMouseX = newX;
            this.lastMouseY = newY;

            if (this.lastUpdateCall)
                cancelAnimationFrame(this.lastUpdateCall);
            
            this.lastUpdateCall = requestAnimationFrame(function() {
                this.renderScene();
            }.bind(this));

        }.bind(this);

        document.onmouseup = function (e) {
            this.mousemove = false;

        }.bind(this);
    },

    _computeFps: function () {
        var newDate = new Date();
        var fps = 1000 / (newDate - this._lastdate);
        this._lastdate = newDate;
        return fps.toFixed(1);
    },

    _displayPosition: function ()
    {
        document.getElementById('positionx').innerHTML = this.camera.position[0].toFixed(2);
        document.getElementById('positiony').innerHTML = this.camera.position[1].toFixed(2);
        document.getElementById('positionz').innerHTML = this.camera.position[2].toFixed(2);

        document.getElementById('position-lat').innerHTML = this.camera.getLat().toFixed(4);
        document.getElementById('position-lng').innerHTML = this.camera.getLng().toFixed(4);

        document.getElementById('fps').innerHTML = this._computeFps();

        if (document.getElementById('wireframe').checked)
            this.wireFrame = device.LINES;
        else
            this.wireFrame = device.TRIANGLES;
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
            mat4.perspective(70, device.viewportWidth / device.viewportHeight, 0.1, 10000.0, this.projMatrix);
            mat4.lookAt(this.birdCamera.position, this.camera.position, this.birdCamera.up, this.viewMatrix);
        }
        else
        {
            mat4.perspective(45, device.viewportWidth / device.viewportHeight, 0.01, 2000, this.projMatrix);
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
        
        this._displayPosition();

        this.frustum.extractPlanes(this.camera);

        if (this._spherify)
            device.cullFace(device.BACK);
        else
            device.disable(device.CULL_FACE);

        if (this.lastUpdateCall)
            cancelAnimationFrame(this.lastUpdateCall);

        //PSEUDO-INSTANCED
        this.quadtree.setProgram();
            this.quadtree.setMatrixUniforms(this.projMatrix, this.viewMatrix, this._spherify, this.camera);
            this.quadtree.draw(this.wireFrame, this.frustum, this.quadtree.rootNode, this.ext, 4000, this.tileUrl, this._spherify, this.Wms, this.lastUpdateCall);
            this.quadtree.disableProgram();

        
        //BBOX
        if (this.showBBox) {
            this.quadtree.setBBoxProgram();
            this.quadtree.setBBoxMatrixUniforms(this.projMatrix, this.viewMatrix);
            this.quadtree.drawBBox(this.frustum, this.quadtree.rootNode, 3600);
            this.quadtree.disableProgram();
        }

        this.lastUpdateCall = requestAnimationFrame(function () {
            this.renderScene();
        }.bind(this));

        if (this._birdCamOn)
            this.frustum.drawFrustum(this.projMatrix, this.viewMatrix);

        this.camera.update();
    },
};






