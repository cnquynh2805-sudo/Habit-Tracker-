# React Native Architecture Best Practices

This document outlines "Good vs. Bad" patterns for React Native development at Linguacare.

## 1. Separation of Concerns (UI vs. Business Logic)

**Bad:** Fetching data and maintaining complex state directly inside the UI component.
```javascript
// BAD
export function ProfileScreen() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser);
  }, []);

  return <Text>{user?.name}</Text>;
}
```

**Good:** Extracting state logic into custom hooks or Zustand stores.
```javascript
// GOOD
import { useUserStore } from '@/stores/useUserStore';

export function ProfileScreen() {
  const { user, loadUser } = useUserStore();
  
  useEffect(() => {
    loadUser();
  }, []);

  return <Text>{user?.name}</Text>;
}
```

## 2. Hardcoded Strings vs. Localization

**Bad:** Hardcoding text directly into the component.
```javascript
// BAD
<Button label="Save Profile" />
```

**Good:** Using `react-i18next` for all user-facing text.
```javascript
// GOOD
import { useTranslation } from 'react-i18next';

export function ProfileScreen() {
  const { t } = useTranslation();
  return <Button label={t('profile.save')} />;
}
```

## 3. Accessibility

**Bad:** Wrapping interactive views without accessibility context.
```javascript
// BAD
<TouchableOpacity onPress={handlePress}>
  <Icon name="close" />
</TouchableOpacity>
```

**Good:** Providing semantic roles and labels.
```javascript
// GOOD
<Pressable 
  onPress={handlePress} 
  accessible={true} 
  accessibilityRole="button" 
  accessibilityLabel={t('action.close')}
>
  <Icon name="close" />
</Pressable>
```

## 4. Adaptive Layouts

**Bad:** Using hardcoded dimensions.
```javascript
// BAD
const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 150,
  }
});
```

**Good:** Using flexbox and responsive techniques.
```javascript
// GOOD
const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    width: '100%',
  }
});
```

## 5. Xano & Axios API Integration

When using **Xano** with **Axios**, follow these strict rules to avoid common integration bugs:

### 1. Base URLs via Environments
**Bad:** Hardcoding the Xano Branch URL.
```javascript
// BAD
const api = axios.create({ baseURL: 'https://x8ki-letl-twmt.n7.xano.io/api:v1' });
```
**Good:** Using React Native environment variables to prevent deploying test URLs to production.
```javascript
// GOOD
const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });
```

### 2. Passing Query Arrays
**Bad:** Manually constructing array query strings which breaks Xano's parser.
```javascript
// BAD
axios.get(`/habits?categories=health,finance`);
```
**Good:** Passing the array directly into Axios `params`.
```javascript
// GOOD
axios.get('/habits', { params: { categories: ['health', 'finance'] } });
```

### 3. Error Handling
**Bad:** Only logging the generic Axios error which hides Xano's actual message.
```javascript
// BAD
catch (error) { console.error(error); } // "Network Error 400"
```
**Good:** Digging into the Xano specific error response.
```javascript
// GOOD
catch (error) { console.error(error.response?.data?.message || error.message); } // "Field 'name' is required"
```

### 4. Date Formats
**Bad:** Sending raw JavaScript Date strings to Xano.
**Good:** Always converting Dates to **UNIX milliseconds** (`Date.now()` or `date.getTime()`) before sending them in Axios POST/PUT payloads, as Xano internally manages time in UNIX format.

### 5. Offline Resiliency
**Bad:** Assuming Axios will retry automatically if the user is offline.
**Good:** Providing graceful fallbacks (Toasts) when `error.isAxiosError` triggers due to lack of network, or configuring React Query to automatically pause and retry mutations on reconnect.
