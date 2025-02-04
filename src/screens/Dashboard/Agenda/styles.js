import React from 'react';
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
  box: {
    height: moderateScale(140),
    width: '100%',
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  month: {
    color: colors.white,
    fontSize: textScale(30),
    fontWeight: 'bold',
    paddingTop: scale(60),
  },

  container1: {
    marginHorizontal: scale(16),
  },
  heading: {
    fontSize: textScale(16),
    fontWeight: '700',
    color: colors.black,
  },
  keyBoardAwareStyle: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
  },
  textInputContainer: {
    backgroundColor: colors.gray01,
    width: moderateScale(312),
    marginTop: verticalScale(5),
    height: moderateScale(50),
  },
  textInputContainer2: {
    backgroundColor: colors.gray01,
    width: moderateScale(140),
    marginTop: verticalScale(10),
    height: moderateScale(50),
    paddingHorizontal: 0,
  },
  addButton: {
    marginTop: verticalScale(10),
  },
  cancelButton: {
    marginTop: verticalScale(-5),
    backgroundColor: 'transparent',
  },
  cancelButtonLabel: {
    color: colors.primary,
  },

  datePicker: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: moderateScale(100),
    display: 'flex',
    backgroundColor: colors.white,
  },

  iconContainer: {
    // position: 'absolute',
    height: moderateScale(20),
    width: moderateScale(20),
    marginTop: verticalScale(20),
    right: scale(5),
    top: verticalScale(18),
  },
  inputStyle2: {
    fontSize: textScale(14),
    paddingHorizontal: scale(5),
    width: moderateScale(140),
    color: colors.black,
  },
  iconStyle3: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  noAppointments: {
    fontSize: textScale(16),
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
  loadingContainer: {
    marginTop: verticalScale(40),
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
});

export default styles;
