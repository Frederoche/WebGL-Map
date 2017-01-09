XMap.Proxy= {
    proxyUrl: 'http://localhost:8000/image?server=' 
}

XMap.Url =
{
    apiOrto: 'http://localhost:8000/Image/GetOrtoFoto?',
    apiElevation: 'http://localhost:8000/Image/GetOrtoFoto?',
    tileUrlBing: { pre: XMap.Proxy.proxyUrl + "http://t0.tiles.virtualearth.net/tiles/a", su: ".jpeg?g=854&mkt=en-US&token=Anz84uRE1RULeLwuJ0qKu5amcu5rugRXy1vKc27wUaKVyIv1SVZrUjqaOfXJJoI0", tile: false },
    tileUrlStatensKartverk: { pre: XMap.Proxy.proxyUrl + "http://www.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/", su: ".jpeg", tile: true },
    tileUrlthunderForest: { pre:XMap.Proxy.proxyUrl + "http://tile.thunderforest.com/cycle/", su: ".png", tile: true },
    tileUrlStammen: { pre: XMap.Proxy.proxyUrl + "http://tile.stamen.com/watercolor/", su: ".png", tile: true },
    mapQuest: { pre: XMap.Proxy.proxyUrl + "http://otile4.mqcdn.com/tiles/1.0.0/sat/", su: ".png", tile: true },
    google: { pre: XMap.Proxy.proxyUrl + "http://mt1.google.com/vt/lyrs=y", su: "", tile: true },
    elevationUrl: { pre: XMap.Proxy.proxyUrl + "http://webutvikling.gisline.no/Elevation/", su: ".png", tile: true, special: true },
    weather: { pre: XMap.Proxy.proxyUrl + "http://2.tile.openweathermap.org/map/precipitation/", su: ".png", tile: true },
    geocoding : 'http://api.opencagedata.com/geocode/v1/json?pretty=1&key=2532638cbbd3c34fe376ccdfd6a9bc6c&query='
};

XMap.Canvas = {
    _canvas: {},

    create: function() 
    {
        this._canvas = document.createElement("canvas");
        this._canvas.id = "canvasId";

        var mouseWheel = function (e) 
        {
            if (XMap.Engine._engine.lastUpdateCall)
                cancelAnimationFrame(XMap.Engine._engine.lastUpdateCall);
            
            var delta = e.wheelDelta ? e.wheelDelta : -e.detail;

            if (delta > 0) {
                XMap.Engine._engine.camera._zoomIn();
                XMap.Engine._engine.birdCamera._zoomIn();
            } else {
                XMap.Engine._engine.camera._zoomOut();
                XMap.Engine._engine.birdCamera._zoomOut();
            }

            XMap.Engine._engine.lastUpdateCall = requestAnimationFrame(function () {
                XMap.Engine._engine.renderScene();

            });
        };


        var mouseDown = function(e) {
            XMap.DOM.Events.mousemove = true;
             document.getElementById("autocomplete").style.display = 'none';
            XMap.DOM.Events.lastMouseX = e.clientX;
            XMap.DOM.Events.lastMouseY = e.clientY;
        };

        this._canvas.addEventListener('mousewheel', mouseWheel, false);
        this._canvas.addEventListener('DOMMouseScroll', mouseWheel, false);
        this._canvas.addEventListener('mousedown', mouseDown, false);

        document.getElementsByTagName('body')[0].appendChild(this._canvas);
        return this._canvas;
    }
};

XMap.Search =
{
    geocoding : new XMap.Geocoding(XMap.Url.geocoding)
}

XMap.Engine =
{
    _engine: {},
    
    create: function () {
        

        var canvas = XMap.Canvas.create();

        var engineOptions = {
            'canvas':canvas,
            'tileUrl':XMap.Url.tileUrlBing,
            'elevationUrl':XMap.Url.elevationUrl,
             initialRootSize : 512
        };

        this._engine = new XMap.ThreeDEngine(engineOptions);
        this._engine.init();
        this._engine.tileUrl = XMap.Url.tileUrlStatensKartverk;
    },

    render : function() {
        this._engine.renderScene();

    }
};

XMap.DOM = {}; 

