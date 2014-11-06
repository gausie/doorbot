'use strict';

/* Services */

angular.module('myApp.services', []).
  factory('Users', ['$resource', function($resource) {

    return $resource('/api/users/:id', { id: '@id' }, {
      'update': { method:'PUT' }
    });

  }]).
  factory('Logs', ['$resource', function($resource) {

    return $resource('/api/logs');

  }]);
