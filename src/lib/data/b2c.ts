// B2C marketplace demo data — the consumer side of thattime.
// One module per domain (WAYS_OF_WORKING): everything the /c surface
// renders lives here. Mirrors the B2B offer model (service | class |
// bundle | subscription) so both sides of the app stay in sync.

import type { OfferType } from "@/lib/types/offer";
import type { CategoryName } from "@/lib/tokens/categories";

/* ------------------------------------------------------------------ */
/* Images — wireframe placeholders cycled from the onboarding set      */
/* ------------------------------------------------------------------ */

export const photos = [
  "/onboarding/photo-carousel-center.png",
  "/onboarding/photo-carousel-left.png",
  "/onboarding/photo-carousel-right.png",
  "/onboarding/photo-cat-1.png",
  "/onboarding/photo-cat-2.png",
  "/onboarding/photo-cat-3.png",
  "/onboarding/photo-cat-4.png",
] as const;

export const photo = (i: number) => photos[i % photos.length];

/* ------------------------------------------------------------------ */
/* Offers a client can buy                                             */
/* ------------------------------------------------------------------ */

export interface ClientOffer {
  id: string;
  type: OfferType;
  name: string;
  price: string; // "£35", "From £45", "£60/mo"
  durationMin?: number;
  description: string;
  popular?: boolean;
  /** class only */
  nextSession?: string;
  spotsLeft?: number;
  /** bundle only */
  includes?: string[];
  saving?: string;
  /** subscription only */
  billing?: string; // "per month"
  benefits?: string[];
}

/* ------------------------------------------------------------------ */
/* Salons (any service business: barbers, dog walkers, studios…)       */
/* ------------------------------------------------------------------ */

export interface SalonPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  /** ties a look/post back to a bookable offer */
  offerId?: string;
}

export interface SalonHighlight {
  id: string;
  label: string;
  image: string;
}

export interface SalonStaff {
  id: string;
  name: string;
  role: string;
  rating: string;
  initials: string;
}

export interface SalonReview {
  id: string;
  author: string;
  initials: string;
  stars: number;
  date: string;
  text: string;
  service: string;
}

export interface Salon {
  id: string;
  name: string;
  handle: string;
  category: CategoryName;
  rating: string;
  reviewCount: number;
  address: string;
  distance: string;
  bio: string;
  followers: string;
  postsCount: number;
  isFollowing: boolean;
  cover: string;
  avatar: string; // initials
  openNow: boolean;
  hours: string;
  nextAvailable: string;
  highlights: SalonHighlight[];
  posts: SalonPost[];
  offers: ClientOffer[];
  staff: SalonStaff[];
  reviews: SalonReview[];
}

const villageOffers: ClientOffer[] = [
  { id: "vo-1", type: "service", name: "Skin fade", price: "£28", durationMin: 45, description: "Precision fade with hot-towel finish.", popular: true },
  { id: "vo-2", type: "service", name: "Classic cut", price: "£22", durationMin: 30, description: "Scissor cut, wash and style." },
  { id: "vo-3", type: "service", name: "Beard trim & shape", price: "£15", durationMin: 20, description: "Line-up, trim and oil finish." },
  { id: "vo-4", type: "service", name: "Cut & beard combo", price: "£38", durationMin: 60, description: "Full cut plus beard sculpt.", popular: true },
  { id: "vo-5", type: "bundle", name: "Fresh-up pack ×5", price: "£120", description: "Five skin fades, use any time.", includes: ["5 × Skin fade", "Priority slots"], saving: "Save £20" },
  { id: "vo-6", type: "subscription", name: "Village member", price: "£45", billing: "per month", description: "Two cuts a month plus member perks.", benefits: ["2 cuts / month", "10% off products", "Priority booking"] },
];

const lunaOffers: ClientOffer[] = [
  { id: "lo-1", type: "service", name: "Cut & blow dry", price: "£55", durationMin: 60, description: "Consultation, cut and finish.", popular: true },
  { id: "lo-2", type: "service", name: "Full balayage", price: "From £140", durationMin: 180, description: "Hand-painted colour with toner and treatment." },
  { id: "lo-3", type: "service", name: "Root tint", price: "£65", durationMin: 90, description: "Regrowth colour with gloss finish." },
  { id: "lo-4", type: "class", name: "Blow-dry masterclass", price: "£40", durationMin: 90, description: "Learn salon-finish styling at home.", nextSession: "Sat 20 Jun, 10:00", spotsLeft: 3 },
  { id: "lo-5", type: "bundle", name: "Colour care trio", price: "£180", description: "Balayage, gloss and Olaplex treatment.", includes: ["Full balayage", "Gloss refresh", "Olaplex treatment"], saving: "Save £35" },
  { id: "lo-6", type: "subscription", name: "Luna glow club", price: "£60", billing: "per month", description: "Monthly blow dry plus colour perks.", benefits: ["1 blow dry / month", "15% off colour", "Free fringe trims"] },
];

