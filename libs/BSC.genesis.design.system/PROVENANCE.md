# Source-derived UI: mapping and fidelity limits

All **28 Common component files** now map to public components and individual
`Common/<source name>` Storybook entries. The source's visual recipes take priority;
reuse is internal and does not justify replacing a segmented control, anchored
dropdown, side drawer, or distinct dialog with a different design.

**This is not a pixel-parity certification or a drop-in API replacement.** Source
styles were inspected; automated checks cover behavior and bundling. Neither a
browser screenshot comparison nor native device validation has been performed.

## Rights and assets

The private source is `BSC/Conversacional`. Local extraction was authorized, not
public redistribution. Obtain rights-holder permission before redistribution.
No license to the source application is asserted. No bank assets, customer data,
credentials, PDFs, contact details, or legal text were copied. Examples use
synthetic English text, source-derived colors, and neutral brand placeholders.
The source checkout is read-only; builds and dependency operations run only here.

`illustrationSource` and `logoSource` accept host-owned React Native image sources.
`illustration` and `logo` accept render slots. Components own the 40/64-pixel
illustration and 120-by-60 logo layout. The original logo and information/alert
artwork remain **unresolved fidelity differences**, not silently substituted assets.
There are no absolute source imports or runtime dependencies on the source checkout.

## Exact Common mapping

Each source path is `src/components/Common/<name>.tsx`. Storybook uses the source
name even when the library export differs.

| Source name / Storybook entry | Public export | Recipe |
| --- | --- | --- |
| ButtonPill | ButtonPill | 16/24 padding, radius 999, 16/700 text, default #007AFF |
| ButtonOutlinedFlat | ButtonOutlinedFlat | 10/24 padding, 1.5 border, 15/700 text |
| TextField | TextField | Unlabelled 48-high field, disabled versus readonly states |
| ErrorText | ErrorText | 12-pixel icon and error text |
| Checkbox | Checkbox | 24-square rounded box and check, rich label |
| ToggleSwitch | ToggleSwitch | Custom 44-by-24 track and 20-pixel knob |
| SelectPill | SelectPill | Equal-width 40-high segments in one pill group |
| Select | Select | Measured anchored dropdown; numeric zero is a valid value |
| OtpInput | OtpInput | Visible 44-by-48 cells with one accessible native editing input |
| OtpVerificationField | OtpVerificationField | Destination, timer, sent notice, cells, send/resend/verified states |
| Steps | Steps | Four-pixel bars; accessible progress without visible labels |
| Card | **InfoCard** | Grey horizontal information card and optional icon circle |
| TouchableCard | TouchableCard | Grey pressable row with chevron |
| RegisterPromptCard | RegisterPromptCard | Green-tinted registration row, user-plus and chevron |
| Loader | Loader | In-place overlay and large spinner; no native Modal |
| ModalCommon | ModalCommon | Bottom-flush slide surface, top corners 24, explicit bottom inset |
| ModalCentered | ModalCentered | Fade, backdrop padding 20, content-sized radius-24 surface |
| ErrorGeneric | ErrorGeneric | Illustration, centered title, blue information panel, standard action |
| ErrorGeneral | ErrorGeneral | Same source structure, supports nested bold/link Text content |
| ErrorServiceGeneral | ErrorServiceGeneral | Service-message information panel and standard action |
| ErrorUserWithoutData | ErrorUserWithoutData | Profile-data information panel with rich text |
| MaximumIntentsModal | MaximumIntentsModal | Separate red warning panel before blue information panel |
| NotValidatedClientModal | NotValidatedClientModal | Information panel and two full-width filled pills |
| TimeoutErrorModal | TimeoutErrorModal | 64-pixel illustration, inset heading, unboxed body, standard action |
| SuccessModal | SuccessModal | Green check-circle, title/body spacing, filled pill |
| WarningSessionModal | WarningSessionModal | Orange icon circle, filled confirmation and outlined cancellation |
| SessionExpiredModal | SessionExpiredModal | Orange clock circle and one acknowledgement pill |
| ClientVerifiedModal | ClientVerifiedModal | Back circle, logo slot, 24-pixel heading, detail rows, pill and text action |

The original generic `Card` export remains a `ViewProps` surface; it is **not** the
source Common/Card. Friendly `ActionCard`, `LoadingOverlay`, `BottomSheetModal`,
and `CenteredModal` exports remain available. Common dialogs are named recipes,
not aliases to the generic `FeedbackModal` story.

## Other source mappings

