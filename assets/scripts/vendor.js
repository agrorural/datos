// window.$ = window.jQuery = require('jquery');

require('materialize-css');

import { library, dom, config } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';


library.add(fas, far, fab);
config.searchPseudoElements = true;
dom.watch();

// window.getSpinner = function(message = 'Cargando...'){
//   $("body").addClass("with-spinner");
//   $("body").append('<aside class="spinner"><i class="fas fa-circle-notch fa-spin"></i><span>' + message + '<span></aside>').hide().fadeIn(300);
// };

// window.deleteSpinner = function(){
//   $("aside.spinner").fadeOut(300, function() {
//     $(this).remove();
//   });
//   $("body").removeClass("with-spinner");
// };