import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, createHashRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import ErrorScreen from './components/ErrorScreen.jsx';

import ServicesList from './routes/ServicesList.jsx';
import Hub from './routes/Hub.jsx';
import Home from './routes/main/Home.jsx';
import Schedule from './routes/main/Schedule.jsx';
import Clients from './routes/main/Clients.jsx';
import ClientProfile from './routes/main/client/ClientProfile.jsx';
import ClientAppointments from './routes/main/client/ClientAppointments.jsx';
import ClientRecord from './routes/main/client/ClientRecord.jsx';
import ClientWallet from './routes/main/client/ClientWallet.jsx';
import ClientReviews from './routes/main/client/ClientReviews.jsx';
import ClientSettings from './routes/main/client/ClientSettings.jsx';
import ClientDetails from './routes/main/client/ClientDetails.jsx';
import Messages from './routes/main/Messages.jsx';
import Conversation from './routes/main/Conversation.jsx';
import Alerts from './routes/main/Alerts.jsx';
import RateClient from './routes/main/RateClient.jsx';
import Checkout from './routes/main/Checkout.jsx';
import SetupGuide from './routes/SetupGuide.jsx';
import ImportData from './routes/ImportData.jsx';
import Team, { StaffWallet, TeamMemberProfile } from './routes/Team.jsx';
import QuickAdd from './routes/team/QuickAdd.jsx';
import UpgradePlan from './routes/team/UpgradePlan.jsx';
import StaffView from './routes/team/StaffView.jsx';
import GuidedSetup from './routes/team/GuidedSetup.jsx';
import Marketing from './routes/Marketing.jsx';
import ClientView from './routes/ClientView.jsx';
import Stub from './routes/Stub.jsx';
import TypeSelector from './routes/TypeSelector.jsx';
import Basics from './routes/wizard/Basics.jsx';
import Locations from './routes/wizard/Locations.jsx';
import ScheduleLocation from './routes/wizard/ScheduleLocation.jsx';
import ClassLocation from './routes/wizard/ClassLocation.jsx';
import ClassRemoteSetup from './routes/wizard/ClassRemoteSetup.jsx';
import ClassScheduleWizard from './routes/wizard/ClassSchedule.jsx';
import ClassScheduleTimes from './routes/wizard/ClassScheduleTimes.jsx';
import ClassParticipants from './routes/wizard/ClassParticipants.jsx';
import Staff from './routes/wizard/Staff.jsx';
import Price from './routes/wizard/Price.jsx';
import ClassDetails from './routes/wizard/ClassDetails.jsx';
import ClassStaff from './routes/wizard/ClassStaff.jsx';
import BundleServices from './routes/wizard/BundleServices.jsx';
import BundleOrderGaps from './routes/wizard/BundleOrderGaps.jsx';
import BundlePricing from './routes/wizard/BundlePricing.jsx';
import SubscriptionType from './routes/wizard/SubscriptionType.jsx';
import SubscriptionBenefits from './routes/wizard/SubscriptionBenefits.jsx';
import SubscriptionBilling from './routes/wizard/SubscriptionBilling.jsx';
import FrequencySessions from './routes/wizard/FrequencySessions.jsx';
import FrequencyBilling from './routes/wizard/FrequencyBilling.jsx';
import Dashboard from './routes/Dashboard.jsx';
import ClassDashboard from './routes/ClassDashboard.jsx';
import BundleDashboard from './routes/BundleDashboard.jsx';
import SubscriptionDashboard from './routes/SubscriptionDashboard.jsx';
import ServicePreview from './routes/ServicePreview.jsx';
import PhotoGallery from './routes/PhotoGallery.jsx';

