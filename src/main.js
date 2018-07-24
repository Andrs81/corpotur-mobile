import Vue from 'nativescript-vue';

import router from './router';


import './styles.scss';
import moment from 'vue-moment';

Vue.registerElement("BarcodeScanner", () => require("nativescript-barcodescanner").BarcodeScannerView);

// Uncomment the following to see NativeScript-Vue output logs
//Vue.config.silent = false;

new Vue({

  router,


}).$start();
