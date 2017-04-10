XMap.Geocoding = function(url)
{
    this.urlPrefix = url;
    this.searchUrl = '';
};

XMap.Geocoding.prototype =
{
    constructSearchUrl : function(searchPhrase, placeType, country) 
    {
        this.searchUrl =  this.urlPrefix + searchPhrase;
    },

    sendRequest: function (callback)
    {
        var request = new XMLHttpRequest();
        request.open('GET', this.searchUrl, true);

        var loadHandler = function()
        {
             if (request.readyState == 4)
            {
                if (request.status == 200) {
                    callback(request.responseText);
                }
            }
        };

        request.addEventListener("load", loadHandler, false);
        request.send();
    }
};