| Source component | Export / status |
| --- | --- |
| Button | Button: green secondary is distinct from outline; loading replaces visible contents |
| Input | Input: labelled field with focus callbacks and helper/error text |
| Header | Header: blue 60-high bar, title, balanced side slots |
| onboarding/HeaderOnboarding | HeaderOnboarding (also AppHeader): centered logo slot |
| BankHeader | BankHeader (also BrandHeader): white header, menu, brand slot, bell and initials |
| HamburgerMenu | HamburgerMenu (also DrawerMenu): animated left full-height drawer, sections/history/footer |
| MessageBubble | MessageBubble: outgoing/incoming surfaces, bold text segments, timestamp |
| TypingIndicator | TypingIndicator: sphere, rings, core and spark; three cleaned-up animation loops |
| onboarding/PasswordStrengthMeter | PasswordStrengthMeter: three bars; host supplies level and label |
| onboarding/TermsAndConditionsModal | TermsAndConditionsModal: close, title, scrollable rich body, accept pill |
| onboarding/DisclaimerModal | DisclaimerModal: back/logo/title, requirement rows, continue and exit |

The onboarding/domain dialogs use `FeedbackModal` as a dispatcher that routes
each variant to its named source-faithful recipe. WelcomeModal,
ModalErrorUserBlockedLogin, OnboardingClientVerifiedModal and
ProofOfLifeSuccessModal are implemented in `src/onboarding.tsx` with the
correct visual structures. The FeedbackModal switch does not introduce a generic
template; it delegates to the appropriate named export.

PDF preview/viewer and the signing-service container remain excluded. No navigation,
authentication, session service, signing workflow, translation store, clipboard
module, or app password validator is extracted.

## Host integration contracts

- Fields are controlled. Supply `value` and the exported change callback. Source
  application prop names are not universally preserved; use the generated types.
- OTP sanitizes after paste and emits completion only for a full code. Its single
  editing input is focusable and accessible; visual cells are not duplicate inputs.
  `OtpVerificationField` takes `options`, `selectedValue`, `codeSent`, `timer`,
  `verified`, `onSend`, `onResend`, and `onVerify`. The host owns timing and services.
  There is no always-visible Verify action. Device autofill still needs validation.
- `ModalCommon`/named dialogs use `visible` and `onClose`. Confirmation uses
  `onConfirm` if provided, otherwise `onClose`. An explicit confirmation callback
  does not imply dismissal. Both session dialogs block backdrop and system-back
  dismissal; their action callbacks remain usable.
- Supply bottom insets explicitly. iOS keyboard offset resets on hiding; Android
  relies on host resize behavior. Keyboard/inset interactions need device testing.
- `Steps.current` is zero-based (source `currentStep` was one-based). Password
  strength 0 hides the meter; 1/2/3+ fill one/two/three bars.
- `TypingIndicator` starts animation only after reduced-motion permission is known;
  `animated={false}` freezes the same sphere composition. Loader fills its parent.
- Default generic icons use dependency-free RN geometry. Both catalogs install the
  same SVG Feather adapter from `storybook/iconAdapter.tsx`. The geometric fallback
  is not an exact Feather rasterization; inject your own renderer for icon parity.
  No new native production peer was introduced. Unsupported custom icon names need
  a host renderer; do not treat the generic fallback as an icon-set implementation.

## Verification and rollback boundaries

The catalog statically registers all component story modules for native and web
discovery. Tests assert all Common metadata entries reference their real exports.
Unit checks cover OTP editing/completion, select measurement and readonly
transitions, segmented selection, disabled controls, modal actions/panels,
dispatch routing, and catalog rendering. 166 tests pass.

Verification commands: `npm run typecheck`, `npm test`, `npm run build`,
`npm run build-storybook`, `npm run check:metro`, and `npm pack --dry-run --ignore-scripts`.
The clean library build prevents renamed/deleted stories from surviving in `lib`.
Metro checks Android/iOS catalog resolution and excludes Storybook, RN Web, SVG,
navigation, clipboard, PDF and app-store dependencies from the production graph.

Builds and style assertions are **not visual verification**. Validate source-relative
screenshots, large text, keyboard focus, screen-reader behavior, modal scrolling,
and narrow viewports on supported hosts before shipping.

Uncommitted work units and rollback boundaries:

1. Common recipes: `src/common.tsx`, `commonButtons.tsx`, their exports, stories and
   `tests/common.test.tsx`; restore together, not only the barrel exports.
2. Controlled fields: `forms.tsx`, `selection.tsx`, `otp.tsx`, related stories/tests.
3. Other presentation: `navigation.tsx`, `conversation.tsx`, `onboarding.tsx`,
   `modals.tsx`, `display.tsx`, related exports/stories/tests.
4. Portable catalog/build: `.storybook`, `storybook/iconAdapter.tsx`, static catalog,
   `scripts/build.js`, Metro isolation assertions, and package build script.

No commits, Git initialization, publishing, or automated review were performed.
