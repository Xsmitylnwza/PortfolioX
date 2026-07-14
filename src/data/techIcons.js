export const TECH_ICON_MAP = {
  React: 'simple-icons:react',
  'Next.js': 'simple-icons:nextdotjs',
  'Vue.js': 'simple-icons:vuedotjs',
  Vite: 'simple-icons:vite',
  'React Query': 'simple-icons:reactquery',
  MUI: 'simple-icons:mui',
  Tailwind: 'simple-icons:tailwindcss',
  'Framer Motion': 'simple-icons:framer',
  JavaScript: 'simple-icons:javascript',
  'CSS Animation': 'mdi:css',
  Java: 'cib:java',
  Spring: 'simple-icons:springboot',
  'Spring Boot': 'simple-icons:springboot',
  'Node.js': 'simple-icons:nodedotjs',
  'Elysia.js': 'skill-icons:elysia-light',
  Go: 'simple-icons:go',
  WebSocket: 'mdi:lan-connect',
  SQL: 'simple-icons:mysql',
  MySQL: 'simple-icons:mysql',
  PostgreSQL: 'simple-icons:postgresql',
  MongoDB: 'simple-icons:mongodb',
  Supabase: 'simple-icons:supabase',
  'AWS S3': 'simple-icons:amazons3',
  AWS: 'simple-icons:amazonwebservices',
  Docker: 'simple-icons:docker',
  Jenkins: 'simple-icons:jenkins',
  'GitLab CI': 'simple-icons:gitlab',
  Nginx: 'simple-icons:nginx',
  'AWS EC2': 'simple-icons:amazonec2',
  Omise: 'mdi:credit-card-outline',
  Authentication: 'mdi:shield-key-outline',
  'Google OAuth': 'simple-icons:google',
  'Product Flows': 'lucide:workflow',
  'Workflow Design': 'lucide:git-branch',
  Delivery: 'lucide:rocket',
  'API Integration': 'lucide:plug-zap',
  Prototyping: 'lucide:flask-conical',
};

const FALLBACK_ICON = 'mdi:code-tags';

/**
 * Normalize freeform labels or { label, icon } items into renderable stack tools.
 * @param {Array<string | { label: string, icon?: string }>} items
 */
export function resolveTechItems(items = []) {
  return items
    .map((item) => {
      if (!item) return null;

      if (typeof item === 'string') {
        const label = item.trim();
        if (!label) return null;
        return {
          label,
          icon: TECH_ICON_MAP[label] || FALLBACK_ICON,
        };
      }

      const label = String(item.label || '').trim();
      if (!label) return null;

      return {
        label,
        icon: item.icon || TECH_ICON_MAP[label] || FALLBACK_ICON,
      };
    })
    .filter(Boolean);
}
