// Responsive wrapper.
//   < md (768px) → fills the viewport edge-to-edge (native feel on mobile browsers)
//   ≥ md (768px) → shows the phone mock (390 × 844) centered on a light background
//
// Child layouts use `shrink-0` headers + `flex-1 overflow-y-auto` content,
// so they adapt to whichever height they get.

export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-start md:items-center justify-center md:py-8 md:px-4">
      <div
        className="
          w-full h-[100dvh] bg-white flex flex-col overflow-hidden relative
          md:w-[390px] md:h-[844px] md:max-h-[calc(100dvh-4rem)]
          md:rounded-[44px] md:border md:border-gray-200 md:shadow-xl
        "
      >
        {children}
      </div>
    </div>
  );
}
