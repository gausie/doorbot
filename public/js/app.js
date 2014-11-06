'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'angular-loading-bar',
  'ngResource',
  'ngRoute',
  'ui.bootstrap',
  'angularMoment'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/home',
      controller: 'HomeCtrl'
    }).
    when('/users', {
      templateUrl: 'partials/users',
      controller: 'UsersCtrl'
    }).
    when('/users/add', {
      templateUrl: 'partials/user',
      controller: 'UserCtrl'
    }).
    when('/users/:id', {
      templateUrl: 'partials/user',
      controller: 'UserCtrl'
    }).
    when('/cards/add/:uid', {
      templateUrl: 'partials/addCard',
      controller: 'AddCardCtrl'
    }).
    when('/logs', {
      templateUrl: 'partials/logs',
      controller: 'LogsCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
}).run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
  // Allow us to change the path without reloading the state.
  var original = $location.path;
  $location.path = function (path, reload) {
    if (reload === false) {
      var lastRoute = $route.current;
      var un = $rootScope.$on('$locationChangeSuccess', function () {
        $route.current = lastRoute;
        un();
      });
    }
    return original.apply($location, [path]);
  };
}])
