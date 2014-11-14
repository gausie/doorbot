'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('lowercase', function($parse) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var lowercase = function(inputValue) {
           if (inputValue === undefined) { inputValue = ''; }
           var lowercased = inputValue.toLowerCase();
           if(lowercased !== inputValue) {
              modelCtrl.$setViewValue(lowercased);
              modelCtrl.$render();
            }
            return lowercased;
        }
        modelCtrl.$parsers.push(lowercase);
        lowercase($parse(attrs.ngModel)(scope)); // capitalize initial value
      }
    };
  });
