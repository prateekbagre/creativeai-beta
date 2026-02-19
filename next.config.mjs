/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.replicate.delivery",
            },
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
            {
                protocol: "https",
                hostname: "cdn.yourcreativeai.com",
            },
            {
                protocol: "https",
                hostname: "replicate.delivery",
            },
            {
                protocol: "https",
                hostname: "**.replicate.com",
            }
        ],
    },
    // Suppress warnings during build if needed
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
