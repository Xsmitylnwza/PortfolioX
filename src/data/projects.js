export const projects = [
  {
    id: 'nurse-nest',
    title: 'Nurse-nest',
    category: 'HEALTHCARE • 2024',
    year: '2024',
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
    category: 'PRODUCTIVITY • 2024',
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
