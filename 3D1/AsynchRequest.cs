using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;

namespace _3D1
{
    public class AsynchRequest
    {
        public static async Task<Stream> DoRequest(string url)
        {
            HttpWebRequest req = (HttpWebRequest) WebRequest.Create(url);
            //var response = (HttpWebResponse)await System.Threading.Tasks.Task.Factory.FromAsync(req.BeginGetResponse, req.EndGetResponse, null);
            return null;
            //return response.GetResponseStream();
        }
    }
}