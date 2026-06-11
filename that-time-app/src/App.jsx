import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PhoneFrame from './components/PhoneFrame';
import MainActions from './components/sheets/MainActions';
import { defaultMobileProfile } from './data/business';
import { emptyServiceSettings } from './data/businessDefaults';
import { defaultCategories } from './data/categories';
import { demoNotifications } from './data/demoNotifications';
import { staff as initialTeamMembers } from './data/staff';
import { demoTeamRequests } from './data/requests';
import {
  emptyBundleDetails,
  emptyClassDetails,
  emptySubscriptionDetails,
} from './data/offerTypes';
import { emptyAdvancedOptions } from './data/advancedOptions';

const emptyDraft = {
  id: 'draft_service',
  type: null,
  name: '',
  category: '',
  description: '',
  iconKey: null,
  photos: [],
  locations: {
    inSalon: { enabled: false, locationIds: [] },
    mobile: { enabled: false, ...defaultMobileProfile },
    remote: { enabled: false, platforms: [] },
  },
  staff: [],
  leadInstructor: null,
  price: '',
  durationMin: 60,
  depositEnabled: false,
  depositType: 'fixed',
  depositAmount: '',
  status: 'draft',
  variants: [],
  ticketTypes: [],
  sessionPacks: [],
  products: [],
  related: [],
  resources: [],
  forms: [],
  settings: emptyServiceSettings(),
  notifications: [],
  classDetails: emptyClassDetails(),
  bundleDetails: emptyBundleDetails(),
  subscriptionDetails: emptySubscriptionDetails(),
  advancedOptions: emptyAdvancedOptions(),
};

export default function App() {
  const [draft, setDraft] = useState(emptyDraft);
  const [savedOffers, setSavedOffers] = useState([]);
  const [notifications, setNotifications] = useState(demoNotifications);
  const [categories, setCategories] = useState(defaultCategories);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);

  const updateDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const resetDraft = () => setDraft(emptyDraft);
  const upsertSavedOffer = (offer) =>
    setSavedOffers((offers) => {
      const id = offer.id || `${offer.type || 'offer'}_${Date.now()}`;
      const next = { ...offer, id };
      return offers.some((item) => item.id === id)
        ? offers.map((item) => (item.id === id ? next : item))
        : [next, ...offers];
    });
  const updateNotification = (id, patch) =>
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const addCategory = (name, color) =>
    setCategories((cs) => (cs.some((c) => c.name === name) ? cs : [...cs, { name, color }]));
  const updateTeamMember = (id, patch) =>
    setTeamMembers((members) =>
      members.map((member) => {
        if (member.id !== id) return member;
        const next = typeof patch === 'function' ? patch(member) : patch;
        return { ...member, ...next };
      }),
    );
  const addTeamMember = (member) =>
    setTeamMembers((members) => [member, ...members]);
  const [teamRequests, setTeamRequests] = useState(demoTeamRequests);
  const updateTeamRequest = (id, patch) =>
    setTeamRequests((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const addTeamRequest = (request) =>
    setTeamRequests((items) => [{ id: `req_${Date.now().toString(36)}`, status: 'pending', ...request }, ...items]);

  return (
    <PhoneFrame>
      <MainActions>
      <Outlet
        context={{
          draft,
          setDraft,
          updateDraft,
          resetDraft,
          savedOffers,
          upsertSavedOffer,
          notifications,
          setNotifications,
          updateNotification,
          categories,
          addCategory,
          teamMembers,
          setTeamMembers,
          updateTeamMember,
          addTeamMember,
          teamRequests,
          updateTeamRequest,
          addTeamRequest,
        }}
      />
      </MainActions>
    </PhoneFrame>
  );
}
