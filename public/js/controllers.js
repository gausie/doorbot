'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, $http, $location) {

    // Return true if this view describes the current location.
    // By default it will return true on descendents of the view, but
    // this can be stopped by passing a truthy second argument.
    $scope.isActive = function (view, no_children) {
        var path = $location.path();
        return  path === view || (!no_children && $location.path().indexOf(view) === 0);
    };

  }).
  controller('HomeCtrl', function ($scope) {

  }).
  controller('UserCtrl', function ($scope, $routeParams, $location, Users) {

    $scope.user = new Users({ enabled: true });

    $scope.save = {
      status: 0,
      message: 'Save'
    };

    if ($routeParams.id) {
      $scope.user = Users.get({
        id: $routeParams.id
      }, function() {
        $scope.checkInherited();
      });
    }

    $scope.checkInherited = function() {
      if ($scope.newCard) {
        $scope.addCard($scope.newCard);
      }
    }

    $scope.addCard = function (uid) {
      // Add a new card if the previous is not blank
      if($scope.user.Cards && $scope.user.Cards.length > 0) {
        var prev = $scope.user.Cards[$scope.user.Cards.length-1];
        if(!prev.uid && !prev.description) {
          return;
        }
      }else{
        $scope.user.Cards = [];
      }
      var newCard = {};
      if (uid) {
        newCard.uid = uid;
      }
      $scope.user.Cards.push(newCard);
    };

    $scope.removeCard = function (card) {
      var index = $scope.user.Cards.indexOf(card)
      $scope.user.Cards.splice(index, 1);
    };

    $scope.submit = function () {

      $scope.save = {
        status: 0,
        message: 'Saving'
      };

      var method = ($scope.user.id) ? '$update' : '$save';

      $scope.user[method](null, function() {
        if(method === "$save") {
          // If we have just created a new user, change the path to the
          // user ID but do not reload the state.
          $location.path('/users/'+$scope.user.id, false);
        }
        $scope.save = {
          status: 1,
          message: 'Saved'
        };
      }, function(err) {
        $scope.save = {
          status: -1,
          message: 'Error'
        };
      });
    };

    // Delete the user and return to user list.
    $scope.delete = function() {
      $scope.user.$delete(function() {
        $location.path('/users');
      });
    };

  }).
  controller('UsersCtrl', function ($scope, Users) {

    $scope.users = Users.query();

  }).
  controller('AddCardCtrl', function ($scope, $routeParams, Users) {

    $scope.newCard = $routeParams.uid;

  }).
  controller('LogsCtrl', function ($scope, Logs) {

    // Prepare scope variables.
    $scope.page = 1;
    $scope.offset;
    $scope.limit;
    $scope.total;
    $scope.rows;

    // Load new log items if the page changes.
    $scope.$watch('page', function(n, o) {
      if(parseInt(n) !== o) {
        $scope.load();
      }
    });

    // Load log items and metadata into the scope.
    $scope.load = function() {
      Logs.get({
        page: $scope.page,
        limit: $scope.limit
      }, function(results){

        // Update metadata.
        $scope.page = results.page;
        $scope.limit = results.limit;
        $scope.total = results.total;

        // Split log items by day.
        var tmp = {};
        results.rows.forEach(function(row) {
          var day = moment(row.createdAt).format("YYYY-MM-DD");
          if(tmp[day] === undefined) {
            tmp[day] = [];
          }
          tmp[day].push(row);
        });

        // Then make sure they're ordered correctly.
        var rows = [];
        for(var d in tmp) {
          rows.push({
            day: d,
            logs: tmp[d]
          });
        }
        $scope.rows = rows;

      });
    };

  });
