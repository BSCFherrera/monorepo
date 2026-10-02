import { ClientInformationResponse, OtpChannel } from '@/types/index';
import {
  BscPrimaryButton,
  BscSelectableListGroup,
  BscSelectableListGroupOption,
  BscSpacing,
  BscTextStyles,
} from '@bsc/design-system';
import { formatName, maskEmail, maskPhone } from '@utils/helpers';
import { TFunction } from 'i18next';
import { useState, useMemo, Dispatch } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SelectChannelVerificationProps {
  verifiedClient: ClientInformationResponse | null;
  t: TFunction<'accessRecovery', undefined>;
  channelVerification: OtpChannel | '';
  handleChannelChange: (value: OtpChannel | '') => void;
  handleSendCode: () => void;
  setDataSelected: Dispatch<React.SetStateAction<string>>;
}

export const SelectChannelVerification = (props: SelectChannelVerificationProps) => {
  const {
    verifiedClient,
    t,
    channelVerification,
    handleChannelChange,
    handleSendCode,
    setDataSelected,
  } = props;
  const [phoneSelected, setPhoneSelected] = useState('');
  const [emailSelected, setEmailSelected] = useState('');

  const canContinue = channelVerification !== '';

  const onChannelChange = (value: OtpChannel | '') => {
    handleChannelChange(value);
    switch (value) {
      case 'email':
        setDataSelected(emailSelected);
        break;
      case 'phone':
        setDataSelected(phoneSelected);
        break;
    }
  };

  const selectableList: readonly BscSelectableListGroupOption<OtpChannel>[] = useMemo(() => {
    const emails = verifiedClient?.emails ?? [];
    const phones = verifiedClient?.telefonos ?? [];

    const email =
      emails.find(item => item.emailPorDefecto === 'S')?.email ?? emails[0]?.email ?? '';

    const phone =
      phones.find(item => item.telefonoPorDefecto === 'S')?.numeroTelefono ??
      phones[0]?.numeroTelefono ??
      '';

    setEmailSelected(email);
    setPhoneSelected(phone);
    return [
      {
        value: 'email',
        icon: 'mail',
        title: t('confirmOtp.emailLabel'),
        subtitle: maskEmail(email),
      },
      {
        value: 'phone',
        icon: 'smartphone',
        title: t('confirmOtp.smsLabel'),
        subtitle: maskPhone(phone),
      },
    ];
  }, [verifiedClient?.emails, verifiedClient?.telefonos, t]);

  const title = t('confirmOtp.title', {
    firstName: formatName(verifiedClient?.primerNombre || ''),
  });

  return (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{t('confirmOtp.subtitle')}</Text>

      <View style={styles.content}>
        <BscSelectableListGroup
          options={selectableList}
          value={channelVerification}
          onChange={onChannelChange}
        />

        <BscPrimaryButton
          label={t('confirmOtp.sendCodeButton')}
          onPress={handleSendCode}
          disabled={!canContinue}
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
