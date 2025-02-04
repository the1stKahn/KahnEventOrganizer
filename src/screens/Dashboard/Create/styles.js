import {StyleSheet} from 'react-native';
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from '../../../styles/responsiveSize';
import colors from '../../../styles/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerContainer: {
    marginHorizontal: scale(20),
    height: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    backgroundColor: colors.white,
    width: moderateScale(323),
    flexDirection: 'row',
    marginTop: verticalScale(12),
  },

  arrowStyle2: {
    width: moderateScale(20),
    height: moderateScale(20),
  },

  profileTextStyle: {
    fontSize: textScale(18),
    fontWeight: 'bold',
    color: colors.black,
  },
  templateBox: {
    width: moderateScale(343),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray02,
    borderRadius: moderateScale(12),
    alignSelf: 'center',
    marginTop: verticalScale(20),
  },
});

export default styles;
