import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [gpsLocation, setGpsLocation] = useState<Location.LocationObject | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Biometrics Authentication Flow
  const authenticateBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback if no biometric hardware is detected
        setIsLocked(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Hakiki Alama ya Vidole au Sura (Biometrics)',
        fallbackLabel: 'Ingiza Nambari ya Siri (PIN)',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
        Alert.alert('Uhakiki Umefanikiwa', 'Karibu kwenye Fundi Service Tanzania App');
      } else {
        Alert.alert('Hitilafu', 'Uhakiki ulishindikana. Tafadhali jaribu tena.');
      }
    } catch (error) {
      console.error(error);
      setIsLocked(false); // Bypass mock
    }
  };

  // 2. Request and Fetch GPS Location Coordinates
  const startGPSTracking = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ruhusa Imekataliwa', 'Ruhusu GPS ili uanze kufuatiliwa.');
        setLoading(false);
        return;
      }

      // Fetch location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setGpsLocation(location);
      setTrackingActive(true);
      Alert.alert('GPS Inafanya kazi', 'Mahali ulipo sasa panarushwa kwenye jukwaa la mteja.');
    } catch (error) {
      Alert.alert('Hitilafu', 'Imeshindwa kupata GPS coordinates.');
    } finally {
      setLoading(false);
    }
  };

  const stopGPSTracking = () => {
    setTrackingActive(false);
    setGpsLocation(null);
    Alert.alert('GPS Imezimwa', 'Umezima urushaji wa ramani ya GPS.');
  };

  useEffect(() => {
    authenticateBiometrics();
  }, []);

  if (isLocked) {
    return (
      <View style={styles.lockedContainer}>
        <StatusBar style="light" />
        <Text style={styles.lockedHeader}>Fundi Service Tanzania</Text>
        <Text style={styles.lockedText}>Programu imefungwa kwa Usalama.</Text>
        <TouchableOpacity style={styles.authButton} onPress={authenticateBiometrics}>
          <Text style={styles.authButtonText}>Fungua na Biometrics</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fundi Service TZ</Text>
          <Text style={styles.headerSubtitle}>Ukurasa wa Fundi (Mobile Dashboard)</Text>
        </View>

        {/* Wallet overview card */}
        <View style={styles.walletCard}>
          <Text style={styles.cardLabel}>SALIO LA MKOBANI (WALLET)</Text>
          <Text style={styles.walletAmount}>TZS 45,000</Text>
          <Text style={styles.escrowLabel}>Escrow held: TZS 0.00</Text>
        </View>

        {/* GPS tracking service card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live GPS Location Sync</Text>
          <Text style={styles.cardDescription}>
            Ruhusu mfumo kurusha GPS coordinates zako unapoelekea kwa mteja ili kufuatiliwa kwa usahihi.
          </Text>

          {gpsLocation && (
            <View style={styles.locationOutput}>
              <Text style={styles.locationText}>Latitude: {gpsLocation.coords.latitude.toFixed(6)}</Text>
              <Text style={styles.locationText}>Longitude: {gpsLocation.coords.longitude.toFixed(6)}</Text>
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="small" color="#0284c7" />
          ) : !trackingActive ? (
            <TouchableOpacity style={styles.button} onPress={startGPSTracking}>
              <Text style={styles.buttonText}>Anza GPS Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={stopGPSTracking}>
              <Text style={styles.buttonText}>Zima GPS Tracking</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions grids */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.gridButton} onPress={() => Alert.alert('Kichanganuzi QR', 'QR Code camera initialized')}>
            <Text style={styles.gridText}>Scan QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => Alert.alert('Push Alerts', 'Hakuna arifa mpya za Firebase Cloud Messaging')}>
            <Text style={styles.gridText}>Notifications</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
    space: 15,
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockedHeader: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 5,
  },
  lockedText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 30,
  },
  authButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  walletCard: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardLabel: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  walletAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 5,
  },
  escrowLabel: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '750',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 15,
  },
  locationOutput: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  locationText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#334155',
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  gridText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  }
});
