import React from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";

const DeleteModal = ({ isVisible, onClose, onConfirm }) => {
  return (
    <View>
      <Alert.alert visible={isVisible}>
        <View style={styles.alert}>
          <Text style={styles.message}>
            Are you sure you want to perform this action?
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => {
                onClose();
              }}
              color="#ccc" // Customize button color
            />
            <Button
              title="Confirm"
              onPress={() => {
                onConfirm();
                onClose();
              }}
              color="#007AFF" // Customize button color
            />
          </View>
        </View>
      </Alert.alert>
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5, // Add a drop shadow on Android
    shadowColor: "black", // Add a drop shadow on iOS
    shadowOpacity: 0.2, // Add a drop shadow on iOS
    shadowOffset: { width: 0, height: 2 }, // Add a drop shadow on iOS
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default DeleteModal;