const kneadOffers: ClientOffer[] = [
  { id: "ko-1", type: "service", name: "Deep tissue — 60 min", price: "£62", durationMin: 60, description: "Targeted pressure for stubborn knots.", popular: true },
  { id: "ko-2", type: "service", name: "Swedish relax — 90 min", price: "£85", durationMin: 90, description: "Full-body relaxation massage." },
  { id: "ko-3", type: "class", name: "Couples massage workshop", price: "£70", durationMin: 120, description: "Learn the basics together.", nextSession: "Sun 21 Jun, 14:00", spotsLeft: 4 },
  { id: "ko-4", type: "bundle", name: "Reset pack ×3", price: "£165", description: "Three 60-minute sessions.", includes: ["3 × Deep tissue 60"], saving: "Save £21" },
  { id: "ko-5", type: "subscription", name: "Monthly reset", price: "£55", billing: "per month", description: "One massage every month, roll over unused.", benefits: ["1 × 60 min / month", "Rollover sessions", "Guest pass twice a year"] },
];

const pawsOffers: ClientOffer[] = [
  { id: "po-1", type: "service", name: "Solo walk — 60 min", price: "£18", durationMin: 60, description: "One-on-one walk with photo updates.", popular: true },
  { id: "po-2", type: "service", name: "Group adventure", price: "£14", durationMin: 90, description: "Pack walk in Windsor Great Park." },
  { id: "po-3", type: "class", name: "Puppy social hour", price: "£10", durationMin: 60, description: "Supervised off-lead socialising.", nextSession: "Wed 17 Jun, 11:00", spotsLeft: 2 },
  { id: "po-4", type: "subscription", name: "Weekday walks", price: "£70", billing: "per week", description: "A walk every weekday.", benefits: ["5 walks / week", "GPS + photo report", "Free key holding"] },
];

const formOffers: ClientOffer[] = [
  { id: "fo-1", type: "class", name: "Reformer pilates", price: "£24", durationMin: 50, description: "All-levels reformer flow.", nextSession: "Today, 18:30", spotsLeft: 1, popular: true },
  { id: "fo-2", type: "class", name: "Strength foundations", price: "£20", durationMin: 60, description: "Small-group barbell basics.", nextSession: "Tue 16 Jun, 07:00", spotsLeft: 6 },
  { id: "fo-3", type: "service", name: "1:1 personal training", price: "From £55", durationMin: 60, description: "Programmed sessions with a coach." },
  { id: "fo-4", type: "bundle", name: "Class pack ×10", price: "£199", description: "Ten classes, any schedule.", includes: ["10 × any class", "3-month validity"], saving: "Save £41" },
  { id: "fo-5", type: "subscription", name: "Unlimited studio", price: "£89", billing: "per month", description: "Unlimited classes plus open gym.", benefits: ["Unlimited classes", "Open gym access", "Pause anytime"] },
];

