/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { images: { layoutRaw: true } },
  webpack(config) {
    config.plugins.push(
      require("unplugin-icons/webpack")({
        compiler: "jsx",
        jsx: "react",
      })
    );

    return config;
  },
};

module.exports = nextConfig;
