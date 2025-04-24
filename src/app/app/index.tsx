import { useEffect, useState } from 'react'; // ⬅️ Missing `useState`
import { View, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { postFunc } from '@/services'; // 👈 Update path accordingly

export default function IndexScreen() {
  const router = useRouter();
  const [formHtml, setFormHtml] = useState<string | null>(null); // ⬅️ Initialize correctly

  useEffect(() => {
    const authenticate = async () => {
      try {
        const platform = Platform.OS === 'web' ? 'web' : 'mobile';
        const authUrl = `https://testapp-capl.onrender.com/auth/start?platform=${platform}`;

        const result = await postFunc(authUrl, {}, 'GET'); // ⬅️ Use GET if your route is GET
        const redirectUrl = result.url;
        const realm = result.account

        const html = `
          <html>
            <body>
              <form id="loginForm" method="post" action="https://${realm}.app.netsuite.com/app/login/secure/enterpriselogin.nl">
                <input type="hidden" name="redirect" value="${redirectUrl}" />
                <input type="hidden" name="role" value="3" />
                <label>Email address:</label><input name="email" size="30" /><br/>
                <label>Password:</label><input name="password" size="30" type="password" /><br/>
                <input type="submit" value="Login" />
              </form>
            </body>
          </html>
        `;

        setFormHtml(html);
      } catch (err) {
        console.error('Authentication failed:', err);
      }
    };

    authenticate();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {formHtml ? (
        <WebView
          originWhitelist={['*']}
          source={{ html: formHtml }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      ) : (
        <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />
      )}
    </View>
  );
}