export const salons: Salon[] = [
  {
    id: "village-barbers",
    name: "Village Barbers",
    handle: "@villagebarbers",
    category: "Barbering",
    rating: "5.0",
    reviewCount: 765,
    address: "92 Sunningdale High Street",
    distance: "0.3 mi",
    bio: "Fades, classics and hot-towel shaves since 2014. Walk-ins welcome, legends made daily.",
    followers: "4.2k",
    postsCount: 132,
    isFollowing: true,
    cover: photo(0),
    avatar: "VB",
    openNow: true,
    hours: "Open until 19:00",
    nextAvailable: "Today, 15:30",
    highlights: [
      { id: "vh-1", label: "Fades", image: photo(0) },
      { id: "vh-2", label: "Beards", image: photo(1) },
      { id: "vh-3", label: "The shop", image: photo(2) },
      { id: "vh-4", label: "Before/After", image: photo(3) },
    ],
    posts: [
      { id: "vp-1", image: photo(0), caption: "Mid skin fade, crop on top. Booked out Saturdays — grab a weekday slot.", likes: 214, comments: 18, timeAgo: "2h", offerId: "vo-1" },
      { id: "vp-2", image: photo(3), caption: "Beard sculpt of the week.", likes: 96, comments: 7, timeAgo: "1d", offerId: "vo-3" },
      { id: "vp-3", image: photo(1), caption: "Saturday morning energy.", likes: 142, comments: 11, timeAgo: "2d" },
      { id: "vp-4", image: photo(4), caption: "Classic cut, modern finish.", likes: 88, comments: 4, timeAgo: "3d", offerId: "vo-2" },
      { id: "vp-5", image: photo(2), caption: "New chairs just landed.", likes: 64, comments: 2, timeAgo: "5d" },
      { id: "vp-6", image: photo(5), caption: "Combo day.", likes: 120, comments: 9, timeAgo: "1w", offerId: "vo-4" },
    ],
    offers: villageOffers,
    staff: [
      { id: "vs-1", name: "Marco P.", role: "Master barber", rating: "5.0", initials: "MP" },
      { id: "vs-2", name: "Jay T.", role: "Barber", rating: "4.9", initials: "JT" },
      { id: "vs-3", name: "Olly R.", role: "Junior barber", rating: "4.8", initials: "OR" },
    ],
    reviews: [
      { id: "vr-1", author: "Daniel K.", initials: "DK", stars: 5, date: "2 days ago", text: "Marco is the only person allowed near my hair. Sharpest fade in Ascot.", service: "Skin fade" },
      { id: "vr-2", author: "Sam W.", initials: "SW", stars: 5, date: "1 week ago", text: "Booked through the app, in and out in 40 minutes. Spot on.", service: "Cut & beard combo" },
      { id: "vr-3", author: "Theo B.", initials: "TB", stars: 4, date: "2 weeks ago", text: "Great cut, slightly late start but worth the wait.", service: "Classic cut" },
    ],
  },
  {
    id: "luna-hair",
    name: "Luna Hair Studio",
    handle: "@lunahairstudio",
    category: "Hair",
    rating: "4.9",
    reviewCount: 1204,
    address: "14 Chobham Road, Sunningdale",
    distance: "0.6 mi",
    bio: "Colour specialists ✨ Balayage, lived-in blonde and big blow-dry energy. Tag #LunaGlow to be featured.",
    followers: "11.8k",
    postsCount: 318,
    isFollowing: false,
    cover: photo(1),
    avatar: "LH",
    openNow: true,
    hours: "Open until 20:00",
    nextAvailable: "Tomorrow, 10:00",
    highlights: [
      { id: "lh-1", label: "Balayage", image: photo(1) },
      { id: "lh-2", label: "Transformations", image: photo(4) },
      { id: "lh-3", label: "Team", image: photo(2) },
      { id: "lh-4", label: "Reviews", image: photo(5) },
    ],
    posts: [
      { id: "lp-1", image: photo(1), caption: "Honey balayage on dark base — 4 hours well spent. Book a colour consult to start your own.", likes: 532, comments: 41, timeAgo: "4h", offerId: "lo-2" },
      { id: "lp-2", image: photo(4), caption: "The chop! Long bob season is here.", likes: 318, comments: 22, timeAgo: "1d", offerId: "lo-1" },
      { id: "lp-3", image: photo(5), caption: "Root refresh + gloss = instant reset.", likes: 207, comments: 13, timeAgo: "2d", offerId: "lo-3" },
      { id: "lp-4", image: photo(2), caption: "Masterclass spots open for Saturday!", likes: 145, comments: 19, timeAgo: "3d", offerId: "lo-4" },
      { id: "lp-5", image: photo(0), caption: "Fresh fringe Friday.", likes: 263, comments: 17, timeAgo: "4d" },
      { id: "lp-6", image: photo(3), caption: "#LunaGlow client feature — thanks Maya!", likes: 401, comments: 28, timeAgo: "6d" },
    ],
    offers: lunaOffers,
    staff: [
      { id: "ls-1", name: "Sofia L.", role: "Colour director", rating: "5.0", initials: "SL" },
      { id: "ls-2", name: "Amber C.", role: "Senior stylist", rating: "4.9", initials: "AC" },
      { id: "ls-3", name: "Nina F.", role: "Stylist", rating: "4.8", initials: "NF" },
      { id: "ls-4", name: "Grace H.", role: "Graduate stylist", rating: "4.7", initials: "GH" },
    ],
    reviews: [
      { id: "lr-1", author: "Maya R.", initials: "MR", stars: 5, date: "3 days ago", text: "Sofia understood exactly what I wanted. The balayage is unreal.", service: "Full balayage" },
      { id: "lr-2", author: "Ellie P.", initials: "EP", stars: 5, date: "1 week ago", text: "Best blow dry I've ever had, and the masterclass actually taught me to recreate it.", service: "Blow-dry masterclass" },
      { id: "lr-3", author: "Hannah D.", initials: "HD", stars: 4, date: "2 weeks ago", text: "Lovely salon, colour came out great. Booking the glow club next.", service: "Root tint" },
    ],
  },
  {
    id: "knead-studio",
    name: "Knead Massage Studio",
    handle: "@kneadstudio",
    category: "Massage",
    rating: "4.8",
    reviewCount: 489,
    address: "3 Station Parade, Ascot",
    distance: "1.1 mi",
    bio: "Deep tissue, sports and Swedish massage. Quiet rooms, strong hands, zero whale music (unless requested).",
    followers: "2.9k",
    postsCount: 87,
    isFollowing: false,
    cover: photo(2),
    avatar: "KS",
    openNow: false,
    hours: "Opens 09:00 tomorrow",
    nextAvailable: "Tomorrow, 09:30",
    highlights: [
      { id: "kh-1", label: "The rooms", image: photo(2) },
      { id: "kh-2", label: "Techniques", image: photo(6) },
      { id: "kh-3", label: "Offers", image: photo(0) },
    ],
    posts: [
      { id: "kp-1", image: photo(2), caption: "Desk shoulders? The 60-minute deep tissue was made for you.", likes: 76, comments: 5, timeAgo: "6h", offerId: "ko-1" },
      { id: "kp-2", image: photo(6), caption: "Couples workshop is back this Sunday — 4 spots left.", likes: 54, comments: 8, timeAgo: "1d", offerId: "ko-3" },
      { id: "kp-3", image: photo(0), caption: "Monthly reset members get priority weekend slots.", likes: 39, comments: 2, timeAgo: "4d", offerId: "ko-5" },
    ],
    offers: kneadOffers,
    staff: [
      { id: "ks-1", name: "Tomas V.", role: "Sports therapist", rating: "4.9", initials: "TV" },
      { id: "ks-2", name: "Ria N.", role: "Massage therapist", rating: "4.8", initials: "RN" },
    ],
    reviews: [
      { id: "kr-1", author: "Chris M.", initials: "CM", stars: 5, date: "5 days ago", text: "Tomas found knots I didn't know existed. Walking taller already.", service: "Deep tissue — 60 min" },
      { id: "kr-2", author: "Priya S.", initials: "PS", stars: 4, date: "2 weeks ago", text: "So relaxing. Room was a touch warm but the massage was excellent.", service: "Swedish relax — 90 min" },
    ],
  },
  {
    id: "paws-walks",
    name: "Paws & Paths",
    handle: "@pawsandpaths",
    category: "Wellness",
    rating: "5.0",
    reviewCount: 312,
    address: "Covers Sunningdale & Ascot",
    distance: "Comes to you",
    bio: "Dog walking & puppy socials 🐾 GPS-tracked walks, photo reports and a lot of good boys.",
    followers: "6.4k",
    postsCount: 540,
    isFollowing: true,
    cover: photo(3),
    avatar: "PP",
    openNow: true,
    hours: "Walks 07:00 – 18:00",
    nextAvailable: "Today, 16:00",
    highlights: [
      { id: "ph-1", label: "Pack walks", image: photo(3) },
      { id: "ph-2", label: "Puppies", image: photo(5) },
      { id: "ph-3", label: "Routes", image: photo(6) },
    ],
    posts: [
      { id: "pp-1", image: photo(3), caption: "Today's pack conquered Windsor Great Park. All dogs returned muddy and delighted.", likes: 482, comments: 36, timeAgo: "3h", offerId: "po-2" },
      { id: "pp-2", image: photo(5), caption: "Puppy social hour — Wednesday spots nearly gone!", likes: 350, comments: 24, timeAgo: "1d", offerId: "po-3" },
      { id: "pp-3", image: photo(6), caption: "New riverside route unlocked.", likes: 198, comments: 12, timeAgo: "2d" },
      { id: "pp-4", image: photo(4), caption: "Meet Biscuit, our newest weekday walker.", likes: 511, comments: 47, timeAgo: "4d", offerId: "po-4" },
    ],
    offers: pawsOffers,
    staff: [
      { id: "ps-1", name: "Holly G.", role: "Lead walker", rating: "5.0", initials: "HG" },
      { id: "ps-2", name: "Ben A.", role: "Walker", rating: "4.9", initials: "BA" },
    ],
    reviews: [
      { id: "pr-1", author: "Laura T.", initials: "LT", stars: 5, date: "1 day ago", text: "The photo updates make my work day. Alfie adores Holly.", service: "Weekday walks" },
      { id: "pr-2", author: "James O.", initials: "JO", stars: 5, date: "1 week ago", text: "Puppy social hour transformed our nervous rescue. Can't recommend enough.", service: "Puppy social hour" },
    ],
  },
  {
    id: "form-studio",
    name: "FORM Studio",
    handle: "@formstudio",
    category: "Fitness",
    rating: "4.9",
    reviewCount: 928,
    address: "Unit 2, London Road, Ascot",
    distance: "1.4 mi",
    bio: "Reformer pilates & strength classes. Small groups, big results. First class £10 with code FORM10.",
    followers: "9.1k",
    postsCount: 264,
    isFollowing: false,
    cover: photo(4),
    avatar: "FS",
    openNow: true,
    hours: "Open until 21:00",
    nextAvailable: "Today, 18:30",
    highlights: [
      { id: "fh-1", label: "Reformer", image: photo(4) },
      { id: "fh-2", label: "Strength", image: photo(0) },
      { id: "fh-3", label: "Community", image: photo(1) },
    ],
    posts: [
      { id: "fp-1", image: photo(4), caption: "One spot left in tonight's 18:30 reformer flow. Quick!", likes: 167, comments: 14, timeAgo: "1h", offerId: "fo-1" },
      { id: "fp-2", image: photo(0), caption: "Strength foundations — Tuesday 7am crew assembling.", likes: 134, comments: 9, timeAgo: "1d", offerId: "fo-2" },
      { id: "fp-3", image: photo(1), caption: "Unlimited members: open gym hours extended this month.", likes: 201, comments: 16, timeAgo: "2d", offerId: "fo-5" },
    ],
    offers: formOffers,
    staff: [
      { id: "fs-1", name: "Kat E.", role: "Head coach", rating: "5.0", initials: "KE" },
      { id: "fs-2", name: "Drew M.", role: "Pilates instructor", rating: "4.9", initials: "DM" },
      { id: "fs-3", name: "Leah S.", role: "Strength coach", rating: "4.8", initials: "LS" },
    ],
    reviews: [
      { id: "fr-1", author: "Becca H.", initials: "BH", stars: 5, date: "2 days ago", text: "Kat's reformer class is the highlight of my week. Book early, it sells out.", service: "Reformer pilates" },
      { id: "fr-2", author: "Tom F.", initials: "TF", stars: 5, date: "1 week ago", text: "Class pack is great value and the app makes rescheduling painless.", service: "Class pack ×10" },
    ],
  },
];

