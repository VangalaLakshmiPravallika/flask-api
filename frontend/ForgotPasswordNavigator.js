import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import OTPVerificationScreen from "./src/screens/OTPVerificationScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";

const Stack = createStackNavigator();

export default function ForgotPasswordNavigator() {
  return (
    <Stack.Navigator initialRouteName="ForgotPassword">
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
