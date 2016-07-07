using System;
using System.Runtime.Caching;

namespace _3D1
{
    public class Cache
    {
        public static void Save(string key, object objectTocache, DateTime expiration)
        {
            MemoryCache.Default.Add(key, objectTocache, expiration);
        }

        public static T Get<T>(string key) where T : class
        {
            return MemoryCache.Default[key] as T;
        }
    }
}