export const getSalon = (id: string) => salons.find((s) => s.id === id);

export const getOffer = (salonId: string, offerId: string) =>
  getSalon(salonId)?.offers.find((o) => o.id === offerId);

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

export interface StorySegment {
  id: string;
  image: string;
  caption: string;
  /** optional bookable offer surfaced on the segment */
  offerId?: string;
}

export interface Story {
  id: string;
  salonId: string;
  salonName: string;
  avatar: string;
  viewed: boolean;
  segments: StorySegment[];
}

export const stories: Story[] = [
  {
    id: "st-1", salonId: "village-barbers", salonName: "Village Barbers", avatar: "VB", viewed: false,
    segments: [
      { id: "st-1a", image: photo(0), caption: "Two cancellation slots this afternoon 👀", offerId: "vo-1" },
      { id: "st-1b", image: photo(3), caption: "Beard transformation of the day" },
    ],
  },
  {
    id: "st-2", salonId: "luna-hair", salonName: "Luna Hair", avatar: "LH", viewed: false,
    segments: [
      { id: "st-2a", image: photo(1), caption: "Behind the chair: honey balayage in progress", offerId: "lo-2" },
      { id: "st-2b", image: photo(4), caption: "The reveal ✨" },
      { id: "st-2c", image: photo(5), caption: "Masterclass Saturday — 3 spots left", offerId: "lo-4" },
    ],
  },
  {
    id: "st-3", salonId: "paws-walks", salonName: "Paws & Paths", avatar: "PP", viewed: false,
    segments: [
      { id: "st-3a", image: photo(3), caption: "Morning pack heading out 🐾" },
      { id: "st-3b", image: photo(5), caption: "Puppy social Wednesday — 2 spots", offerId: "po-3" },
    ],
  },
  {
    id: "st-4", salonId: "form-studio", salonName: "FORM Studio", avatar: "FS", viewed: true,
    segments: [
      { id: "st-4a", image: photo(4), caption: "18:30 reformer — last spot!", offerId: "fo-1" },
    ],
  },
  {
    id: "st-5", salonId: "knead-studio", salonName: "Knead", avatar: "KS", viewed: true,
    segments: [
      { id: "st-5a", image: photo(2), caption: "Sunday couples workshop", offerId: "ko-3" },
    ],
  },
];

