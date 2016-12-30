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
        
        request.onload = request.onreadystatechange = function() {
            if (request.readyState == 4)
            {
                if (request.status == 200) {

                    callback(request.responseText);
                }
            }
        };

        request.open('GET', this.searchUrl, true);
        request.send();
    }
};