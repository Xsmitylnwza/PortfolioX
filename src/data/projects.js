export const projects = [
  {
    id: 'keshi-pomodoro',
    title: 'Keshi Pomodoro',
    category: 'PRODUCTIVITY • JAN 2026',
    year: '2026',
    description: 'A lo-fi aesthetic focus timer inspired by Keshi\'s musical vibe.',
    fullDescription: 'An immersive Pomodoro timer that blends productivity with atmosphere. Features include customizable timer settings, a curated lo-fi playlist, and a visual design heavily inspired by Keshi\'s \'Gabriel\' album era. Built to help users stay focused while enjoying a chill, artistic environment.',
    tags: ['React', 'Vite', 'Tailwind', 'Framer Motion'],
    image: '/assets/keshi-pomodoro/demo.webp',
    link: 'https://keshi-pomodoro.vercel.app/',
    code: `// Timer Loop Logic
useEffect(() => {
  let interval = null;
  if (isActive && time > 0) {
    interval = setInterval(() => {
      setTime((time) => time - 1);
    }, 1000);
  } else if (time === 0) {
    clearInterval(interval);
    playAlarm();
  }
  return () => clearInterval(interval);
}, [isActive, time]);`,
    gallery: [
      '/assets/keshi-pomodoro/focus_mode.png',
      '/assets/keshi-pomodoro/relax_mode.png'
    ],
    role: 'Frontend Developer'
  },
  {
    id: 'nurse-nest',
    title: 'Nurse-nest',
    category: 'HEALTHCARE • APR 2025',
    year: '2025',
    description: 'A comprehensive healthcare booking platform connecting patients with nurses.',
    fullDescription: 'Nurse-nest streamlines the process of finding and booking nursing care. It features real-time scheduling, secure payments via Omise, and a robust admin dashboard for managing appointments and nurse profiles. The system is built for reliability and scale.',
    tags: ['Next.js', 'Spring Boot', 'Omise', 'Jenkins', 'Docker'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2000',
    link: '#',
    code: `// Payment Processing Service
@Service
public class PaymentService {
    public Charge createCharge(long amount, String token) {
        return omise.charges().create(new Charge.Create()
            .amount(amount)
            .currency("thb")
            .card(token));
    }
}`,
    gallery: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2000',
      'https://images.unsplash.com/photo-1516549655169-df83a0faaf50?auto=format&fit=crop&q=80&w=2000'
    ],
    role: 'Full Stack Developer'
  },
  {
    id: 'kanban-board',
    title: 'Kanban Task Manager',
    category: 'PRODUCTIVITY • DEC 2024',
    year: '2024',
    description: 'A drag-and-drop task management system inspired by Trello.',
    fullDescription: 'A highly interactive task management tool featuring drag-and-drop capabilities, task categorization, and file attachments. The backend leverages Spring Boot and AWS S3 for secure file storage, deployed via Docker for consistency.',
    tags: ['Vue.js', 'Spring Boot', 'Docker', 'AWS S3', 'MySQL'],
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=2000',
    link: '#',
    code: `// Task Movement Logic
public Task moveTask(Long taskId, Long newColumnId) {
    Task task = taskRepository.findById(taskId).orElseThrow();
    Column column = columnRepository.findById(newColumnId).orElseThrow();
    task.setColumn(column);
    return taskRepository.save(task);
}`,
    gallery: [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=2000',
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2000'
    ],
    role: 'Full Stack Developer'
  },
  {
    id: 'zucchini-review',
    title: 'Zucchini Review',
    category: 'ENTERTAINMENT • OCT 2024',
    year: '2024',
    description: 'A film review aggregation platform inspired by Rotten Tomatoes.',
    fullDescription: 'Zucchini Review is a comprehensive movie review platform where users can browse categories, search for films, and read or write reviews. Features include a weighted scoring system (Zucchinitor), user authentication with profile management, and a dynamic comment section for community engagement.',
    tags: ['React', 'Node.js', 'MongoDB', 'Authentication'],
    image: '/assets/zuchini-review/homepage.gif',
    link: 'https://www.youtube.com/watch?v=TIypQWv4l-k', // Using demo video as link for now based on context, or null if no live demo
    repo: 'https://github.com/Xsmitylnwza/PROJECT2-SEC-2-WeLoveReact',
    code: `// Review Calculation Logic
const calculateScore = (reviews) => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  return (total / reviews.length).toFixed(1);
};`,
    gallery: [
      '/assets/zuchini-review/review.gif',
      '/assets/zuchini-review/commented.gif',
      '/assets/zuchini-review/register.gif'
    ],
    role: 'Frontend Developer'
  },
  {
    id: 'decrypt-password',
    title: 'Decrypt The Secret Password',
    category: 'GAME • FEB 2024',
    year: '2024',
    description: 'A web-based puzzle game challenging players to decrypt passwords under time pressure.',
    fullDescription: 'Inspired by "The Password Game", this project challenges users to create a password that satisfies increasingly complex and creative rules within a time limit. Features include difficulty levels (Hard to Hardest), dynamic rule validation, a countdown timer, and game-state animations.',
    tags: ['React', 'JavaScript', 'CSS Animation'],
    image: '/assets/decrypt-secret-pwd/gameplay.gif',
    link: 'https://xsmitylnwza.github.io/PROJECT1-SEC-2-WeLoveReact/', // Assuming GitHub Pages or similar if repo exists, otherwise null
    repo: 'https://github.com/Xsmitylnwza/PROJECT1-SEC-2-WeLoveReact',
    code: `// Rule Validation Logic
const validateRule = (password, rule) => {
  if (rule.type === 'regex') {
    return rule.regex.test(password);
  }
  if (rule.type === 'function') {
    return rule.validate(password);
  }
  return false;
};`,
    gallery: [
      '/assets/decrypt-secret-pwd/manual.gif',
      '/assets/decrypt-secret-pwd/select-mode.gif'
    ],
    role: 'Frontend Developer'
  },
  {
    id: 'wild-oasis',
    title: 'The Wild Oasis',
    category: 'HOSPITALITY • 2024',
    year: '2024',
    description: 'A hotel booking system for customers and staff with realtime updates.',
    fullDescription: 'The Wild Oasis manages hotel operations including check-ins, cabin management, and guest data. It provides a seamless experience for both staff and customers, utilizing Supabase for realtime data synchronization and Google OAuth for secure authentication.',
    tags: ['Next.js', 'Supabase', 'Google OAuth', 'Tailwind'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000',
    link: '#',
    code: `// Realtime Subscription
supabase
  .channel('public:bookings')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
    console.log('Change received!', payload)
  })
  .subscribe()`,
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=2000'
    ],
    role: 'Full Stack Developer'
  }
];
