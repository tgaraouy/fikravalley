/**
 * Founder's Journey Menu
 * 
 * Based on PROJECT_MASTER_INSTRUCTIONS.md
 * Navigation structure following the founder's journey
 */

export interface FounderJourneyMenuItem {
  icon: string;
  title: string;
  href: string;
  description: string;
}

export const FOUNDER_JOURNEY_MENU: FounderJourneyMenuItem[] = [
  {
    icon: '🔥',
    title: 'Roast My Idea',
    href: '/validator',
    description: 'Stress test your idea with our 7-agent council',
  },
  {
    icon: '🛠️',
    title: 'Build The MVP',
    href: '/services',
    description: 'Turn your idea into a working prototype',
  },
  {
    icon: '🤝',
    title: 'The Co-Founders',
    href: '/about',
    description: 'Meet the Agents + Humans behind Fikra Valley',
  },
  {
    icon: '🧠',
    title: 'The Library',
    href: '/resources',
    description: 'Resources, guides, and knowledge base',
  },
  {
    icon: '🇲🇦',
    title: 'Moroccan Gap',
    href: '/market-data',
    description: 'Market insights and opportunities in Morocco',
  },
];
