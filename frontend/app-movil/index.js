import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App)
// y prepara el entorno tanto para Expo Go como para un development build.
registerRootComponent(App);
