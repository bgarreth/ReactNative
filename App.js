import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View, Text} from 'react-native';

import {withAuthenticator} from 'aws-amplify-react-native';
import PushNotification from '@aws-amplify/pushnotification';
import Amplify,{Auth, Analytics} from 'aws-amplify';
import config from './aws-exports';
Amplify.configure(config);
//Amplify.Logger.LOG_LEVEL = 'DEBUG';

Amplify.configure({
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'eu-west-1:e17b1206-41bb-4221-bbfe-8a3378ae16f8',

        // REQUIRED - Amazon Cognito Region
        region: 'eu-west-1',


        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'eu-west-1_26P3QL6O0',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '7bo7vq9upj1vrr34uj6l6podqn',

        authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
});

PushNotification.configure({
    appId:'fae7d0d4b10646a78691c05c0778d084',
    requestIOSPermissions: false // OPTIONAL, defaults to true
});

// set up the push notification callback functions
PushNotification.onRegister(token => {
  console.log('onRegister', token);
  console.log("got here")
      Analytics.updateEndpoint({
        address: token
      }).then(() => {});
});

PushNotification.onRegister((token) => {
  console.log('in app registration', token);
});

PushNotification.onNotification(notification => {
  if (notification.foreground) {
    console.log('onNotification foreground', notification);
  } else {
    console.log('onNotification background or closed', notification);
  }
  // extract the data passed in the push notification
  const data = JSON.parse(notification.data['pinpoint.jsonBody']);
  console.log('onNotification data', data);
  // iOS only
  // notification.finish(PushNotificationIOS.FetchResult.NoData);
});
PushNotification.onNotificationOpened(notification => {
  console.log('onNotificationOpened', notification);
  // extract the data passed in the push notification
  const data = JSON.parse(notification['pinpoint.jsonBody']);
  console.log('onNotificationOpened data', data);
});


async function associateEndpointWithUser(setUserId) {

  // retrieve and print the unique internal userid
  const {
    attributes: {sub},
  } = await Auth.currentAuthenticatedUser();
    setUserId(sub);
     Analytics.updateEndpoint({optOut: 'NONE',userId: sub}).then(() => {});

  //setUserId(sub);
//let sub = "fec73077-e07a-43d6-ac20-c4d57bc03d4b";
//setUserId(sub);
console.log("sub",sub);
//  // associate the device endpoint with the user
//  Analytics.updateEndpoint({optOut: 'NONE',userId: sub}).then(() => {});
}
const App = (() => {
//const App = withAuthenticator(includeGreetings: true() => {
  // retrieve and print the endpoint id, for testing only
  const [endpointId, setEndpointId] = useState('');
  useEffect(() => {
    const myendpointId = Analytics.getPluggable('AWSPinpoint')._config
      .endpointId;
      console.log("enpointconfig", Analytics.getPluggable('AWSPinpoint')._config.endpointId)
    console.log('endpointId', myendpointId);
    setEndpointId(myendpointId);
  }, []);
  // associate the device endpoint with the user
  const [userId, setUserId] = useState('');
  useEffect(() => {
    associateEndpointWithUser(setUserId);
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.body}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            AWS Amplify Android Push Notification Example
          </Text>
          <Text style={styles.sectionDescription}>
            Your endpointId is {endpointId}
          </Text>
          <Text style={styles.sectionDescription}>Your userId is {userId}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  body: {
    backgroundColor: 'white',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: 'black',
  },
});

//export default App;
export default withAuthenticator(App, {
                // Render a sign out button once logged in
                includeGreetings: true,});