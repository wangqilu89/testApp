import { StyleSheet } from 'react-native';
import colors from './app-colors';

export default StyleSheet.create({
  buttonGroup: {
    gap:10
  },
  baseContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.moore2,
    marginBottom: 20,
  },
  
  subheading: {
    fontSize: 18,
    color: colors.moore1,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: colors.black,
  },
  center: {
    textAlign: 'center',
  },
});