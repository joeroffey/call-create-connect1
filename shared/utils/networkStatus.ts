import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifiEnabled?: boolean;
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    isWifiEnabled: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isWifiEnabled: state.isWifiEnabled,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkState;
};

export const checkNetworkStatus = async (): Promise<NetworkState> => {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable ?? false,
    type: state.type,
    isWifiEnabled: state.isWifiEnabled,
  };
};

export const getNetworkTypeLabel = (type: string): string => {
  switch (type) {
    case 'wifi':
      return 'Wi-Fi';
    case 'cellular':
      return 'Cellular';
    case 'bluetooth':
      return 'Bluetooth';
    case 'ethernet':
      return 'Ethernet';
    case 'wimax':
      return 'WiMAX';
    case 'vpn':
      return 'VPN';
    case 'other':
      return 'Other';
    default:
      return 'Unknown';
  }
};

export const isHighSpeedConnection = (type: string): boolean => {
  return ['wifi', 'ethernet'].includes(type);
};