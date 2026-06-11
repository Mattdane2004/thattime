import { create } from "zustand";

export type AuthMethod = "apple" | "google" | "facebook" | "email" | null;
export type Mode = "business" | "client" | null;
export type AccountType = "owner" | "staff" | null;
export type Audience = "owner" | "staff" | "client" | "";
export type TeamSize = "solo" | "2-5" | "6-10" | "11+" | "";
export type StaffSetupIntent = "invite_now" | "invite_later" | "not_yet" | "unsure" | "";
export type Vertical =
  | "Hair Salon"
  | "Barbershop"
  | "Nails"
  | "Beauty"
  | "Spa"
  | "Wellness"
  | "Fitness"
  | "Other"
  | "";
export type ComingFrom =
  | "Fresha"
  | "Booksy"
  | "Square"
  | "GlossGenius"
  | "Treatwell"
  | "Pen & paper"
  | "Instagram DMs"
  | "Just starting out"
  | "Something else"
  | "";
export type BookingVolume = "starting" | "1-10" | "11-30" | "31+" | "";
export type LocationType = "shop" | "mobile" | "home" | "multiple" | "virtual" | "";
export type WorkModel = Exclude<LocationType, "">;

export type OnboardingData = {
  authMethod: AuthMethod;
  email: string;
  phone: string;
  inviteCode: string;
  firstName: string;
  photoAdded: boolean;
  mode: Mode;
  accountType: AccountType;
  audience: Audience;
  joinCode: string;
  joinedBusinessName: string;
  joinedManagerName: string;
  joinedStaffFirstName: string;
  joinedStaffEmail: string;
  joinedStaffRole: string;
  joinedStaffStartDate: string;
  joinedStaffWorkingDays: string[];
  joinedStaffWorkingStart: string;
  joinedStaffWorkingEnd: string;
  staffPassword: string;
  staffPhotoDataUrl: string;
  staffBreakReminders: boolean;
  teamSize: TeamSize;
  staffSetupIntent: StaffSetupIntent;
  vertical: Vertical;
  businessName: string;
  businessTypes: Exclude<Vertical, "">[];
  primaryBusinessType: Vertical;
  locationType: LocationType;
  primaryLocation: string;
  serviceArea: string;
  addMoreLocationsLater: boolean;
  baseAddress: string;
  publicArea: string;
  hideFullAddressUntilBooking: boolean;
  travelRadius: string;
  travelFee: string;
  workModels: WorkModel[];
  primaryWorkModel: LocationType;
  showExactAddressLater: boolean;
  comingFrom: ComingFrom;
  goals: string[];
  bookingVolume: BookingVolume;
  location: string;
  termsAccepted: boolean;
  marketingOptIn: boolean;
  pendingClientBooking: string;
};

type OnboardingActions = {
  setField: <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K],
  ) => void;
  toggleGoal: (goal: string) => void;
  toggleBusinessType: (businessType: Exclude<Vertical, "">) => void;
  setPrimaryBusinessType: (businessType: Exclude<Vertical, "">) => void;
  toggleWorkModel: (workModel: WorkModel) => void;
  setPrimaryWorkModel: (workModel: WorkModel) => void;
  reset: () => void;
};

const initialState: OnboardingData = {
  authMethod: null,
  email: "",
  phone: "",
  inviteCode: "",
  firstName: "",
  photoAdded: false,
  mode: null,
  accountType: null,
  audience: "",
  joinCode: "",
  joinedBusinessName: "",
  joinedManagerName: "",
  joinedStaffFirstName: "",
  joinedStaffEmail: "",
  joinedStaffRole: "",
  joinedStaffStartDate: "",
  joinedStaffWorkingDays: [],
  joinedStaffWorkingStart: "09:00",
  joinedStaffWorkingEnd: "18:00",
  staffPassword: "",
  staffPhotoDataUrl: "",
  staffBreakReminders: true,
  teamSize: "",
  staffSetupIntent: "",
  vertical: "",
  businessName: "",
  businessTypes: [],
  primaryBusinessType: "",
  locationType: "",
  primaryLocation: "",
  serviceArea: "",
  addMoreLocationsLater: true,
  baseAddress: "",
  publicArea: "",
  hideFullAddressUntilBooking: false,
  travelRadius: "",
  travelFee: "",
  workModels: [],
  primaryWorkModel: "",
  showExactAddressLater: false,
  comingFrom: "",
  goals: [],
  bookingVolume: "",
  location: "",
  termsAccepted: false,
  marketingOptIn: true,
  pendingClientBooking: "",
};

export const useOnboardingStore = create<OnboardingData & OnboardingActions>(
  (set) => ({
    ...initialState,
    setField: (key, value) => set({ [key]: value }),
    toggleGoal: (goal) =>
      set((state) => ({
        goals: state.goals.includes(goal)
          ? state.goals.filter((item) => item !== goal)
          : [...state.goals, goal],
      })),
    toggleBusinessType: (businessType) =>
      set((state) => {
        const exists = state.businessTypes.includes(businessType);
        const businessTypes = exists
          ? state.businessTypes.filter((item) => item !== businessType)
          : [...state.businessTypes, businessType];
        const primaryBusinessType = businessTypes.includes(
          state.primaryBusinessType as Exclude<Vertical, "">,
        )
          ? state.primaryBusinessType
          : businessTypes[0] ?? "";

        return {
          businessTypes,
          primaryBusinessType,
          vertical: primaryBusinessType,
        };
      }),
    setPrimaryBusinessType: (businessType) =>
      set((state) => ({
        primaryBusinessType: businessType,
        vertical: businessType,
        businessTypes: state.businessTypes.includes(businessType)
          ? state.businessTypes
          : [businessType, ...state.businessTypes],
      })),
    toggleWorkModel: (workModel) =>
      set((state) => {
        const exists = state.workModels.includes(workModel);
        const workModels = exists
          ? state.workModels.filter((item) => item !== workModel)
          : [...state.workModels, workModel];
        const primaryWorkModel = workModels.includes(state.primaryWorkModel as WorkModel)
          ? state.primaryWorkModel
          : workModels[0] ?? "";

        return {
          workModels,
          primaryWorkModel,
          locationType: primaryWorkModel,
        };
      }),
    setPrimaryWorkModel: (workModel) =>
      set((state) => ({
        primaryWorkModel: workModel,
        locationType: workModel,
        workModels: state.workModels.includes(workModel)
          ? state.workModels
          : [workModel, ...state.workModels],
      })),
    reset: () => set(initialState),
  }),
);
