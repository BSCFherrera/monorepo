"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyEntries = void 0;
const buttonStories = __importStar(require("./Button.stories"));
const cardStories = __importStar(require("./Card.stories"));
const inputStories = __importStar(require("./Input.stories"));
const textFieldStories = __importStar(require("./TextField.stories"));
const errorTextStories = __importStar(require("./ErrorText.stories"));
const checkboxStories = __importStar(require("./Checkbox.stories"));
const toggleSwitchStories = __importStar(require("./ToggleSwitch.stories"));
const passwordStrengthMeterStories = __importStar(require("./PasswordStrengthMeter.stories"));
const selectStories = __importStar(require("./Select.stories"));
const selectPillStories = __importStar(require("./SelectPill.stories"));
const otpInputStories = __importStar(require("./OtpInput.stories"));
const otpVerificationFieldStories = __importStar(require("./OtpVerificationField.stories"));
const infoCardStories = __importStar(require("./InfoCard.stories"));
const actionCardStories = __importStar(require("./ActionCard.stories"));
const stepsStories = __importStar(require("./Steps.stories"));
const loadingOverlayStories = __importStar(require("./LoadingOverlay.stories"));
const messageBubbleStories = __importStar(require("./MessageBubble.stories"));
const typingIndicatorStories = __importStar(require("./TypingIndicator.stories"));
const headerStories = __importStar(require("./Header.stories"));
const appHeaderStories = __importStar(require("./AppHeader.stories"));
const brandHeaderStories = __importStar(require("./BrandHeader.stories"));
const drawerMenuStories = __importStar(require("./DrawerMenu.stories"));
const centeredModalStories = __importStar(require("./CenteredModal.stories"));
const bottomSheetModalStories = __importStar(require("./BottomSheetModal.stories"));
const contentModalStories = __importStar(require("./ContentModal.stories"));
const feedbackModalStories = __importStar(require("./FeedbackModal.stories"));
const buttonPill = __importStar(require("./ButtonPill.stories"));
const buttonOutlinedFlat = __importStar(require("./ButtonOutlinedFlat.stories"));
const loader = __importStar(require("./Loader.stories"));
const modalCommon = __importStar(require("./ModalCommon.stories"));
const modalCentered = __importStar(require("./ModalCentered.stories"));
const errorGeneric = __importStar(require("./ErrorGeneric.stories"));
const errorGeneral = __importStar(require("./ErrorGeneral.stories"));
const errorServiceGeneral = __importStar(require("./ErrorServiceGeneral.stories"));
const errorUserWithoutData = __importStar(require("./ErrorUserWithoutData.stories"));
const maximumIntentsModal = __importStar(require("./MaximumIntentsModal.stories"));
const notValidatedClientModal = __importStar(require("./NotValidatedClientModal.stories"));
const timeoutErrorModal = __importStar(require("./TimeoutErrorModal.stories"));
const successModal = __importStar(require("./SuccessModal.stories"));
const warningSessionModal = __importStar(require("./WarningSessionModal.stories"));
const sessionExpiredModal = __importStar(require("./SessionExpiredModal.stories"));
const clientVerifiedModal = __importStar(require("./ClientVerifiedModal.stories"));
const termsAndConditionsModal = __importStar(require("./TermsAndConditionsModal.stories"));
const disclaimerModal = __importStar(require("./DisclaimerModal.stories"));
const welcomeModal = __importStar(require("./WelcomeModal.stories"));
const blockedLoginModal = __importStar(require("./ModalErrorUserBlockedLogin.stories"));
const proofOfLifeSuccessModal = __importStar(require("./ProofOfLifeSuccessModal.stories"));
const onboardingClientVerifiedModal = __importStar(require("./OnboardingClientVerifiedModal.stories"));
const onboardingErrorGeneral = __importStar(require("./OnboardingErrorGeneral.stories"));
const onboardingErrorServiceGeneral = __importStar(require("./OnboardingErrorServiceGeneral.stories"));
const onboardingErrorUserWithoutData = __importStar(require("./OnboardingErrorUserWithoutData.stories"));
const onboardingMaximumIntentsModal = __importStar(require("./OnboardingMaximumIntentsModal.stories"));
const onboardingNotValidatedClientModal = __importStar(require("./OnboardingNotValidatedClientModal.stories"));
const timoutErrorModal = __importStar(require("./TimoutErrorModal.stories"));
// Static imports survive packaging without Metro require.context or code generation.
const modules = {
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
    './ButtonPill.stories': buttonPill,
    './ButtonOutlinedFlat.stories': buttonOutlinedFlat,
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
    './Button.stories': buttonStories,
    './Card.stories': cardStories,
    './Input.stories': inputStories,
    './TextField.stories': textFieldStories,
    './ErrorText.stories': errorTextStories,
    './Checkbox.stories': checkboxStories,
    './ToggleSwitch.stories': toggleSwitchStories,
    './PasswordStrengthMeter.stories': passwordStrengthMeterStories,
    './Select.stories': selectStories,
    './SelectPill.stories': selectPillStories,
    './OtpInput.stories': otpInputStories,
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
const req = Object.assign((filename) => {
    if (!(filename in modules))
        throw new Error(`Unknown story module: ${filename}`);
    return modules[filename];
}, { keys: () => Object.keys(modules) });
exports.storyEntries = [{
        titlePrefix: '',
        directory: './storybook',
        files: '*.stories',
        importPathMatcher: /^\.\/.*\.stories$/,
        req,
    }];
