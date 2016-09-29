XMap.DOM =
{
    addEventListeners: function ()
    {
       var body = document.getElementsByTagName("body")[0];

       body.addEventListener("load", function ()
       {
            document.getElementById("menu").addEventListener("click", function() { XMap.DOM.Events.menuonclick(); }, false);
            document.getElementById("bing-tile").addEventListener("click", function() { XMap.Engine._engine.setTileUrl(XMap.Url.tileUrlBing); }, false);
            document.getElementById("sk-tile").addEventListener("click", function() { XMap.Engine._engine.setTileUrl(XMap.Url.tileUrlStatensKartverk); }, false);
            document.getElementById("thunderforest-tile").addEventListener("click", function() { XMap.Engine._engine.setTileUrl(XMap.Url.tileUrlthunderForest); }, false);
            document.getElementById("tileStammen-tile").addEventListener("click", function() { XMap.Engine._engine.tileUrl = XMap.Url.tileUrlStammen; }, false);
            document.getElementById("mapquest").addEventListener("click", function() { XMap.Engine._engine.tileUrl = XMap.Url.mapQuest; }, false);
            document.getElementById("google").addEventListener("click", function() { XMap.Engine._engine.tileUrl = XMap.Url.google; }, false);
            document.getElementById("Wms").addEventListener("click", function() { XMap.Engine._engine.Wms = true; }, false);

            document.getElementById("bbox").addEventListener("click", function() {
                if (document.getElementById("bbox").checked)
                    XMap.Engine._engine.showBBox = true;
                else
                    XMap.Engine._engine.showBBox = false;
            }, false);

            document.getElementById("spherify").addEventListener("click", function() {
                if (document.getElementById('spherify').checked) {
                    XMap.Engine._engine._spherify = true;
                } else
                    XMap.Engine._engine._spherify = false;

            }, false);

            document.getElementById("bird-cam").addEventListener("click", function() {
                if (document.getElementById('bird-cam').checked)
                    XMap.Engine._engine._birdCamOn = true;
                else
                    XMap.Engine._engine._birdCamOn = false;
            }, false);

            document.getElementById("mylocation").addEventListener("click", function() { XMap.Engine._engine._getUserPosition(); }, false);
            document.getElementById("zoomin").addEventListener("click", function() { XMap.Engine._engine._zoomIn(); }, false);
            document.getElementById("zoomout").addEventListener("click", function() { XMap.Engine._engine._zoomOut(); }, false);
            document.getElementById("lookdown").addEventListener("click", function() { XMap.Engine._engine.camera.lookDown(); }, false);
            document.getElementById("lookup").addEventListener("click", function () { XMap.Engine._engine.camera.lookUp(); }, false);

        }, false);
    }
}


XMap.DOM.Events =
{
    _toggleOn: true,

    menuonclick: function() {
        if (this._toggleOn) {
            document.getElementById("floating-div").style.transform = "translate(0px)";
            this._toggleOn = false;
        } else {
            document.getElementById("floating-div").style.transform = "translate(-440px)";
            this._toggleOn = true;
        }
    }
};