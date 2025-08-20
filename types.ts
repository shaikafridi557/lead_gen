export interface SocialMedia {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

export interface Lead {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  imageUrl: string;
  category: string;
  socialMedia: SocialMedia;
  priority: 'High' | 'Medium' | 'Low' | '';
  notes: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}