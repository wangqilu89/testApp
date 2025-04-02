import { StyleSheet } from 'react-native';
import colors from './app-colors';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaced: {
    marginVertical: 8,
  },
});