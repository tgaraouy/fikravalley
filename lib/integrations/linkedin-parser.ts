/**
 * LinkedIn Profile Parser
 * 
 * Parses LinkedIn profile data and maps it to mentor schema
 */

import { LinkedInProfile } from './linkedin-oauth';

export interface ParsedMentorProfile {
  name: string;
  email: string; // Will be fetched separately
  linkedin_url: string;
  currentrole: string[];
  company: string | null;
  years_experience: number;
  location: string | null;
  moroccan_city: string | null;
  expertise: string[];
  skills: string[];
  bio: string | null;
  profile_picture?: string;
}

/**
 * Parse LinkedIn profile to mentor data
 */
export function parseLinkedInProfile(profile: LinkedInProfile, email: string, linkedinUrl: string): ParsedMentorProfile {
  // Extract name
  const firstName = profile.firstName?.localized?.[Object.keys(profile.firstName.localized)[0]] || '';
  const lastName = profile.lastName?.localized?.[Object.keys(profile.lastName.localized)[0]] || '';
  const name = `${firstName} ${lastName}`.trim();

  // Extract current role and company from headline or positions
  let currentrole: string[] = [];
  let company: string | null = null;
  let years_experience = 0;

  // Try to get from headline first (e.g., "CTO at TechCorp")
  if (profile.headline) {
    const headlineMatch = profile.headline.match(/^(.+?)\s+(?:at|chez|@)\s+(.+)$/i);
    if (headlineMatch) {
      currentrole = [headlineMatch[1].trim()];
      company = headlineMatch[2].trim();
    } else {
      // Just use headline as role
      currentrole = [profile.headline];
    }
  }

  // Get from positions if available
  if (profile.positions?.elements && profile.positions.elements.length > 0) {
    // Get most recent position
    const recentPosition = profile.positions.elements
      .filter(p => !p.timePeriod?.endDate) // Current positions only
      .sort((a, b) => {
        const aYear = a.timePeriod?.startDate?.year || 0;
        const bYear = b.timePeriod?.startDate?.year || 0;
        return bYear - aYear;
      })[0];

    if (recentPosition) {
      currentrole = [recentPosition.title];
      company = recentPosition.companyName;

      // Calculate years of experience
      if (recentPosition.timePeriod?.startDate?.year) {
        const startYear = recentPosition.timePeriod.startDate.year;
        const currentYear = new Date().getFullYear();
        years_experience = Math.max(0, currentYear - startYear);
      }
    }

    // If no current position, use most recent past position
    if (!recentPosition && profile.positions.elements.length > 0) {
      const latestPosition = profile.positions.elements
        .sort((a, b) => {
          const aEndYear = a.timePeriod?.endDate?.year || 0;
          const bEndYear = b.timePeriod?.endDate?.year || 0;
          return bEndYear - aEndYear;
        })[0];

      if (latestPosition) {
        currentrole = [latestPosition.title];
        company = latestPosition.companyName;

        // Calculate years of experience from start to end
        if (latestPosition.timePeriod?.startDate?.year && latestPosition.timePeriod?.endDate?.year) {
          years_experience = latestPosition.timePeriod.endDate.year - latestPosition.timePeriod.startDate.year;
        }
      }
    }
  }

  // Extract location
  let location: string | null = null;
  let moroccan_city: string | null = null;

  if (profile.location) {
    location = profile.location.geographicArea || profile.location.country || null;
    
    // Check if it's a Moroccan city
    const moroccanCities = [
      'casablanca', 'casa', 'rabat', 'marrakech', 'fes', 'fès', 'tanger', 'tangier',
      'agadir', 'meknes', 'oujda', 'kenitra', 'tetouan', 'safi', 'el jadida'
    ];
    
    const locationLower = location?.toLowerCase() || '';
    const isMoroccanCity = moroccanCities.some(city => locationLower.includes(city));
    
    if (isMoroccanCity) {
      moroccan_city = location;
    }
  }

  // Extract skills
  const skills: string[] = [];
  if (profile.skills?.elements) {
    profile.skills.elements.forEach(skill => {
      if (skill.name) {
        skills.push(skill.name);
      }
    });
  }

  // Map skills to expertise domains
  const expertise = mapSkillsToExpertise(skills, currentrole[0] || '');

  // Extract bio from summary
  const bio = profile.summary || null;

  // Extract profile picture
  let profile_picture: string | undefined;
  if (profile.profilePicture?.displayImage) {
    profile_picture = profile.profilePicture.displayImage;
  }

  return {
    name,
    email,
    linkedin_url: linkedinUrl,
    currentrole,
    company,
    years_experience,
    location,
    moroccan_city,
    expertise,
    skills,
    bio,
    profile_picture,
  };
}

/**
 * Map skills and role to expertise domains
 */
function mapSkillsToExpertise(skills: string[], role: string): string[] {
  const expertise: string[] = [];
  const roleLower = role.toLowerCase();
  const skillsLower = skills.map(s => s.toLowerCase());

  // Technology
  if (
    roleLower.includes('tech') ||
    roleLower.includes('developer') ||
    roleLower.includes('engineer') ||
    roleLower.includes('cto') ||
    roleLower.includes('software') ||
    skillsLower.some(s => s.includes('react') || s.includes('node') || s.includes('python') || s.includes('javascript'))
  ) {
    expertise.push('technology');
  }

  // Healthcare
  if (
    roleLower.includes('health') ||
    roleLower.includes('medical') ||
    roleLower.includes('doctor') ||
    roleLower.includes('nurse') ||
    skillsLower.some(s => s.includes('health') || s.includes('medical'))
  ) {
    expertise.push('healthcare');
  }

  // Finance
  if (
    roleLower.includes('finance') ||
    roleLower.includes('financial') ||
    roleLower.includes('cfo') ||
    roleLower.includes('accounting') ||
    skillsLower.some(s => s.includes('finance') || s.includes('accounting'))
  ) {
    expertise.push('finance');
  }

  // Education
  if (
    roleLower.includes('education') ||
    roleLower.includes('teacher') ||
    roleLower.includes('professor') ||
    roleLower.includes('academic')
  ) {
    expertise.push('education');
  }

  // Business/Entrepreneurship
  if (
    roleLower.includes('ceo') ||
    roleLower.includes('founder') ||
    roleLower.includes('entrepreneur') ||
    roleLower.includes('business') ||
    roleLower.includes('startup')
  ) {
    expertise.push('business');
  }

  // Marketing
  if (
    roleLower.includes('marketing') ||
    roleLower.includes('cmo') ||
    skillsLower.some(s => s.includes('marketing') || s.includes('branding'))
  ) {
    expertise.push('marketing');
  }

  // Default to 'business' if no match
  if (expertise.length === 0) {
    expertise.push('business');
  }

  return expertise;
}

/**
 * Calculate years of experience from positions
 */
export function calculateYearsExperience(positions: LinkedInProfile['positions']): number {
  if (!positions?.elements || positions.elements.length === 0) {
    return 0;
  }

  // Find earliest start date
  let earliestYear: number | null = null;
  
  positions.elements.forEach(position => {
    if (position.timePeriod?.startDate?.year) {
      const year = position.timePeriod.startDate.year;
      if (!earliestYear || year < earliestYear) {
        earliestYear = year;
      }
    }
  });

  if (!earliestYear) {
    return 0;
  }

  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - earliestYear);
}

