import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import { emptyClassDetails, wizardTotalForDraft } from '../../data/offerTypes';
import {
  deliveryTargets,
  hasValidStaff,
  isPrivateGroupClass,
  isSeatBasedClass,
  privateStaffIdsFor,
  publicStaffIdsFor,
} from '../../data/classFlow';
import { activeStaffList, initialsFor, instructorsList, staff as fallbackStaff } from '../../data/staff';

export default function ClassStaff() {
  const navigate = useNavigate();
  const route = useLocation();
  const { draft, updateDraft, teamMembers = fallbackStaff } = useOutletContext();
  const isDashboardEdit = route.pathname === '/class/staff';
  const [sheetTarget, setSheetTarget] = useState(null);
  const details = draft.classDetails || emptyClassDetails();
  const targets = deliveryTargets(draft, isPrivateGroupClass(details) ? 'private' : 'public');
  const instructors = instructorsList(teamMembers);
  const activeStaff = activeStaffList(teamMembers);
  const canContinue = hasValidStaff(draft);

  const updateClass = (patch) => updateDraft({ classDetails: { ...details, ...patch } });
  const updateAssignments = (staffAssignments) => updateClass({ staffAssignments });
  const setAssignment = (targetId, patch) => {
    updateAssignments({
      ...(details.staffAssignments || {}),
      [targetId]: { ...(details.staffAssignments?.[targetId] || {}), ...patch },
    });
  };

  const togglePrivateStaff = (id) => {
    const current = privateStaffIdsFor(draft, 'private');
    setAssignment('private', {
      privateStaffIds: current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    });
  };

  const setPublicStaff = (targetId, selectedIds) => {
    setAssignment(targetId, {
      leadInstructorId: selectedIds[0] || '',
      publicStaffIds: selectedIds,
    });
  };

  const togglePublicStaff = (targetId, staffId) => {
    const current = publicStaffIdsFor(draft, targetId);
    const next = current.includes(staffId)
      ? current.filter((item) => item !== staffId)
      : [...current, staffId];
    setPublicStaff(targetId, next);
  };

  const staffOptions = instructors.length ? instructors : activeStaff;
  const activeTarget = sheetTarget === 'private'
    ? { id: 'private', label: 'Eligible staff', desc: 'Private group class' }
    : targets.find((target) => target.id === sheetTarget);
  const selectedIdsForSheet = sheetTarget === 'private'
    ? privateStaffIdsFor(draft, 'private')
    : sheetTarget
      ? publicStaffIdsFor(draft, sheetTarget)
      : [];

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate(isDashboardEdit ? '/class' : '/new/class-location')}
        rightAction={<HelpTrigger helpKey="staff" />}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[28px] leading-tight font-semibold tracking-tight">{titleFor(details)}</div>
          <div className="text-[14px] text-gray-500 mt-1">{descriptionFor(details)}</div>
        </div>

        <div className="space-y-6 pb-6">
          {isPrivateGroupClass(details) && (
            <PrivateStaffSection
              details={details}
              staff={staffOptions}
              selectedIds={privateStaffIdsFor(draft, 'private')}
              onOpen={() => setSheetTarget('private')}
            />
          )}

          {isSeatBasedClass(details) && (
            <SingleSessionStaffSection
              targets={targets}
              instructors={staffOptions}
              draft={draft}
              onOpen={setSheetTarget}
            />
          )}
        </div>
      </div>

      <WizardFooter
        step={6}
        total={wizardTotalForDraft(draft)}
        onBack={() => navigate(isDashboardEdit ? '/class' : '/new/class-location')}
        onNext={() => navigate(isDashboardEdit ? '/class' : '/new/price')}
        nextLabel={isDashboardEdit ? 'Done' : 'Next'}
        nextDisabled={!canContinue}
      />

      <BottomSheet
        open={Boolean(sheetTarget)}
        onClose={() => setSheetTarget(null)}
        title={activeTarget?.label || 'Choose staff'}
        footer={
          <button
            onClick={() => setSheetTarget(null)}
            className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Done
          </button>
        }
      >
        <div className="space-y-2">
          <div className="text-[13px] text-gray-500 leading-snug pb-1">
            {isPrivateGroupClass(details)
              ? 'Select everyone who can deliver this private booking.'
              : 'Select one or more instructors for this location.'}
          </div>
          {staffOptions.map((member) => (
            <StaffRow
              key={member.id}
              member={member}
              active={selectedIdsForSheet.includes(member.id)}
              onClick={() => sheetTarget === 'private' ? togglePrivateStaff(member.id) : togglePublicStaff(sheetTarget, member.id)}
            />
          ))}
        </div>
      </BottomSheet>
    </>
  );
}

function PrivateStaffSection({ staff, selectedIds, onOpen }) {
  return (
    <section>
      <StaffAssignmentCard
        title="Eligible staff"
        desc="Private group booking"
        selectedMembers={staff.filter((member) => selectedIds.includes(member.id))}
        onOpen={onOpen}
      />
    </section>
  );
}

function SingleSessionStaffSection({ targets, instructors, draft, onOpen }) {
  if (targets.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 p-4 text-[13px] text-gray-500">
        Add a delivery method before assigning staff.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {targets.map((target) => {
        const selectedIds = publicStaffIdsFor(draft, target.id);
        return (
          <StaffAssignmentCard
            key={target.id}
            title={target.label}
            desc={target.desc}
            selectedMembers={instructors.filter((member) => selectedIds.includes(member.id))}
            onOpen={() => onOpen(target.id)}
          />
        );
      })}
    </section>
  );
}

function StaffAssignmentCard({ title, desc, selectedMembers, onOpen }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium text-gray-900 truncate">{title}</div>
          <div className="text-[12px] text-gray-500 mt-0.5 truncate">{desc}</div>
        </div>
        <button
          onClick={onOpen}
          className="h-9 px-3 rounded-full bg-white text-[12px] font-medium text-gray-900 flex items-center gap-1.5 shrink-0"
        >
          {selectedMembers.length ? `${selectedMembers.length} selected` : 'Choose staff'}
          <ChevronRight size={14} className="text-gray-400" strokeWidth={1.8} />
        </button>
      </div>
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <StaffChip key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

function StaffRow({ member, active, onClick }) {
  return (
    <button onClick={onClick} className="w-full rounded-2xl bg-gray-50 hover:bg-gray-100 px-4 py-3 flex items-center gap-3 text-left">
      <Avatar member={member} />
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-medium text-gray-900 truncate">{member.name}</span>
        <span className="block text-[12px] text-gray-500 truncate">{member.role}</span>
      </span>
      <span className={'w-6 h-6 rounded-full flex items-center justify-center shrink-0 ' + (active ? 'bg-gray-900 text-white' : 'bg-white text-gray-300')}>
        {active && <Check size={14} strokeWidth={2.2} />}
      </span>
    </button>
  );
}

function StaffChip({ member }) {
  return (
    <span className="bg-white rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-2">
      <Avatar member={member} small />
      <span className="text-[12px] text-gray-700">{member.name}</span>
    </span>
  );
}

function Avatar({ member, small = false }) {
  return (
    <span className={'rounded-full flex items-center justify-center font-semibold shrink-0 ' + (small ? 'w-6 h-6 text-[10px] ' : 'w-10 h-10 text-[12px] ') + (member.avatarColor || 'bg-gray-200 text-gray-700')}>
      {initialsFor(member)}
    </span>
  );
}

function titleFor(details) {
  return 'Who offers it?';
}

function descriptionFor(details) {
  return 'Pick staff who can teach this class.';
}