export const getStory = (id: string) => stories.find((s) => s.id === id);

/* ------------------------------------------------------------------ */
/* Home feed                                                           */
/* ------------------------------------------------------------------ */

export interface FeedComment {
  id: string;
  author: string;
  initials: string;
  text: string;
  timeAgo: string;
}

export interface FeedPost {
  id: string;
  salonId: string;
  salonName: string;
  avatar: string;
  category: CategoryName;
  image: string;
  caption: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  timeAgo: string;
  offerId?: string;
  offerName?: string;
  offerPrice?: string;
  commentList: FeedComment[];
}

export const feedPosts: FeedPost[] = [
  {
    id: "fd-1", salonId: "luna-hair", salonName: "Luna Hair Studio", avatar: "LH", category: "Hair",
    image: photo(1), caption: "Honey balayage on a dark base — four hours, zero regrets. Swipe-worthy even without the swipe.",
    likes: 532, liked: false, saved: true, timeAgo: "4h",
    offerId: "lo-2", offerName: "Full balayage", offerPrice: "From £140",
    commentList: [
      { id: "c-1", author: "Maya R.", initials: "MR", text: "This was my hair!! Obsessed 😍", timeAgo: "3h" },
      { id: "c-2", author: "Ellie P.", initials: "EP", text: "Booking this immediately", timeAgo: "2h" },
    ],
  },
  {
    id: "fd-2", salonId: "village-barbers", salonName: "Village Barbers", avatar: "VB", category: "Barbering",
    image: photo(0), caption: "Mid skin fade, textured crop. Saturday's fully booked — weekday slots going fast.",
    likes: 214, liked: true, saved: false, timeAgo: "6h",
    offerId: "vo-1", offerName: "Skin fade", offerPrice: "£28",
    commentList: [
      { id: "c-3", author: "Daniel K.", initials: "DK", text: "Marco never misses 🔥", timeAgo: "5h" },
    ],
  },
  {
    id: "fd-3", salonId: "paws-walks", salonName: "Paws & Paths", avatar: "PP", category: "Wellness",
    image: photo(3), caption: "Today's pack conquered Windsor Great Park. All dogs returned muddy and delighted.",
    likes: 482, liked: false, saved: false, timeAgo: "8h",
    offerId: "po-2", offerName: "Group adventure", offerPrice: "£14",
    commentList: [
      { id: "c-4", author: "Laura T.", initials: "LT", text: "I can see Alfie living his best life 😂", timeAgo: "7h" },
      { id: "c-5", author: "James O.", initials: "JO", text: "Best service ever", timeAgo: "6h" },
    ],
  },
  {
    id: "fd-4", salonId: "form-studio", salonName: "FORM Studio", avatar: "FS", category: "Fitness",
    image: photo(4), caption: "One spot left in tonight's 18:30 reformer flow. First class £10 with FORM10.",
    likes: 167, liked: false, saved: false, timeAgo: "1h",
    offerId: "fo-1", offerName: "Reformer pilates", offerPrice: "£24",
    commentList: [{ id: "c-6", author: "Becca H.", initials: "BH", text: "Taken! See you there 🙌", timeAgo: "40m" }],
  },
  {
    id: "fd-5", salonId: "knead-studio", salonName: "Knead Massage Studio", avatar: "KS", category: "Massage",
    image: photo(2), caption: "Desk shoulders? The 60-minute deep tissue was made for you.",
    likes: 76, liked: false, saved: false, timeAgo: "1d",
    offerId: "ko-1", offerName: "Deep tissue — 60 min", offerPrice: "£62",
    commentList: [],
  },
];

