using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Threading;


namespace _3D1
{
    public class AsynchOperation : IAsyncResult
    {
        private bool _completed;
        private readonly Object _state;
        private readonly AsyncCallback _callback;
        private readonly HttpContext _context;

        bool IAsyncResult.IsCompleted { get { return _completed; } }
        WaitHandle IAsyncResult.AsyncWaitHandle { get { return null; } }
        Object IAsyncResult.AsyncState { get { return _state; } }
        bool IAsyncResult.CompletedSynchronously { get { return false; } }

        public AsynchOperation(AsyncCallback callback, HttpContext context, Object state)
        {
            _callback = callback;
            _context = context;
            _state = state;
            _completed = false;
        }

        public void StartAsyncWork()
        {
            using (var client = new WebClient())
            {
                client.Proxy = null;

                var url = _context.Server.UrlDecode(_context.Request.QueryString["server"]);

                if (url != null && url.Contains("gisgraphy") )
                {
                   url = _context.Server.UrlDecode(_context.Request.RawUrl).Split(new[] { "server=" }, StringSplitOptions.None)[1];
                   url.Replace(" ", "%20");
                }

                if (url != null && url.Contains("osmbuildings"))
                {
                    url = _context.Server.UrlDecode(_context.Request.RawUrl).Split(new[] { "server=" }, StringSplitOptions.None)[1];
                }

                if (url != null && url.Contains("getmap"))
                {
                    url = _context.Server.UrlDecode(_context.Request.RawUrl).Split(new []{"server="}, StringSplitOptions.None)[1];
                }

                if (url != null && url.Contains("google"))
                {
                    var x1 = _context.Request.Params["x"];
                    var y1 = _context.Request.Params["y"];
                    var z1 = _context.Request.Params["z"];

                    url +="&x="+x1+"&y="+y1+"&z="+z1;
                }
                client.Encoding = Encoding.UTF8;
                client.DownloadDataCompleted += (o, e) =>
                {
                    _context.Response.Cache.SetExpires(DateTime.Now.AddYears(1));
                    _context.Response.Cache.SetCacheability(HttpCacheability.Public);
                    _context.Response.Cache.SetValidUntilExpires(false);

                    if (!e.Cancelled && e.Error == null)
                    {
                        if(url.Contains("gisgraphy") && !url.Contains("images"))
                            _context.Response.ContentType = "application/json";
                        else if (url.Contains("jpeg"))
                        {
                            _context.Response.ContentType = "image/jpeg";
                        }
                        else
                            _context.Response.ContentType = "image/png";

                        if(url.Contains("osmbuildings"))
                        {
                          _context.Response.ContentType = "application/json";
                        }
                        //Cache.Save(url,_context.Response,DateTime.Now.AddHours(1.0));
                        _context.Response.OutputStream.Write(e.Result, 0, e.Result.Length);
                    }
                    _completed = true;
                    _callback(this);
                    
                };
                client.Headers.Add("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; .NET CLR 1.0.3705;)");

                if (url != null)
                {
                    //var cachedobject = Cache.Get<string>(url);

                    
                    client.DownloadDataAsync(new Uri(url));
                }
            }
        }
    }

    public class Proxy : IHttpAsyncHandler
    {
        public IAsyncResult BeginProcessRequest(HttpContext context, AsyncCallback cb, object extraData)
        {
            
            var asynch = new AsynchOperation(cb, context, extraData);
           
            asynch.StartAsyncWork();
            
            return asynch;
        }

        public void EndProcessRequest(IAsyncResult result)
        {
           
        }

        
        public void ProcessRequest(HttpContext context)
        {
           
        }

        public bool IsReusable
        {
            get
            {
                return true;
            }
        }
    }
}