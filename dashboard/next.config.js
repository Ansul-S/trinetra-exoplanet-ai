/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TRINETRA_API_URL: process.env.TRINETRA_API_URL || 'https://ansul-s-trinetra-api.hf.space',
  },
}

module.exports = nextConfig
