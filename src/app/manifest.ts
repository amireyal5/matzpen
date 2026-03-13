
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'המצפן הרגשי 🧭',
    short_name: 'מצפן רגשי',
    description: 'ארגז הכלים לחוסן ושקט נפשי',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#6366F1',
    icons: [
      {
        src: 'https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
    ],
  }
}