import VariantsOverview from './routes/modules/Variants/Overview.jsx';
import DurationEditor from './routes/modules/Variants/editors/DurationEditor.jsx';
import TimeEditor from './routes/modules/Variants/editors/TimeEditor.jsx';
import StaffVariantList from './routes/modules/Variants/editors/StaffList.jsx';
import LocationVariantList from './routes/modules/Variants/editors/LocationList.jsx';
import ProductsList from './routes/modules/Products/List.jsx';
import ProductsEditor from './routes/modules/Products/Editor.jsx';
import ProductsPicker from './routes/modules/Products/Picker.jsx';
import CatalogProducts from './routes/CatalogProducts.jsx';
import RelatedList from './routes/modules/RelatedServices/List.jsx';
import GroupWizard from './routes/modules/RelatedServices/GroupWizard.jsx';
import GroupEditor from './routes/modules/RelatedServices/GroupEditor.jsx';
import ResourcesOverview from './routes/modules/Resources/Overview.jsx';
import RoomPicker from './routes/modules/Resources/RoomPicker.jsx';
import EquipmentPicker from './routes/modules/Resources/EquipmentPicker.jsx';
import CatalogResources from './routes/CatalogResources.jsx';
import FormsList from './routes/modules/Forms/List.jsx';
import FormsSelection from './routes/modules/Forms/Selection.jsx';
import CatalogForms from './routes/CatalogForms.jsx';
import ServiceSettings from './routes/modules/ServiceSettings.jsx';
import ServiceLocations from './routes/modules/ServiceLocations.jsx';
import ServiceStaff from './routes/modules/ServiceStaff.jsx';
import ClassSchedule from './routes/modules/Offers/ClassSchedule.jsx';
import ClassTickets from './routes/modules/Offers/ClassTickets.jsx';
import ClassSessionPacks from './routes/modules/Offers/ClassSessionPacks.jsx';
import AdvancedSectionStub from './routes/modules/Offers/AdvancedSectionStub.jsx';
import BookingsAttendees from './routes/modules/Classes/BookingsAttendees.jsx';
import ModelsPracticeClients from './routes/modules/Classes/ModelsPracticeClients.jsx';
import Certificates from './routes/modules/Classes/Certificates.jsx';
import CourseMaterials from './routes/modules/Classes/CourseMaterials.jsx';
import AgendaSyllabus from './routes/modules/Classes/AgendaSyllabus.jsx';
import EquipmentBring from './routes/modules/Classes/EquipmentBring.jsx';
import PricingTiers from './routes/modules/Offers/PricingTiers.jsx';
import Requirements from './routes/modules/Offers/Requirements.jsx';
import Visibility from './routes/modules/Offers/Visibility.jsx';
import OnlineLink from './routes/modules/Offers/OnlineLink.jsx';
import BookingRules from './routes/modules/Offers/BookingRules.jsx';
import BundleIncluded from './routes/modules/Offers/BundleIncluded.jsx';
import BundlePricingAdvanced from './routes/modules/Offers/BundlePricing.jsx';
import SubscriptionBenefitsAdvanced from './routes/modules/Offers/SubscriptionBenefits.jsx';
import SubscriptionRules from './routes/modules/Offers/SubscriptionRules.jsx';
import NotificationsList from './routes/Notifications/List.jsx';
import NotificationEditor from './routes/Notifications/Editor.jsx';
import ServiceNotificationsList from './routes/modules/Notifications/List.jsx';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorScreen />,
    children: [
      { index: true, element: <Home /> },
      { path: 'hub', element: <Hub /> },
      { path: 'schedule', element: <Schedule /> },
      { path: 'clients', element: <Clients /> },
      { path: 'clients/:clientId', element: <ClientProfile /> },
      { path: 'clients/:clientId/appointments', element: <ClientAppointments /> },
      { path: 'clients/:clientId/record', element: <ClientRecord /> },
      { path: 'clients/:clientId/wallet', element: <ClientWallet /> },
      { path: 'clients/:clientId/reviews', element: <ClientReviews /> },
      { path: 'clients/:clientId/settings', element: <ClientSettings /> },
      { path: 'clients/:clientId/details', element: <ClientDetails /> },
      { path: 'messages', element: <Messages /> },
      { path: 'messages/:conversationId', element: <Conversation /> },
      { path: 'alerts', element: <Alerts /> },
      { path: 'review-client', element: <RateClient /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'setup', element: <SetupGuide /> },
      { path: 'setup/import', element: <ImportData /> },
      { path: 'services', element: <ServicesList /> },
      { path: 'team', element: <Team /> },
      { path: 'team/new', element: <QuickAdd /> },
      { path: 'team/upgrade', element: <UpgradePlan /> },
      { path: 'team/:memberId', element: <TeamMemberProfile /> },
      { path: 'team/:memberId/setup', element: <GuidedSetup /> },
      { path: 'staff', element: <StaffView /> },
      { path: 'wallet', element: <StaffWallet /> },
      { path: 'notifications', element: <NotificationsList /> },
      { path: 'notifications/new', element: <NotificationEditor /> },
      { path: 'notifications/:id', element: <NotificationEditor /> },
      { path: 'marketing', element: <Marketing /> },
      { path: 'b2c', element: <ClientView /> },
      { path: 'soon/:slug', element: <Stub /> },
      { path: 'new', element: <TypeSelector /> },
      { path: 'new/service', element: <Navigate to="/new/basics?type=service" replace /> },
      { path: 'new/class', element: <Navigate to="/new/basics?type=class" replace /> },
      { path: 'new/bundle', element: <Navigate to="/new/basics?type=bundle" replace /> },
      { path: 'new/subscription', element: <Navigate to="/new/basics?type=subscription" replace /> },
      { path: 'new/basics', element: <Basics /> },
      { path: 'new/locations', element: <Locations /> },
      { path: 'new/schedule-location', element: <ScheduleLocation /> },
      { path: 'new/class-location',     element: <ClassLocation /> },
      { path: 'new/class-schedule',     element: <ClassScheduleWizard /> },
      { path: 'new/class-schedule-times', element: <ClassScheduleTimes /> },
      { path: 'new/class-participants', element: <ClassParticipants /> },
      { path: 'new/staff', element: <Staff /> },
      { path: 'new/class-details', element: <ClassDetails /> },
      { path: 'new/class-staff', element: <ClassStaff /> },
      { path: 'new/price', element: <Price /> },
      { path: 'new/bundle-services', element: <BundleServices /> },
      { path: 'new/bundle-order', element: <BundleOrderGaps /> },
      { path: 'new/bundle-pricing', element: <BundlePricing /> },
      { path: 'new/subscription-type', element: <SubscriptionType /> },
      { path: 'new/subscription-benefits', element: <SubscriptionBenefits /> },
      { path: 'new/subscription-billing', element: <SubscriptionBilling /> },
      { path: 'new/frequency-sessions', element: <FrequencySessions /> },
      { path: 'new/frequency-billing', element: <FrequencyBilling /> },
      { path: 'service', element: <Dashboard /> },
      { path: 'class', element: <ClassDashboard /> },
      { path: 'bundle', element: <BundleDashboard /> },
      { path: 'subscription', element: <SubscriptionDashboard /> },
      { path: 'class/staff', element: <ClassStaff /> },
      { path: 'class/location', element: <ClassLocation /> },
      { path: 'class/remote', element: <ClassRemoteSetup /> },
      { path: 'class/schedule', element: <ClassScheduleWizard /> },
      { path: 'class/schedule-times', element: <ClassScheduleTimes /> },
      { path: 'class/attendees', element: <ClassParticipants /> },
      { path: 'class/pricing', element: <Price /> },
      { path: 'class/session-packs', element: <ClassSessionPacks /> },
      { path: 'class/bookings', element: <BookingsAttendees /> },
      { path: 'class/agenda', element: <AgendaSyllabus /> },
      { path: 'class/models', element: <ModelsPracticeClients /> },
      { path: 'class/materials', element: <CourseMaterials /> },
      { path: 'class/certificates', element: <Certificates /> },
      { path: 'class/requirements', element: <Requirements /> },
      { path: 'class/equipment', element: <EquipmentBring /> },
      { path: 'class/forms', element: <FormsList /> },
      { path: 'class/forms/select', element: <FormsSelection /> },
      { path: 'class/resources', element: <ResourcesOverview /> },
      { path: 'class/resources/add-room', element: <RoomPicker /> },
      { path: 'class/resources/add-equipment', element: <EquipmentPicker /> },
      { path: 'class/products', element: <ProductsList /> },
      { path: 'class/products/picker', element: <ProductsPicker /> },
      { path: 'class/products/:id', element: <ProductsEditor /> },
      { path: 'class/notifications', element: <ServiceNotificationsList /> },
      { path: 'class/settings', element: <ServiceSettings /> },
      { path: 'class/visibility', element: <Visibility /> },
      { path: 'class/photos', element: <PhotoGallery /> },
      { path: 'class/preview', element: <ServicePreview /> },
      { path: 'bundle/included', element: <BundleIncluded /> },
      { path: 'bundle/services', element: <BundleServices /> },
      { path: 'bundle/order', element: <BundleOrderGaps /> },
      { path: 'bundle/pricing', element: <BundlePricing /> },
      { path: 'bundle/forms', element: <FormsList /> },
      { path: 'bundle/forms/select', element: <FormsSelection /> },
      { path: 'bundle/resources', element: <ResourcesOverview /> },
      { path: 'bundle/resources/add-room', element: <RoomPicker /> },
      { path: 'bundle/resources/add-equipment', element: <EquipmentPicker /> },
      { path: 'bundle/settings', element: <ServiceSettings /> },
      { path: 'bundle/preview', element: <ServicePreview /> },
      { path: 'subscription/benefits', element: <SubscriptionBenefitsAdvanced /> },
      { path: 'subscription/rules', element: <SubscriptionRules /> },
      { path: 'subscription/frequency-sessions', element: <FrequencySessions /> },
      { path: 'subscription/frequency-billing', element: <FrequencyBilling /> },
      { path: 'subscription/forms', element: <FormsList /> },
      { path: 'subscription/forms/select', element: <FormsSelection /> },
      { path: 'subscription/notifications', element: <ServiceNotificationsList /> },
      { path: 'subscription/settings', element: <ServiceSettings /> },
      { path: 'subscription/visibility', element: <Visibility /> },
      { path: 'subscription/preview', element: <ServicePreview /> },
      { path: 'service/preview', element: <ServicePreview /> },
      { path: 'service/photos', element: <PhotoGallery /> },

      { path: 'service/variants', element: <VariantsOverview /> },
      { path: 'service/variants/duration/:id', element: <DurationEditor /> },
      { path: 'service/variants/time/:id', element: <TimeEditor /> },
      { path: 'service/variants/staff', element: <StaffVariantList /> },
      { path: 'service/variants/location', element: <LocationVariantList /> },

      { path: 'service/products', element: <ProductsList /> },
      { path: 'service/products/picker', element: <ProductsPicker /> },
      { path: 'service/products/:id', element: <ProductsEditor /> },

      { path: 'products', element: <CatalogProducts /> },

      { path: 'service/related', element: <RelatedList /> },
      { path: 'service/related/new', element: <GroupWizard /> },
      { path: 'service/related/:id', element: <GroupEditor /> },

      { path: 'service/resources', element: <ResourcesOverview /> },
      { path: 'service/resources/add-room', element: <RoomPicker /> },
      { path: 'service/resources/add-equipment', element: <EquipmentPicker /> },

      { path: 'resources', element: <CatalogResources /> },

      { path: 'service/forms', element: <FormsList /> },
      { path: 'service/forms/select', element: <FormsSelection /> },
      { path: 'service/notifications', element: <ServiceNotificationsList /> },

      { path: 'forms', element: <CatalogForms /> },

      { path: 'service/settings', element: <ServiceSettings /> },

      { path: 'service/locations', element: <ServiceLocations /> },
      { path: 'service/staff', element: <ServiceStaff /> },
      { path: 'service/class-schedule', element: <ClassSchedule /> },
      { path: 'service/class-tickets', element: <ClassTickets /> },
      { path: 'service/session-packs', element: <ClassSessionPacks /> },
      // Class advanced sections — rendered as direct rows under the "Advanced"
      // group on the class dashboard. Each section gets its own dedicated screen.
      { path: 'service/pricing-tiers',       element: <PricingTiers /> },
      { path: 'service/additional-staff',    element: <AdvancedSectionStub /> },
      { path: 'service/booking-rules',       element: <BookingRules /> },
      { path: 'service/requirements',        element: <Requirements /> },
      { path: 'service/visibility',          element: <Visibility /> },
      { path: 'service/online-link',         element: <OnlineLink /> },
      { path: 'service/class-forms',         element: <AdvancedSectionStub /> },
      { path: 'service/class-notifications', element: <AdvancedSectionStub /> },
      { path: 'service/bundle-included', element: <BundleIncluded /> },
      { path: 'service/bundle-order', element: <BundleOrderGaps /> },
      { path: 'service/bundle-pricing', element: <BundlePricingAdvanced /> },
      { path: 'service/subscription-benefits', element: <SubscriptionBenefitsAdvanced /> },
      { path: 'service/subscription-rules', element: <SubscriptionRules /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
