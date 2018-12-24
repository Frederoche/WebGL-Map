XMap.Wms = function(initialTileSize) {
    this.url = '';
    this.mercator = new XMap.Mercator(initialTileSize);
};

XMap.Wms.prototype =
{
    prepareRequest: function (node) {
        var max = vec3.create();
        var min = vec3.create();

        vec3.add(node.center, vec3.create([node.scaleFactor, 0, node.scaleFactor]), max);
        vec3.add(node.center, vec3.create([-node.scaleFactor, 0, -node.scaleFactor]), min);
        
        var maxLng = this.mercator.getLng(max);
        var maxLat = this.mercator.getLat(max);

        var minLng = this.mercator.getLng(min);
        var minLat = this.mercator.getLat(min);

        if (maxLng < minLng) {
            var tempLng = minLng;
            minLng = maxLng;
            maxLng = tempLng;
        }

        if (maxLat < minLat) {
            var tempLat = minLat;
            minLat = maxLat;
            maxLat = tempLat;
        }

        this.url = 'http://localhost:8000/image?server=http://www.webatlas.no/wms-orto/?request=getmap&layers=hoyderaster&srs=epsg:4326&format=image/png&width=256&height=128&bbox=' + minLng + ',' + minLat + ',' + maxLng + ',' + maxLat + '&styles=pack_rgb_-25000-25000';
    }
};