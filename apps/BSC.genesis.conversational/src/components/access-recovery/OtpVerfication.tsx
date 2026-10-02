import { ClientInformationResponse, OtpChannel } from '@/types/index';
import { BscOtpCodeField, BscPrimaryButton, BscSpacing, BscTextStyles } from '@bsc/design-system';
import { UseOtpVerification } from '@hooks/useOtpVerification';
import { formatName, maskEmail, maskPhone } from '@utils/helpers';
import { TFunction } from 'i18next';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface OtpVerficationProps {
  verifiedClient: ClientInformationResponse | null;
  t: TFunction<'accessRecovery', undefined>;
  channelVerification: OtpChannel | '';
  handleContinue: () => void;
  selectedData: string;
  otp: UseOtpVerification;
}
export const OtpVerfication = (props: OtpVerficationProps) => {
  const { verifiedClient, t, channelVerification, selectedData, handleContinue, otp } = props;

  const dataEncrypted = useMemo(() => {
    switch (channelVerification) {
      case 'email':
        return maskEmail(selectedData);
      case 'sms':
        return maskPhone(selectedData);
      default:
        return '';
    }
  }, []);

  const title = t('confirmOtp.title', {
    firstName: formatName(verifiedClient?.primerNombre || ''),
  });

  const subtitle = t('confirmOtp.codeSent', {
    data: dataEncrypted,
  });

  return (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.content}>
        <BscOtpCodeField
          otp={otp.otp}
          changeOtp={otp.changeOtp}
          validate={otp.validate}
          resend={otp.resend}
          timer={otp.timer}
          hasError={otp.hasError}
          errorText={t('confirmOtp.otpError')}
          isVerified={otp.isVerified}
        />
        <BscPrimaryButton
          label={t('confirmOtp.continueButton')}
          onPress={handleContinue}
          disabled={!otp.isVerified}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    textAlign: 'center',
    marginTop: BscSpacing.md,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    textAlign: 'center',
    marginBottom: BscSpacing.xl,
  },
  label: {
    ...BscTextStyles['Caption/12 Regular'],
    marginBottom: BscSpacing.xs,
    paddingLeft: 10,
  },
});
