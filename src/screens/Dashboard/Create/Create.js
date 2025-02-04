import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from "react-native";
import React from "react";
import navigationStrings from "../../../constants/navigationStrings";
import imagePath from "../../../constants/imagePath";
import styles from "./styles";
import TemplateOptions2 from "../../../components/TemplateOptions2";

const Create = ({ navigation, route }) => {
  // Renderer

  function renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flex: 1 }}
        >
          <Image source={imagePath.icArrowLeft} style={styles.arrowStyle2} />
        </TouchableOpacity>
        <View style={{ flex: 1.5 }}>
          <Text style={styles.profileTextStyle}>Create</Text>
        </View>
      </View>
    );
  }

  function renderTemplateBox() {
    return (
      <View style={styles.templateBox}>
        <View>
          <TemplateOptions2
            onPress={() => {
              navigation.navigate(navigationStrings.EXAMINATION, {
                patientIndex: "",
                item: "",
                key: "create",
              });
            }}
            icon={imagePath.icDentalMachine}
            label="Examination"
          />
          <TemplateOptions2
            onPress={() => {
              navigation.navigate(navigationStrings.PRESCRIPTION, {
                patientIndex: "",
                item: "",
                key: "create",
              });
            }}
            icon={imagePath.icReceipt}
            label="Perscription"
          />
          <TemplateOptions2
            onPress={() => {
              navigation.navigate(navigationStrings.TREATMENT_PLAN, {
                patientIndex: "",
                item: "",
                key: "create",
              });
            }}
            icon={imagePath.icWhatIDo}
            label="Treatment Plans"
          />
          <TemplateOptions2
            icon={imagePath.icAppointment}
            label="Appointment"
            onPress={() => {
              navigation.navigate(navigationStrings.AGENDA);
            }}
          />
        </View>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS == "android" && (
        <View
          style={{
            height: 15,
          }}
        />
      )}
      {renderHeader()}
      {renderTemplateBox()}
    </SafeAreaView>
  );
};

export default Create;
