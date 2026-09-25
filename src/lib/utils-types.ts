// Type utilities shared across client and server
export type SellerSummary = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  whatsappNumber?: string | null;
  companyName?: string | null;
  logo: string | null;
  description: string | null;
  experienceYears: number | null;
  projectsCount: number | null;
  /** builder | owner | agent */
  publisherType?: string;
  /** True only when an admin has verified the account. */
  isVerified?: boolean;
};

export type PropertyWithRelations = {
  id: number;
  title: string;
  slug: string;
  description: string;
  propertyType: string;
  status: string;
  furnishing: string | null;
  price: number;
  pricePerSqft: number | null;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  floor: number | null;
  totalFloors: number | null;
  facing: string | null;
  address: string;
  location: string;
  city: string;
  state: string;
  pincode: string | null;
  latitude: string | null;
  longitude: string | null;
  amenities: string[];
  highlights: string[];
  reraId: string | null;
  approvalInfo?: string | null;
  contactPreference?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  views: number;
  moderationStatus?: string;
  rejectionReason?: string | null;
  submittedAt?: Date | string | null;
  publishedAt?: Date | string | null;
  builderId?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  seller: SellerSummary;
  /** Alias of `seller` for backwards compatibility. */
  builder: SellerSummary;
  images: {
    id: number;
    imageUrl: string;
    altText: string | null;
    isCover: boolean | null;
    sortOrder: number | null;
    provider?: string | null;
    publicId?: string | null;
  }[];
  coverImage: string | null;
};
