/**
 * Coffee Chat Member Data
 * Member information for the coffee chat page
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * DEVELOPER NOTES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * HOW TO ADD/REPLACE A HEADSHOT:
 * 1. Add the headshot image to: public/images/headshots/
 * 2. Name the file with the member's first name (capitalized): e.g., "John.png"
 * 3. Add the first name to HEADSHOT_FILES array below
 * 4. Use getHeadshotPath('FirstName') in the member object
 * 
 * HOW TO ADD A NEW MEMBER:
 * 1. Add headshot (see above)
 * 2. Add a new object to coffeeChatMembers array with all fields:
 *    - id: 'firstname-lastname' (lowercase, hyphenated)
 *    - firstName, lastName: Display names
 *    - role: Their position (empty string if none)
 *    - headshotSrc: getHeadshotPath('FirstName')
 *    - calendlyUrl: Full Calendly URL or undefined to hide button
 *    - linkedinUrl: Full LinkedIn URL or empty string '' to hide icon
 *    - hobbies, funFact, lookingForwardTo: String content for modal
 * 
 * HOW TO UPDATE MEMBER INFO:
 * 1. Find the member object in coffeeChatMembers array
 * 2. Update the desired field(s)
 * 3. For Calendly/LinkedIn: set to undefined/'' to hide, or add URL to show
 * 
 * MEMBER ORDER: Sorted by role seniority (President → VPs → Directors)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface CoffeeChatMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  headshotSrc: string;
  calendlyUrl?: string;
  linkedinUrl?: string;
  hobbies: string;
  funFact: string;
  lookingForwardTo: string;
}

// Known headshot files in public/images/headshots/ (all .png)
const HEADSHOT_FILES = [
  'Aaron', 'Andrew', 'Arjun', 'Brian', 'Hunter', 'Joel', 'Justin',
  'Khang', 'Kim', 'Krish', 'Madison', 'Michelle', 'Mohan', 'Nishant',
  'Patrick', 'Rohan', 'Saahil', 'Sahana', 'Sonia', 'Trinity', 'Zach', 'Zaid'
] as const;

/**
 * Get the headshot path for a member by first name
 * Returns the path if found, or a placeholder path if not
 */
export function getHeadshotPath(firstName: string): string {
  const normalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  if (HEADSHOT_FILES.includes(normalized as typeof HEADSHOT_FILES[number])) {
    return `/images/headshots/${normalized}.png`;
  }
  // Fallback to a default/placeholder if headshot not found
  return `/images/headshots/placeholder.png`;
}

/**
 * Coffee chat member data
 * Ordered by role seniority: President → VPs → Directors
 */
