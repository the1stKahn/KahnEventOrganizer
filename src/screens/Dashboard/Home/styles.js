import { StyleSheet, Platform } from "react-native";
import colors from "../../../styles/colors";
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from "../../../styles/responsiveSize";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  box: {
    width: "100%",
    height: moderateScale(161),
    backgroundColor: colors.secondary,
    paddingHorizontal: scale(20),
    justifyContent: "center",
    // alignItems: 'center',
  },
  logoStyle: {
    width: moderateScale(150),
    height: moderateScale(150),
  },
  homeText: {
    fontSize: textScale(30),
    color: colors.white,
    fontWeight: "600",
    fontFamily: "Inter-Bold",
    textAlign: "center",
    marginTop: verticalScale(40),
  },
  logoStyle: {
    width: moderateScale(50),
    height: moderateScale(50),
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(35),
    justifyContent: "space-between",
  },
  doctorName: {
    fontSize: textScale(22),
    color: colors.white,
    fontWeight: "600",
    fontFamily: "Inter-Bold",
  },
  scheduleContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(25),
  },
  scheduleText: {
    fontSize: textScale(16),
    color: colors.black,
    fontWeight: "600",
  },
  scheduleListingContainer: {
    width: moderateScale(335),
    borderRadius: moderateScale(7),
    borderWidth: 1,
    borderColor: colors.gray04,
    alignSelf: "center",
    marginTop: verticalScale(5),
  },
  dayStyles: {
    fontSize: textScale(16),
    color: colors.black,
    fontWeight: "700",
  },
  scheduleDay: {
    fontSize: textScale(16),
    color: colors.black,
    fontWeight: "400",
    paddingTop: verticalScale(3),
    paddingLeft: scale(10),
  },
  scheduleDay2: {
    fontSize: textScale(16),
    color: colors.black,
    fontWeight: "400",
    paddingTop: verticalScale(3),
    // paddingLeft: scale(10),
  },
  buttonStyle: {
    width: moderateScale(285),
    marginBottom: verticalScale(10),
    alignSelf: "center",
    marginTop: verticalScale(5),
  },
  textContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(8),
  },
  textContainer2: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
  },
  statisticsContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  statisticsText: {
    fontSize: textScale(16),
    color: colors.black,
    fontWeight: "600",
  },
  statisticsListingContainer: {
    width: moderateScale(335),
    borderRadius: moderateScale(7),
    borderWidth: 1,
    borderColor: colors.gray04,
    alignSelf: "center",
    marginTop: verticalScale(5),
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(10),
  },
  dateStyle: {
    fontSize: textScale(18),
    color: colors.black,
    fontWeight: "700",
    paddingLeft: scale(20),
    paddingTop: verticalScale(5),
  },
  numberStyle: {
    fontSize: textScale(48),
    color: colors.black,
    fontWeight: "700",
  },
  wordsStyle: {
    fontSize: textScale(24),
    color: colors.black,
    fontWeight: "700",
  },
  makeThemCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    marginTop: verticalScale(40),
  },
  noAppointments: {
    fontSize: textScale(14),
    color: colors.gray03,
    textAlign: "center",
    marginTop: verticalScale(10),
    paddingHorizontal: scale(20),
  },
  createAppointmentButton: {
    color: colors.secondary,
    fontSize: scale(14),
    fontWeight: "600",
  },
  buttonContainerStyle: {
    marginTop: verticalScale(8),
    backgroundColor: "transparent",
  },
  headerContainer: {
    alignItems: "center",
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
  },

  profileImageOfDoctorContainer: {
    height: moderateScale(50),
    width: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: colors.white,
  },
  doctorImageStyle: {
    height: moderateScale(50),
    width: moderateScale(50),
    borderRadius: moderateScale(25),
  },
  fullNameContainer: {
    width: moderateScale(260),
    marginLeft: scale(10),
  },
  fullNameText: {
    fontSize: textScale(16),
    color: colors.black,
    fontWeight: "600",
    fontFamily: "Inter-Bold",
  },
  dotsStyle: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  emailText: {
    fontSize: textScale(14),
    color: colors.gray03,
  },
});
export default styles;
