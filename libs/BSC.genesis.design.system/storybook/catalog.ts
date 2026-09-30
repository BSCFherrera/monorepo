import type { start } from '@storybook/react-native';
import * as bscButtonStories from './BscButton.stories';
import * as cardStories from './Card.stories';
import * as bscTextFieldStories from './BscTextField.stories';
import * as bscErrorTextStories from './BscErrorText.stories';
import * as bscCheckboxStories from './BscCheckbox.stories';
import * as bscToggleSwitchStories from './BscToggleSwitch.stories';
import * as bscMeterBarStories from './BscMeterBar.stories';
import * as bscSelectStories from './BscSelect.stories';
import * as bscSegmentedStories from './BscSegmented.stories';
import * as bscOtpInputStories from './BscOtpInput.stories';
import * as otpVerificationFieldStories from './OtpVerificationField.stories';
import * as infoCardStories from './InfoCard.stories';
import * as actionCardStories from './ActionCard.stories';
import * as stepsStories from './Steps.stories';
import * as loadingOverlayStories from './LoadingOverlay.stories';
import * as messageBubbleStories from './MessageBubble.stories';
import * as typingIndicatorStories from './TypingIndicator.stories';
import * as headerStories from './Header.stories';
import * as appHeaderStories from './AppHeader.stories';
import * as brandHeaderStories from './BrandHeader.stories';
import * as drawerMenuStories from './DrawerMenu.stories';
import * as centeredModalStories from './CenteredModal.stories';
import * as bottomSheetModalStories from './BottomSheetModal.stories';
import * as contentModalStories from './ContentModal.stories';
import * as feedbackModalStories from './FeedbackModal.stories';
import * as loader from './Loader.stories';
import * as modalCommon from './ModalCommon.stories';
import * as modalCentered from './ModalCentered.stories';
import * as errorGeneric from './ErrorGeneric.stories';
import * as errorGeneral from './ErrorGeneral.stories';
import * as errorServiceGeneral from './ErrorServiceGeneral.stories';
import * as errorUserWithoutData from './ErrorUserWithoutData.stories';
import * as maximumIntentsModal from './MaximumIntentsModal.stories';
import * as notValidatedClientModal from './NotValidatedClientModal.stories';
import * as timeoutErrorModal from './TimeoutErrorModal.stories';
import * as successModal from './SuccessModal.stories';
import * as warningSessionModal from './WarningSessionModal.stories';
import * as sessionExpiredModal from './SessionExpiredModal.stories';
import * as clientVerifiedModal from './ClientVerifiedModal.stories';
import * as termsAndConditionsModal from './TermsAndConditionsModal.stories';
import * as disclaimerModal from './DisclaimerModal.stories';
import * as welcomeModal from './WelcomeModal.stories';
import * as blockedLoginModal from './ModalErrorUserBlockedLogin.stories';
import * as proofOfLifeSuccessModal from './ProofOfLifeSuccessModal.stories';
import * as onboardingClientVerifiedModal from './OnboardingClientVerifiedModal.stories';
import * as onboardingErrorGeneral from './OnboardingErrorGeneral.stories';
import * as onboardingErrorServiceGeneral from './OnboardingErrorServiceGeneral.stories';
import * as onboardingErrorUserWithoutData from './OnboardingErrorUserWithoutData.stories';
import * as onboardingMaximumIntentsModal from './OnboardingMaximumIntentsModal.stories';
import * as onboardingNotValidatedClientModal from './OnboardingNotValidatedClientModal.stories';
import * as timoutErrorModal from './TimoutErrorModal.stories';

// Static imports survive packaging without Metro require.context or code generation.
const modules: Record<string, unknown> = {
  './WelcomeModal.stories': welcomeModal,
  './ModalErrorUserBlockedLogin.stories': blockedLoginModal,
  './ProofOfLifeSuccessModal.stories': proofOfLifeSuccessModal,
  './OnboardingClientVerifiedModal.stories': onboardingClientVerifiedModal,
  './OnboardingErrorGeneral.stories': onboardingErrorGeneral,
  './OnboardingErrorServiceGeneral.stories': onboardingErrorServiceGeneral,
  './OnboardingErrorUserWithoutData.stories': onboardingErrorUserWithoutData,
  './OnboardingMaximumIntentsModal.stories': onboardingMaximumIntentsModal,
  './OnboardingNotValidatedClientModal.stories': onboardingNotValidatedClientModal,
  './TimoutErrorModal.stories': timoutErrorModal,
  './TermsAndConditionsModal.stories': termsAndConditionsModal,
  './DisclaimerModal.stories': disclaimerModal,
  './Loader.stories': loader,
  './ModalCommon.stories': modalCommon,
  './ModalCentered.stories': modalCentered,
  './ErrorGeneric.stories': errorGeneric,
  './ErrorGeneral.stories': errorGeneral,
  './ErrorServiceGeneral.stories': errorServiceGeneral,
  './ErrorUserWithoutData.stories': errorUserWithoutData,
  './MaximumIntentsModal.stories': maximumIntentsModal,
  './NotValidatedClientModal.stories': notValidatedClientModal,
  './TimeoutErrorModal.stories': timeoutErrorModal,
  './SuccessModal.stories': successModal,
  './WarningSessionModal.stories': warningSessionModal,
  './SessionExpiredModal.stories': sessionExpiredModal,
  './ClientVerifiedModal.stories': clientVerifiedModal,
  './BscButton.stories': bscButtonStories,
  './Card.stories': cardStories,
  './BscTextField.stories': bscTextFieldStories,
  './BscErrorText.stories': bscErrorTextStories,
  './BscCheckbox.stories': bscCheckboxStories,
  './BscToggleSwitch.stories': bscToggleSwitchStories,
  './BscMeterBar.stories': bscMeterBarStories,
  './BscSelect.stories': bscSelectStories,
  './BscSegmented.stories': bscSegmentedStories,
  './BscOtpInput.stories': bscOtpInputStories,
  './OtpVerificationField.stories': otpVerificationFieldStories,
  './InfoCard.stories': infoCardStories,
  './ActionCard.stories': actionCardStories,
  './Steps.stories': stepsStories,
  './LoadingOverlay.stories': loadingOverlayStories,
  './MessageBubble.stories': messageBubbleStories,
  './TypingIndicator.stories': typingIndicatorStories,
  './Header.stories': headerStories,
  './AppHeader.stories': appHeaderStories,
  './BrandHeader.stories': brandHeaderStories,
  './DrawerMenu.stories': drawerMenuStories,
  './CenteredModal.stories': centeredModalStories,
  './BottomSheetModal.stories': bottomSheetModalStories,
  './ContentModal.stories': contentModalStories,
  './FeedbackModal.stories': feedbackModalStories,
};

const req = Object.assign(
  (filename: string) => {
    if (!(filename in modules)) throw new Error(`Unknown story module: ${filename}`);
    return modules[filename];
  },
  { keys: () => Object.keys(modules) },
);

export const storyEntries: Parameters<typeof start>[0]['storyEntries'] = [{
  titlePrefix: '',
  directory: './storybook',
  files: '*.stories',
  importPathMatcher: /^\.\/.*\.stories$/,
  req,
}];