export const coffeeChatMembers: CoffeeChatMember[] = [
  {
    id: 'khang-nguyen',
    firstName: 'Khang',
    lastName: 'Nguyen',
    role: 'President',
    headshotSrc: getHeadshotPath('Khang'),
    calendlyUrl: 'https://calendly.com/khantn11-uci/30min',
    linkedinUrl: 'https://www.linkedin.com/in/khangtoannguyen/',
    hobbies: 'Hitting back at the gym',
    funFact: "I'm about to run a marathon with ICG",
    lookingForwardTo: 'Sending ICG to the moon',
  },
  {
    id: 'kim-vuong',
    firstName: 'Kim',
    lastName: 'Vuong',
    role: 'Internal VP',
    headshotSrc: getHeadshotPath('Kim'),
    calendlyUrl: 'https://calendly.com/kimv5-uci/30min',
    linkedinUrl: 'https://www.linkedin.com/in/kimvuong-vntk/',
    hobbies: 'Running; making drinks',
    funFact: 'I just did a 14-day road trip',
    lookingForwardTo: 'To meet you all and our clients in the F&B',
  },
  {
    id: 'michelle-choy',
    firstName: 'Michelle',
    lastName: 'Choy',
    role: 'External VP',
    headshotSrc: getHeadshotPath('Michelle'),
    calendlyUrl: 'https://calendly.com/choyma-uci/30min',
    linkedinUrl: 'https://www.linkedin.com/in/michelle-choy0/',
    hobbies: 'Rock climbing; camping',
    funFact: 'I have over 250 restaurants on Beli',
    lookingForwardTo: 'PMing and meeting everyone during recruitment',
  },
  {
    id: 'mohan-krishnan',
    firstName: 'Mohan',
    lastName: 'Krishnan',
    role: 'Strategy VP',
    headshotSrc: getHeadshotPath('Mohan'),
    calendlyUrl: undefined,
    linkedinUrl: 'https://www.linkedin.com/in/mohan-krishnan1/',
    hobbies: 'Magic: The Gathering',
    funFact: 'I was born in Michigan',
    lookingForwardTo: 'Kura Sushi and 7Leaves projects',
  },
  {
    id: 'aaron-johnson',
    firstName: 'Aaron',
    lastName: 'Johnson',
    role: 'Co-Director of Recruitment & Professional Development',
    headshotSrc: getHeadshotPath('Aaron'),
    calendlyUrl: 'https://calendly.com/aaronjj3-uci/30min',
    linkedinUrl: 'https://www.linkedin.com/in/aaronjohnsonbusiness/',
    hobbies: 'Pickleball; Scuba Diving',
    funFact: 'I can solve a Rubik\'s Cube',
    lookingForwardTo: 'Kura Sushi Project; more socials with ICG this quarter',
  },
  {
    id: 'joel-leong',
    firstName: 'Joel',
    lastName: 'Leong',
    role: 'Co-Director of Finance & Professional Development',
    headshotSrc: getHeadshotPath('Joel'),
    calendlyUrl: 'https://calendly.com/joelleongsz/30min',
    linkedinUrl: 'https://www.linkedin.com/in/joelleong-/',
    hobbies: 'Eating',
    funFact: 'I enjoy watching sitcoms',
    lookingForwardTo: 'Meeting new JAs and working on 7Leaves',
  },
  {
    id: 'rohan-bharti',
    firstName: 'Rohan',
    lastName: 'Bharti',
    role: 'Co-Director of Technology',
    headshotSrc: getHeadshotPath('Rohan'),
    calendlyUrl: 'https://calendly.com/rbharti-uci/30min',
    linkedinUrl: 'https://www.linkedin.com/in/rohan-bharti-3148a2292/',
    hobbies: 'Producing music',
    funFact: 'I got my finger stuck in an elevator',
    lookingForwardTo: 'Meeting everyone',
  },
  {
    id: 'sahana-chockalingam',
    firstName: 'Sahana',
    lastName: 'Chockalingam',
    role: 'Co-Director of Professional Development',
    headshotSrc: getHeadshotPath('Sahana'),
    calendlyUrl: 'https://calendly.com/chockals-uci/30min',
    linkedinUrl: 'https://www.linkedin.com/in/sahanachockalingam/',
    hobbies: 'Junk journaling',
    funFact: 'I can quote Phineas and Ferb more than is socially acceptable',
    lookingForwardTo: 'Helping lead the JA program',
  },
  {
    id: 'trinity-nguyen',
    firstName: 'Trinity',
    lastName: 'Nguyen',
    role: 'Co-Director of Recruitment & Finance',
    headshotSrc: getHeadshotPath('Trinity'),
    calendlyUrl: 'https://calendly.com/trinikn1-uci/30min',
    linkedinUrl: 'https://www.linkedin.com/in/trinity-nguyen-789a4634b/',
    hobbies: 'Reading; café hopping',
    funFact: 'I will always be seen with a Celsius',
    lookingForwardTo: 'This recruitment cycle and Kura Sushi',
  },
  {
    id: 'zaid-baghdadi',
    firstName: 'Zaid',
    lastName: 'Baghdadi',
    role: 'Co-Director of Marketing & Social',
    headshotSrc: getHeadshotPath('Zaid'),
    calendlyUrl: 'https://calendly.com/zbaghdad-uci/30min',
    linkedinUrl: 'https://www.linkedin.com/in/zaid-baghdadi-479a5027a/',
    hobbies: 'Basketball',
    funFact: 'I want to become a sports lawyer for the NBA',
    lookingForwardTo: 'Building strong connections; enhancing businesses; Kura Sushi',
  },
  {
    id: 'krish-marwah',
    firstName: 'Krish',
    lastName: 'Marwah',
    role: 'Co-Director of Sourcing',
    headshotSrc: getHeadshotPath('Krish'),
    calendlyUrl: undefined,
    linkedinUrl: 'https://www.linkedin.com/in/krishmarwah/',
    hobbies: 'Acting; Boxing',
    funFact: 'I appeared on Netflix',
    lookingForwardTo: 'Kura Sushi Project',
  },
];

// Helper to get only members with Calendly links (for filtering if needed)
export const membersWithCalendly = coffeeChatMembers.filter(
  (member) => member.calendlyUrl
);

// Helper to get members by role category
export function getMembersByRoleCategory(category: 'president' | 'vp' | 'director'): CoffeeChatMember[] {
  return coffeeChatMembers.filter((member) => {
    const role = member.role.toLowerCase();
    switch (category) {
      case 'president':
        return role.includes('president');
      case 'vp':
        return role.includes('vp');
      case 'director':
        return role.includes('director');
      default:
        return false;
    }
  });
}

