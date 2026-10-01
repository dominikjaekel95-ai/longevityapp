import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Silhouette } from '@/components/Silhouette';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { track } from '@/lib/analytics';
import { commitPhoto, deleteLocalPhoto, PREVIEW_ASPECT, processCapture, type ProcessedPhoto } from '@/lib/photo';
import { useApp } from '@/state/AppProvider';
import { countRetake, setDraftPhoto, startDraft } from '@/state/checkinDraft';
import { spacing } from '@/theme/tokens';

export default function CheckinFoto() {
  const { t, tc } = useT();
  const { settings } = useApp();
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [shot, setShot] = useState<ProcessedPhoto | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    startDraft();
  }, []);

  const frameW = Math.min(width - spacing.m * 2, 480, Math.floor(height * 0.6 * PREVIEW_ASPECT));
  const frameH = Math.round(frameW / PREVIEW_ASPECT);

  const capture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (pic) {
        const processed = await processCapture(pic.uri, pic.width, pic.height, { maskHead: settings.headMask });
        setShot(processed);
      }
    } catch {
      setCameraError(true);
    } finally {
      setBusy(false);
    }
  };

  const startTimer = () => {
    if (countdown !== null || busy) return;
    let n = 5;
    setCountdown(n);
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(id);
        setCountdown(null);
        capture();
      } else {
        setCountdown(n);
      }
    }, 1000);
  };

  const skip = () => {
    setDraftPhoto(null);
    router.push('/checkin/werte');
  };

  if (!permission) {
    return (
      <Screen>
        <Txt color="ink3">{t('common.laden')}</Txt>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen kicker={t('checkin.schritt', { n: 1 })} title={t('checkin.foto.titel')} footer={<Button label={t('checkin.foto.ohne')} variant="secondary" onPress={skip} />}>
        <Txt color="ink2">{tc('photoWhy')}</Txt>
        <Txt color="ink2">{t('checkin.foto.berechtigung')}</Txt>
        <Button label={t('checkin.foto.berechtigungButton')} onPress={() => requestPermission()} />
      </Screen>
    );
  }

  if (shot) {
    return (
      <Screen
        kicker={t('checkin.schritt', { n: 1 })}
        title={t('checkin.foto.titel')}
        footer={
          <>
            <Button
              label={t('checkin.foto.behalten')}
              onPress={() => {
                setDraftPhoto(commitPhoto(shot));
                router.push('/checkin/werte');
              }}
            />
            <Button
              label={t('checkin.foto.neu')}
              variant="text"
              onPress={() => {
                deleteLocalPhoto(shot.uri);
                countRetake();
                track({ name: 'foto_verworfen', props: { grund: 'nutzer' } });
                setShot(null);
              }}
            />
          </>
        }>
        <Image source={{ uri: shot.uri }} style={{ width: frameW, height: Math.round((frameW * shot.height) / shot.width) }} contentFit="contain" />
        <Txt variant="small" color="ink3">
          {t('checkin.foto.vorschauHinweis')}
        </Txt>
        <Txt variant="small" color="ink3">
          {tc('photoWhy')}
        </Txt>
      </Screen>
    );
  }

  return (
    <Screen
      kicker={t('checkin.schritt', { n: 1 })}
      title={t('checkin.foto.titel')}
      footer={
        <>
          <Button label={countdown !== null ? String(countdown) : t('checkin.foto.ausloesen')} onPress={capture} loading={busy} disabled={countdown !== null} />
          <View style={styles.rowButtons}>
            <Button label={t('checkin.foto.timer')} variant="text" onPress={startTimer} disabled={countdown !== null} />
            <Button label={t('checkin.foto.wechseln')} variant="text" onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} />
          </View>
          <Button label={t('checkin.foto.ohne')} variant="text" onPress={skip} />
        </>
      }>
      <Txt color="ink2">{tc('photoPose')}</Txt>
      <View style={[styles.frame, { width: frameW, height: frameH }]}>
        {cameraError ? (
          <Txt color="danger">{t('checkin.foto.keineKamera')}</Txt>
        ) : (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} ratio="4:3" mirror={false} onMountError={() => setCameraError(true)} />
        )}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Silhouette width={frameW} height={frameH} label={t('checkin.foto.schulterlinie')} />
        </View>
        {countdown !== null ? (
          <View style={styles.countdown} pointerEvents="none">
            <Txt variant="stat" style={{ color: '#ffffff' }}>
              {String(countdown)}
            </Txt>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: { backgroundColor: '#000', overflow: 'hidden', alignSelf: 'flex-start' },
  rowButtons: { flexDirection: 'row', gap: spacing.l, flexWrap: 'wrap' },
  countdown: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