export const getFeedPost = (id: string) => feedPosts.find((p) => p.id === id);

/** Explore grid mixes salon posts across the marketplace. */
export const explorePosts: Array<SalonPost & { salonId: string; salonName: string }> = salons.flatMap(
  (s) => s.posts.map((p) => ({ ...p, salonId: s.id, salonName: s.name })),
);

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";

export interface ClientBookingItem {
  id: string;
  salonId: string;
  salonName: string;
  avatar: string;
  offerName: string;
  offerType: OfferType;
  staff: string;
  date: string; // "Tue 16 Jun"
  time: string; // "15:30"
  durationMin: number;
  price: string;
  status: BookingStatus;
  image: string;
  address: string;
  reviewed?: boolean;
}

export const clientBookings: ClientBookingItem[] = [
  { id: "bk-1", salonId: "village-barbers", salonName: "Village Barbers", avatar: "VB", offerName: "Skin fade", offerType: "service", staff: "Marco P.", date: "Tue 16 Jun", time: "15:30", durationMin: 45, price: "£28", status: "confirmed", image: photo(0), address: "92 Sunningdale High Street" },
  { id: "bk-2", salonId: "form-studio", salonName: "FORM Studio", avatar: "FS", offerName: "Reformer pilates", offerType: "class", staff: "Drew M.", date: "Thu 18 Jun", time: "18:30", durationMin: 50, price: "£24", status: "confirmed", image: photo(4), address: "Unit 2, London Road, Ascot" },
  { id: "bk-3", salonId: "paws-walks", salonName: "Paws & Paths", avatar: "PP", offerName: "Solo walk — 60 min", offerType: "service", staff: "Holly G.", date: "Fri 19 Jun", time: "12:00", durationMin: 60, price: "£18", status: "pending", image: photo(3), address: "Pick-up from home" },
  { id: "bk-4", salonId: "luna-hair", salonName: "Luna Hair Studio", avatar: "LH", offerName: "Cut & blow dry", offerType: "service", staff: "Amber C.", date: "Fri 29 May", time: "11:00", durationMin: 60, price: "£55", status: "completed", image: photo(1), address: "14 Chobham Road, Sunningdale", reviewed: true },
  { id: "bk-5", salonId: "village-barbers", salonName: "Village Barbers", avatar: "VB", offerName: "Cut & beard combo", offerType: "service", staff: "Marco P.", date: "Sat 16 May", time: "10:00", durationMin: 60, price: "£38", status: "completed", image: photo(0), address: "92 Sunningdale High Street" },
  { id: "bk-6", salonId: "knead-studio", salonName: "Knead Massage Studio", avatar: "KS", offerName: "Deep tissue — 60 min", offerType: "service", staff: "Tomas V.", date: "Mon 4 May", time: "17:00", durationMin: 60, price: "£62", status: "cancelled", image: photo(2), address: "3 Station Parade, Ascot" },
];

