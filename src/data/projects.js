export const projects = [
    {
        id: 1,
        category: 'E-COMMERCE • 2023',
        title: 'Neon District',
        description: 'A high-performance streetwear store built with Next.js and Shopify headless architecture.',
        fullDescription: 'Neon District is a conceptual streetwear brand that merges cybernetic aesthetics with high-fashion retail. The goal was to build a storefront that feels like entering a futuristic city district. Leveraging Shopify\u2019s headless API, we created a custom shopping experience with real-time inventory checks, 3D product previews, and a seamless checkout flow.',
        image: 'https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838992467-a303f153/200__Couples_Posing_Prompts_for_Photographers.jpg',
        tags: ['Next.js', 'Tailwind', 'Shopify Storefront API', 'Framer Motion'],
        link: '#',
        code: `const Shop = () => {
  const { products } = useShopify();
  return (
    <div className="grid">
      {products.map(p => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  );
};`,
        gallery: [
            'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2064&auto=format&fit=crop'
        ],
        year: '2023',
        role: 'Lead Frontend Developer'
    },
    {
        id: 2,
        category: 'WEB APP • 2022',
        title: 'Audio Scape',
        description: 'Collaborative music visualization tool using WebAudio API and Canvas.',
        fullDescription: 'Audio Scape is an experiment in synesthesia. It allows users to upload tracks and see them visualized in a 3D WebGL environment. The application analyzes frequency data in real-time to deform geometries and shift colors, creating a unique visual fingerprint for every song.',
        image: 'https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838927255-8dfc650a/f25d6e80f442ce4dc10c171831b1fc76.jpg',
        tags: ['React', 'WebGL', 'Three.js', 'WebAudio API'],
        link: '#',
        code: `const Visualizer = ({ audio }) => {
  useFrame(() => {
    const data = audio.getFrequencyData();
    mesh.current.scale.y = data[0] / 10;
    mesh.current.material.color.setHSL(data[0]/255, 0.5, 0.5);
  });
  return <mesh ref={mesh} />
};`,
        gallery: [
            'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=2070&auto=format&fit=crop'
        ],
        year: '2022',
        role: 'Creative Developer'
    },
    {
        id: 3,
        category: 'DASHBOARD • 2022',
        title: 'Analytics Hub',
        description: 'Real-time data visualization platform with interactive charts and custom reporting.',
        fullDescription: 'Built for a fintech startup, Analytics Hub processes millions of data points into digestible, interactive charts. We focused heavily on performance optimization, using virtualized lists and canvas rendering for large datasets to ensure 60fps scrolling even with heavy loads.',
        image: '/analytics-hub.jpg',
        tags: ['Vue.js', 'D3.js', 'Node.js', 'Socket.io'],
        link: '#',
        code: `d3.select(svgRef.current)
  .selectAll('rect')
  .data(data)
  .join('rect')
  .attr('x', (d, i) => i * 40)
  .attr('height', d => yScale(d.value))
  .attr('fill', 'steelblue');`,
        gallery: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop'
        ],
        year: '2022',
        role: 'Full Stack Developer'
    },
];
