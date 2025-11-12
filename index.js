/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import LoginScreen from './Screens/login';
import MapScreen from './Screens/Map';
import SaleDetailsScreen from './Screens/SaleDetail';
import App from './Main';
import CreatePostScreen from './Screens/CreateaSale';
import SignupScreen from './Screens/Signup';
import MapPickerScreen from './Screens/PinMap';
import NewCategoriesSelector from './Components/NewCategories';



AppRegistry.registerComponent(appName, () => App);