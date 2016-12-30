XMap = window.XMap || {};

 XMap.Mercator = function(initialRootSize)
{
    this.initialRootSize = initialRootSize;
};

XMap.Mercator.prototype =
{
    getLng: function (position)
    {
        return (position[0] + this.initialRootSize) / (this.initialRootSize * 2.0 / 360.0) - 180.0;
    },

    getLat: function (position)
    {
        return (2.0 * Math.atan(Math.exp(Math.PI * (1.0 - 2.0 * (position[2] + this.initialRootSize) / (this.initialRootSize * 2.0)))) - Math.PI / 2.0) * 180.0 / Math.PI;
    },

    getX : function(lng) {
        return (lng + 180) * (this.initialRootSize * 2.0) / 360.0 - this.initialRootSize;
    },

    getZ: function (lat) {
        var tmp = Math.tan(Math.PI * lat / 360.0 + Math.PI / 4.0);
        return -this.initialRootSize / Math.PI * Math.log(tmp);
    }
};