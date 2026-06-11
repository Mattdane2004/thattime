import type {
  BookingVolume,
  ComingFrom,
  OnboardingData,
  TeamSize,
  Vertical,
} from "./store";

export type PricingTier = {
  key: TeamSize | "solo";
  label: string;
  price: number | null;
  blurb: string;
  isCustom: boolean;
};

export function getPricingTier(teamSize: TeamSize): PricingTier {
  switch (teamSize) {
    case "2-5":
      return {
        key: "2-5",
        label: "Team",
        price: 59,
        blurb: "Up to 5 people on the team.",
        isCustom: false,
      };
    case "6-10":
      return {
        key: "6-10",
        label: "Studio",
        price: 89,
        blurb: "Up to 10 people on the team.",
        isCustom: false,
      };
    case "11+":
      return {
        key: "11+",
        label: "Large team",
        price: null,
        blurb: "We tailor the plan to fit larger teams.",
        isCustom: true,
      };
    case "solo":
    case "":
    default:
      return {
        key: "solo",
        label: "Solo",
        price: 29,
        blurb: "Just you, running the show.",
        isCustom: false,
      };
  }
}

const teamMultiplier: Record<Exclude<TeamSize, "">, number> = {
  solo: 1,
  "2-5": 2.2,
  "6-10": 4,
  "11+": 6,
};

const averageTicketByVertical: Record<Exclude<Vertical, "">, number> = {
  "Hair Salon": 65,
  Barbershop: 25,
  Nails: 40,
  Beauty: 55,
  Spa: 80,
  Wellness: 60,
  Fitness: 35,
  Other: 50,
};

const bookingVolumeMidpoint: Record<Exclude<BookingVolume, "">, number> = {
  starting: 0,
  "1-10": 5,
  "11-30": 20,
  "31+": 45,
};

const recognisedPlatforms = [
  "Fresha",
  "Booksy",
  "Square",
  "GlossGenius",
  "Treatwell",
] as const;

export function isRecognisedPlatform(platform: ComingFrom) {
  return recognisedPlatforms.includes(platform as (typeof recognisedPlatforms)[number]);
}

export type VerticalTheme = {
  key: string;
  accent: string;
  accentSoft: string;
  label: string;
  people: string;
  place: string;
  object: string;
  setupLine: string;
  proof: string;
};

export function getVerticalTheme(vertical: Vertical): VerticalTheme {
  switch (vertical) {
    case "Barbershop":
      return {
        key: "barber",
        accent: "#0F1A2E",
        accentSoft: "#EFF2F7",
        label: "barbershop",
        people: "barbers",
        place: "shop",
        object: "chair",
        setupLine: "We will keep this feeling like your shop, not a generic salon.",
        proof: "A barbershop. Sharp — over 900 barbers are already running their chairs on That Time.",
      };
    case "Nails":
      return {
        key: "nails",
        accent: "#FB7185",
        accentSoft: "#FFF1F2",
        label: "nail business",
        people: "nail pros",
        place: "studio",
        object: "polish shelf",
        setupLine: "We will make the little details feel polished from the start.",
        proof: "Nails. Nice choice — hundreds of nail techs use That Time to keep repeat clients close.",
      };
    case "Spa":
    case "Wellness":
      return {
        key: "wellness",
        accent: "#10B981",
        accentSoft: "#ECFDF5",
        label: vertical === "Spa" ? "spa" : "wellness business",
        people: "wellness pros",
        place: "space",
        object: "treatment room",
        setupLine: "Breathe out, this will not take long.",
        proof: `A ${vertical.toLowerCase()} business. Calm — more than 700 wellness pros use That Time.`,
      };
    case "Hair Salon":
      return {
        key: "hair",
        accent: "#F59E0B",
        accentSoft: "#FFFBEB",
        label: "hair salon",
        people: "hair pros",
        place: "salon",
        object: "mirror",
        setupLine: "We will shape this around the way your salon actually works.",
        proof: "A hair salon. Lovely — over 1,200 hair pros use That Time.",
      };
    default:
      return {
        key: "general",
        accent: "#0F1A2E",
        accentSoft: "#F5F5F7",
        label: vertical ? vertical.toLowerCase() : "business",
        people: "business owners",
        place: "space",
        object: "front desk",
        setupLine: "We will shape the basics around how you work.",
        proof: `${vertical || "A service business"}. Great — That Time is built for teams like yours.`,
      };
  }
}

