XMap = window.XMap || {};

XMap.Proxy= {
    proxyUrl: 'http://localhost:8000/image?server=' //'http://localhost:8000/image?server='
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
    weather: { pre: XMap.Proxy.proxyUrl + "http://2.tile.openweathermap.org/map/precipitation/", su: ".png", tile: true }
};

XMap.Canvas = {
    _canvas: {},

    create: function() {
        this._canvas = document.createElement("canvas");
        this._canvas.id = "canvasId";
        document.getElementsByTagName('body')[0].appendChild(this._canvas);
        return this._canvas;
    }
};

XMap.Engine =
{
    _engine: {},
    
    create: function () {
        var canvas = XMap.Canvas.create();

        this._engine = new ThreeDEngine(canvas, XMap.Url.tileUrlBing, XMap.Url.elevationUrl, 512);
        this._engine.init();
        this._engine.tileUrl = XMap.Url.tileUrlBing;
    },

    render : function() {
        this._engine.renderScene();

    }
};