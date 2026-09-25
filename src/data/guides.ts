export interface Guide {
  id: string
  slug: string
  title: string
  subtitle: string
  category: 'Hardware' | 'GPU' | 'CPU' | 'Peripherals' | 'Tips'
  author: string
  date: string
  readTime: string
  image: string
  summary: string
  content: string[]
  tags: string[]
}

export const GUIDES: Guide[] = [
  {
    id: 'guide-gpu-buying-2026',
    slug: 'gpu-buying-guide-morocco',
    title: 'How to Choose the Right GPU for Your Gaming Rig in Morocco',
    subtitle: 'Nvidia RTX 50 Series vs RTX 40 Series & AMD Radeon: Performance, Budget & Thermal Benchmarks',
    category: 'GPU',
    author: 'ElectroGega Tech Lab',
    date: 'Sept 24, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
    summary: 'A complete breakdown of choosing graphics cards based on 1080p, 1440p, and 4K resolution targets, power supply headroom, and local Moroccan climate cooling considerations.',
    content: [
      'Choosing the right graphics card (GPU) is the single most critical decision when building or upgrading a PC gamer tower in Morocco. With high ambient summer temperatures and varying power delivery, selecting a GPU requires matching VRAM, architecture, and cooling efficiency.',
      'For 1080p Competitive Gaming (144Hz - 240Hz): Cards like the Nvidia RTX 4060 or AMD RX 7600 offer incredible efficiency. They run cool with modest 450W-550W power supplies.',
      'For 1440p Sweet Spot Gaming: The RTX 4070 Super and RTX 4070 Ti Super lead the pack with 12GB+ VRAM, DLSS 3.5 Frame Generation, and exceptional ray tracing capabilities.',
      'For 4K Ultra & Heavy Workloads: The RTX 4090 and RTX 50 series tier provide raw power for 4K high refresh rate gaming and intensive 3D rendering in Blender or Premiere Pro.'
    ],
    tags: ['GPU', 'Nvidia', 'RTX', 'Gaming PC', 'Hardware']
  },
  {
    id: 'guide-pc-building-mistakes',
    slug: '5-common-pc-building-mistakes',
    title: '5 Crucial Mistakes to Avoid When Building Your Custom PC',
    subtitle: 'From RAM Dual-Channel Slotting to Thermal Paste & Airflow Pressure',
    category: 'Hardware',
    author: 'ElectroGega Engineering',
    date: 'Sept 20, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
    summary: 'Prevent costly hardware damage by following these core rules: RAM channel positioning, motherboard standoff placement, and CPU cooler plastic peel check.',
    content: [
      'Building your own custom gaming PC is rewarding, but simple oversights can cause stability issues or hardware damage. Here are the top 5 mistakes to watch out for during assembly:',
      '1. Forgetting the CPU Cooler Plastic Film: Always remove the transparent protective sticker on the copper base of your AIO liquid cooler or air heatsink before mounting.',
      '2. Installing RAM in Single Channel Mode: If using 2 RAM sticks on a 4-slot motherboard, install them in slots 2 and 4 (A2 and B2) to enable dual-channel bandwidth.',
      '3. Inadequate Power Supply (PSU) Headroom: Always choose a reliable 80+ Gold rated PSU with at least 20% headroom over your total system power draw.',
      '4. Improper Fan Airflow Direction: Ensure front fans draw cool air into the case (intake) while rear and top fans push hot air out (exhaust).'
    ],
    tags: ['PC Builder', 'Hardware', 'Tutorial', 'Tips']
  },
  {
    id: 'guide-laptop-vs-desktop',
    slug: 'gaming-laptop-vs-desktop-tower',
    title: 'Gaming Laptop vs Desktop Tower: Which Should You Buy?',
    subtitle: 'Portability vs Upgradeability & Thermal Sustained Performance',
    category: 'Tips',
    author: 'ElectroGega Editorial',
    date: 'Sept 15, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    summary: 'An honest comparison between high-end gaming laptops (ASUS ROG, MSI, Lenovo Legion) and desktop rigs for students, creators, and hardcore gamers in Morocco.',
    content: [
      'Deciding between a portable gaming laptop and a custom desktop tower comes down to mobility versus raw upgradability and thermal headroom.',
      'Why Choose a Gaming Laptop? If you travel frequently, attend university, or need a compact setup, modern laptops like the ASUS ROG Strix or Lenovo Legion offer desktop-class performance in a portable chassis.',
      'Why Choose a Custom Desktop Tower? Desktops offer superior thermal cooling, quiet fan profiles under load, and modular upgradability. You can swap GPUs, CPUs, and storage over the years without buying a full new machine.'
    ],
    tags: ['Laptops', 'Gaming PC', 'Comparison', 'Guide']
  }
]
