/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Lets you open the dev server from your phone on the same Wi-Fi (e.g. http://192.168.1.5:3000)
  allowedDevOrigins: ['127.0.0.1', '192.168.*.*', '10.*.*.*', '172.*.*.*'],
};

export default nextConfig;
