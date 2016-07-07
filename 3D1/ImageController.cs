using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace _3D1
{
    public class ImageController : ApiController
    {
        [HttpGet]
        public async Task<HttpResponseMessage> GetOrtoFoto(string url)
        {
            var result = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                var stream = await AsynchRequest.DoRequest(url);
                var image = Image.FromStream(stream);

                MemoryStream memoryStream = new MemoryStream();
                image.Save(memoryStream, ImageFormat.Jpeg);
                result.Content = new ByteArrayContent(memoryStream.ToArray());
                result.Content.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                return result;
            }
            catch (Exception)
            {
                return result;
            }
        }

        [HttpGet]
        public async Task<HttpResponseMessage> GetElevation(string url)
        {
            var result = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                var stream = await AsynchRequest.DoRequest(url);
                var image = Image.FromStream(stream);

                MemoryStream memoryStream = new MemoryStream();
                image.Save(memoryStream, ImageFormat.Jpeg);
                result.Content = new ByteArrayContent(memoryStream.ToArray());
                result.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
                return result;
            }
            catch (Exception)
            {
                return result;
            }
        }

        [HttpGet]
        public async Task<HttpResponseMessage> GetGeocode(string url)
        {
                var result = new HttpResponseMessage(HttpStatusCode.OK);
           
                var stream = await AsynchRequest.DoRequest(url);
                StreamReader strReader = new StreamReader(stream);
                string text = await strReader.ReadToEndAsync();

                result.Content = new StringContent(text);
                result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                return result;
           
        }

    }
}