export function getResponseMoment(
  state: Pick<OnboardingData, "primaryBusinessType" | "goals" | "bookingVolume">,
  previousStep: "vertical" | "goals" | "volume",
) {
  if (previousStep === "vertical") {
    return getVerticalTheme(state.primaryBusinessType).proof;
  }

  if (previousStep === "goals") {
    if (state.goals.includes("Reduce no-shows")) {
      return "Reduce no-shows — good shout. SMS reminders cut these by about 40% on average.";
    }
    if (state.goals.includes("Save time on admin")) {
      return "Admin time adds up fast. Most owners get hours back once reminders and forms run themselves.";
    }
    return "Good picks. Most owners choose two or three things they want to make easier first.";
  }

  if (state.bookingVolume === "starting") {
    return "Exciting times. Most businesses your size double bookings in 6 months on That Time.";
  }

  return "That gives us enough to make the numbers feel useful, not made up.";
}

export function getMapPreviewLocation(
  state: Pick<OnboardingData, "baseAddress" | "primaryLocation" | "serviceArea" | "location">,
) {
  return (
    state.baseAddress.trim() ||
    state.primaryLocation.trim() ||
    state.serviceArea.trim() ||
    state.location.trim() ||
    "London, SW1A 1AA"
  );
}

export function getStorePreview(
  state: Pick<
    OnboardingData,
    | "businessName"
    | "primaryBusinessType"
    | "baseAddress"
    | "primaryWorkModel"
    | "workModels"
    | "locationType"
    | "primaryLocation"
    | "serviceArea"
  >,
) {
  const theme = getVerticalTheme(state.primaryBusinessType);
  const location = getMapPreviewLocation({
    baseAddress: state.baseAddress,
    primaryLocation: state.primaryLocation,
    serviceArea: state.serviceArea,
    location: "",
  });
  const workModel = state.primaryWorkModel || state.locationType;

  return {
    sign: state.businessName || "Your new store",
    theme,
    location,
    floorNote:
      workModel === "multiple"
        ? "Main location first, extras later."
        : workModel === "mobile"
          ? "Your route starts with one service area."
          : `${theme.object.charAt(0).toUpperCase()}${theme.object.slice(1)} ready.`,
  };
}

function commissionFor(platform: ComingFrom) {
  if (platform === "Fresha") return 0.2;
  if (platform === "Booksy" || platform === "Treatwell") return 0.25;
  if (platform === "Square") return 0.08;
  return 0;
}

function volumeBand(volume: BookingVolume) {
  if (volume === "31+") return "high";
  if (volume === "11-30") return "medium";
  return "low";
}

export function calculateSavings(state: OnboardingData) {
  const vertical = state.primaryBusinessType || state.vertical || "Other";
  const volume = state.bookingVolume || "starting";
  const averageTicket = averageTicketByVertical[vertical];
  const weeklyBookings = bookingVolumeMidpoint[volume];
  const monthlyGross = weeklyBookings * averageTicket * 4.3;
  const commission = commissionFor(state.comingFrom);
  const tier = getPricingTier(state.teamSize);
  const planFee = tier.price ?? 0;
  const monthlyCommission = Math.round((monthlyGross * commission) / 5) * 5;
  const moneySaved = Math.max(0, monthlyCommission - planFee);
  const band = volumeBand(volume);

  const baseHours = band === "high" ? 10 : band === "medium" ? 8 : 6;
  const baseSlots = band === "high" ? 8 : band === "medium" ? 5 : 2;
  const multiplier = teamMultiplier[(state.teamSize || "solo") as Exclude<TeamSize, "">];
  const hoursSaved = Math.round(baseHours * multiplier);
  const slotsFilled = Math.round(baseSlots * multiplier);
  const competitor =
    state.comingFrom && state.comingFrom !== "Something else"
      ? state.comingFrom
      : "other booking platforms";
  const fallbackCommissionLabel =
    state.comingFrom === "GlossGenius"
      ? "a flat-fee model"
      : state.comingFrom === "Pen & paper" ||
          state.comingFrom === "Instagram DMs" ||
          state.comingFrom === "Just starting out"
        ? "marketplace commission as you grow"
        : "commission";

  return {
    moneySaved,
    yearlySaved: moneySaved * 12,
    monthlyRevenue: Math.round(monthlyGross),
    monthlyCommission,
    planFee,
    hoursSaved,
    slotsFilled,
    competitor,
    commissionRate: commission,
    commissionLabel:
      commission > 0 ? `${Math.round(commission * 100)}% commission` : fallbackCommissionLabel,
  };
}