export const getBooking = (id: string) => clientBookings.find((b) => b.id === id);

/* ------------------------------------------------------------------ */
/* Inbox                                                               */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  /** render an inline booking card above the text */
  bookingId?: string;
}

export interface Conversation {
  id: string;
  salonId: string;
  salonName: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
}

export const conversations: Conversation[] = [
  {
    id: "cv-1", salonId: "village-barbers", salonName: "Village Barbers", avatar: "VB",
    lastMessage: "See you Tuesday at 15:30 👊", time: "10:24", unread: 1,
    messages: [
      { id: "m-1", from: "me", text: "Hey, any chance of a slot this week?", time: "09:58" },
      { id: "m-2", from: "them", text: "Marco has Tuesday 15:30 free — want it?", time: "10:02" },
      { id: "m-3", from: "me", text: "Perfect, booked it now.", time: "10:20", bookingId: "bk-1" },
      { id: "m-4", from: "them", text: "See you Tuesday at 15:30 👊", time: "10:24" },
    ],
  },
  {
    id: "cv-2", salonId: "paws-walks", salonName: "Paws & Paths", avatar: "PP",
    lastMessage: "Photo report from today's walk 🐾", time: "Yesterday", unread: 2,
    messages: [
      { id: "m-5", from: "them", text: "Alfie was a superstar today!", time: "16:40" },
      { id: "m-6", from: "them", text: "Photo report from today's walk 🐾", time: "16:41" },
    ],
  },
  {
    id: "cv-3", salonId: "luna-hair", salonName: "Luna Hair Studio", avatar: "LH",
    lastMessage: "We'd love to feature your balayage on our page!", time: "Tue", unread: 0,
    messages: [
      { id: "m-7", from: "them", text: "Thanks for the lovely review! ✨", time: "Tue 14:02" },
      { id: "m-8", from: "them", text: "We'd love to feature your balayage on our page!", time: "Tue 14:03" },
      { id: "m-9", from: "me", text: "Of course, go for it!", time: "Tue 15:11" },
    ],
  },
  {
    id: "cv-4", salonId: "form-studio", salonName: "FORM Studio", avatar: "FS",
    lastMessage: "Your class pack expires in 2 weeks — 3 classes left.", time: "Mon", unread: 0,
    messages: [
      { id: "m-10", from: "them", text: "Your class pack expires in 2 weeks — 3 classes left.", time: "Mon 09:00" },
    ],
  },
];