XMap.DOM.Events =
{
    _toggleOn: true,
    lastMouseX : 0,
    lastMouseY : 0,
    mousemove : false,

    _displayPosition: function ()
    {
        document.getElementById('positionx').innerHTML = XMap.Engine._engine.camera.position[0].toFixed(2);
        document.getElementById('positiony').innerHTML = XMap.Engine._engine.camera.position[1].toFixed(2);
        document.getElementById('positionz').innerHTML = XMap.Engine._engine.camera.position[2].toFixed(2);

        document.getElementById('position-lat').innerHTML = XMap.Engine._engine.camera.getLat().toFixed(4);
        document.getElementById('position-lng').innerHTML = XMap.Engine._engine.camera.getLng().toFixed(4);

        document.getElementById('fps').innerHTML = XMap.Engine._engine._computeFps();

        if (document.getElementById('wireframe').checked)
            XMap.Engine._engine.wireFrame = device.LINES;
        else
            XMap.Engine._engine.wireFrame = device.TRIANGLES;

         
        if (document.getElementById('bird-cam').checked)
            XMap.Engine._engine._birdCamOn = true;
        else
            XMap.Engine._engine._birdCamOn = false;
            
    },

    register: function()
    {
        document.getElementById("menu").addEventListener("click", function () { XMap.DOM.Events.menuonclick(); }, false);
        document.getElementById("bing-tile").addEventListener("click", function () { XMap.Engine._engine.setTileUrl(XMap.Url.tileUrlBing); }, false);
        document.getElementById("sk-tile").addEventListener("click", function () { XMap.Engine._engine.setTileUrl(XMap.Url.tileUrlStatensKartverk); }, false);
        document.getElementById("thunderforest-tile").addEventListener("click", function () { XMap.Engine._engine.setTileUrl(XMap.Url.tileUrlthunderForest); }, false);
        document.getElementById("tileStammen-tile").addEventListener("click", function () { XMap.Engine._engine.tileUrl = XMap.Url.tileUrlStammen; }, false);
        document.getElementById("mapquest").addEventListener("click", function () { XMap.Engine._engine.tileUrl = XMap.Url.mapQuest; }, false);
        document.getElementById("google").addEventListener("click", function () { XMap.Engine._engine.tileUrl = XMap.Url.google; }, false);
        document.getElementById("Wms").addEventListener("click", function () { XMap.Engine._engine.Wms = true; }, false);

        document.getElementById("bbox").addEventListener("click", function () {
        if (document.getElementById("bbox").checked)
            XMap.Engine._engine.showBBox = true;
        else
            XMap.Engine._engine.showBBox = false;
        }, false);

        document.getElementById("spherify").addEventListener("click", function() {
            if (document.getElementById('spherify').checked) {
                XMap.Engine._engine._spherify = true;
            } else
                XMap.Engine._engineine._spherify = false;

        }, false);

        document.getElementById("bird-cam").addEventListener("click", function() {
            if (document.getElementById('bird-cam').checked)
                XMap.Engine._engine._birdCamOn = true;
            else
                XMap.Engine._engine._birdCamOn = false;
        }, false);
    

        document.getElementById("mylocation").addEventListener("click", function () { XMap.Engine._engine._getUserPosition(); }, false);
        document.getElementById("zoomin").addEventListener("click", function () { XMap.Engine._engine.camera._zoomIn(); XMap.Engine._engine.birdCamera._zoomIn();}, false);
        document.getElementById("zoomout").addEventListener("click", function () { XMap.Engine._engine.camera._zoomOut(); XMap.Engine._engine.birdCamera._zoomOut();}, false);
        document.getElementById("lookdown").addEventListener("click", function () { XMap.Engine._engine.camera.lookDown(); }, false);
        document.getElementById("lookup").addEventListener("click", function () { XMap.Engine._engine.camera.lookUp(); }, false);
        
        document.addEventListener("mouseup", function(){
            XMap.DOM.Events.mousemove = false;
        });

        document.addEventListener("mousemove", function (e)
        {
            var localPositionX = 2.0 * e.clientX / XMap.Canvas._canvas.width - 1.0;
            var localPositionY = -2.0 * e.clientY / XMap.Canvas._canvas.height + 1.0;
            var localPositionZ = -1.0;

            var point3D = [localPositionX, localPositionY, localPositionZ, 1.0];

            var invViewMatrix = mat4.create();
            var invProjMatrix = mat4.create();

            mat4.inverse(XMap.Engine._engine.projMatrix, invProjMatrix);
            mat4.inverse(XMap.Engine._engine.viewMatrix, invViewMatrix);

            mat4.multiplyVec4(invProjMatrix, point3D);
            mat4.multiplyVec4(invViewMatrix, point3D);

            if (!XMap.DOM.Events.mousemove)
                return;

            var newX = e.clientX;
            var newY = e.clientY;

            var dX = newX - XMap.DOM.Events.lastMouseX;
            var dY = newY - XMap.DOM.Events.lastMouseY;

            var translation = vec3.create([-dX * XMap.Engine._engine.camera.position[1] / 1000.0, 0, -dY * XMap.Engine._engine.camera.position[1] / 1000.0]);

            vec3.add(XMap.Engine._engine.camera.lookAt, translation, XMap.Engine._engine.camera.lookAt);
            vec3.add(XMap.Engine._engine.camera.position, translation, XMap.Engine._engine.camera.position);

            XMap.DOM.Events.lastMouseX = newX;
            XMap.DOM.Events.lastMouseY = newY;

            if (XMap.Engine._engine.lastUpdateCall)
                cancelAnimationFrame(XMap.Engine._engine.lastUpdateCall);
            
            XMap.Engine._engine.lastUpdateCall = requestAnimationFrame(function() {
                XMap.Engine._engine.renderScene();
            });
        });
        

        document.getElementById("coordinate").addEventListener("keyup", function (e) {
            
            document.getElementById("floating-div").style.transform = "translate(-440px)";
            this._toggleOn = true;

            document.getElementById("autocomplete").style.display = 'block';

            var searchString = document.getElementById("coordinate").value;

            if (searchString === "")
                return;

           XMap.Search.geocoding.constructSearchUrl(searchString, '', '');

            var jObj = {};
 
            var autocomplete = document.getElementById('autocomplete');

            while (autocomplete.firstChild)
            {
                autocomplete.removeChild(autocomplete.firstChild);
            }

            XMap.Search.geocoding.sendRequest(function (resp) {

                if (resp !== '') {
                    jObj = JSON.parse(resp);
                    XMap.DOM.Events._generateAutocomplete(jObj);
                }
            });

        });

        window.addEventListener("resize", function(){
            var displayWidth  = window.innerWidth;
            var displayHeight = window.innerHeight;


            if (XMap.Canvas._canvas.width !== displayWidth ||
                XMap.Canvas._canvas.height !== displayHeight) {


                XMap.Canvas._canvas.width  = displayWidth;
                XMap.Canvas._canvas.height = displayHeight;
                

                window.device.viewport(0, 0, XMap.Canvas._canvas.width, XMap.Canvas._canvas.height);
            }

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

            
            listElement.addEventListener("click", function ()
            {
                if (XMap.Engine._engine.lastUpdateCall)
                    cancelAnimationFrame(XMap.Engine._engine.lastUpdateCall);

                var li = document.getElementById(this.id);
                var mercator = new XMap.Mercator(XMap.Engine._engine.initialRootSize);

                var x = mercator.getX(li.lng);
                var z = mercator.getZ(li.lat);

                XMap.Engine._engine.camera.position = vec3.create([x, 0.05, z]);
                XMap.Engine._engine.camera.lookAt = vec3.create([x, -1.05, z]);
                XMap.Engine._engine.camera.pitch =   Math.PI;
                XMap.Engine._engine.camera.update();

                document.getElementById("coordinate").value = li.cityName;
                document.getElementById('autocomplete').innerHTML = '';

                XMap.Engine._engine.lastUpdateCall = requestAnimationFrame(function() {
                XMap.Engine._engine.renderScene();
                
            });

            });

            document.getElementById('autocomplete').appendChild(listElement);
            
        }
    },

    menuonclick: function() {
        if (this._toggleOn) {
            document.getElementById("floating-div").style.transform = "translate(10px)";
            this._toggleOn = false;
        } else {
            document.getElementById("floating-div").style.transform = "translate(-440px)";
            this._toggleOn = true;
        }
    }

    
};


window.addEventListener("load", function() { XMap.Engine.create(); XMap.Engine.render(); XMap.DOM.Events.register()}, false);
   
