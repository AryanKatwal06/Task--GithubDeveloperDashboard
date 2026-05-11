// Type declaration for react-native-netinfo
declare module 'react-native-netinfo' {
  interface NetInfoState {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type: string;
  }

  function addEventListener(listener: (state: NetInfoState) => void): () => void;

  export { NetInfoState };
  export default {
    addEventListener,
  };
}