export const getConversation = (id: string) => conversations.find((c) => c.id === id);

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type NotificationKind = "booking" | "social" | "promo" | "payment";

export interface ClientNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  salonId?: string;
}

export const clientNotifications: ClientNotification[] = [
  { id: "n-1", kind: "booking", title: "Booking confirmed", body: "Skin fade with Marco P. — Tue 16 Jun, 15:30 at Village Barbers.", time: "10m", unread: true, salonId: "village-barbers" },
  { id: "n-2", kind: "social", title: "Luna Hair Studio posted", body: "Honey balayage on a dark base — four hours, zero regrets.", time: "4h", unread: true, salonId: "luna-hair" },
  { id: "n-3", kind: "promo", title: "Last spot tonight", body: "FORM Studio: one spot left in 18:30 reformer flow.", time: "5h", unread: true, salonId: "form-studio" },
  { id: "n-4", kind: "social", title: "Maya R. liked your post", body: "Fresh balayage day ✨", time: "1d", unread: false },
  { id: "n-5", kind: "payment", title: "Receipt", body: "£55.00 paid to Luna Hair Studio — Cut & blow dry.", time: "2w", unread: false, salonId: "luna-hair" },
  { id: "n-6", kind: "booking", title: "Reminder", body: "Reformer pilates tomorrow at 18:30. Bring grip socks!", time: "1d", unread: false, salonId: "form-studio" },
];

/* ------------------------------------------------------------------ */
/* Current user                                                        */
/* ------------------------------------------------------------------ */

export interface UserPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  taggedSalonId?: string;
  taggedSalonName?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export const clientUser = {
  name: "Emma Carter",
  handle: "@emmacarter",
  initials: "EC",
  location: "Sunningdale, Ascot",
  bio: "Trying every salon in Berkshire so you don't have to ✂️✨",
  followingCount: 23,
  followersCount: 148,
  posts: [
    { id: "up-1", image: photo(1), caption: "Fresh balayage day ✨ thank you @lunahairstudio", likes: 64, comments: 9, timeAgo: "2w", taggedSalonId: "luna-hair", taggedSalonName: "Luna Hair Studio" },
    { id: "up-2", image: photo(4), caption: "The chop! No regrets.", likes: 41, comments: 6, timeAgo: "1mo", taggedSalonId: "luna-hair", taggedSalonName: "Luna Hair Studio" },
    { id: "up-3", image: photo(3), caption: "Alfie post-adventure 🐾", likes: 88, comments: 12, timeAgo: "1mo", taggedSalonId: "paws-walks", taggedSalonName: "Paws & Paths" },
  ] as UserPost[],
  savedPostIds: ["fd-1"],
  followingSalonIds: ["village-barbers", "paws-walks"],
  wallet: {
    balance: "£20.00",
    loyaltyPoints: 340,
    tier: "Gold",
    transactions: [
      { id: "wt-1", label: "Referral credit", date: "1 Jun 2026", amount: "+£10.00" },
      { id: "wt-2", label: "Cancelled booking refund", date: "4 May 2026", amount: "+£10.00" },
    ],
  },
  memberships: [
    { id: "mb-1", salonId: "form-studio", salonName: "FORM Studio", name: "Class pack ×10", detail: "3 of 10 classes left · Expires 28 Jun", kind: "bundle" as OfferType },
    { id: "mb-2", salonId: "paws-walks", salonName: "Paws & Paths", name: "Weekday walks", detail: "Renews 1 Jul · £70/week", kind: "subscription" as OfferType },
  ],
  paymentMethods: [
    { id: "pm-1", brand: "Visa", last4: "4242", expiry: "08/27", isDefault: true },
    { id: "pm-2", brand: "Apple Pay", last4: "", expiry: "", isDefault: false },
  ] as PaymentMethod[],
  details: {
    email: "emma.carter@gmail.com",
    phone: "+44 7700 900123",
    birthday: "14 March 1996",
    address: "8 Larch Avenue, Sunningdale",
  },
};
