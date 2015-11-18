"use strict";
(function(){

  var app = angular.module("AngmailApp", [
    "ngResource"
  ])

  app.factory("Message", ["$resource", function($resource) {
    return $resource("backend/messages/:id.json", null, {
      query: { isArray: false },
      markread: { method: "GET", url: "backend/messages/markread.json" }
    });
  }]);

  app.controller("ListController", ["$scope", "Message", function($scope, Message) {

    var selectedMessages = function() {
      return ($scope.messages || []).filter(function(message) {
        return message.selected;
      });
    }

    var extractIds = function(messages) {
      return messages.map(function(message) {
        return message.id;
      });
    }

    $scope.preview = function(idx) {
      var message;
      if (message = $scope.messages[idx]) {
        if ($scope.currentMessage && message.id == $scope.currentMessage.id) {
          $scope.currentMessage = null
        } else {
          Message.get({id: message.id}, function(data) {
            $scope.currentMessage = data.message;
            $scope.messages[idx].unread = false;
          });
        }
      }
    }

    $scope.checkAll = function(check) {
      check === undefined && (check = true)
      angular.forEach($scope.messages, function(message) {
        message.selected = check;
      });
      $scope.countChecked();
    }

    $scope.countChecked = function() {
      $scope.totalChecked = selectedMessages().length;
    }

    $scope.$watch("messages", function(messages) {
      if ($scope.currentMessage && extractIds(messages).indexOf($scope.currentMessage.id) == -1) {
        $scope.currentMessage = null
      }
      $scope.countChecked()
    })

    $scope.deleteChecked = function() {
      var ids = extractIds(selectedMessages());
      Message.delete({"ids": ids.join(".")}, function() {
        // on real backend request here could be displayed messages filter
      });
      $scope.messages = $scope.messages.filter(function(message) {
        return ids.indexOf(message.id) == -1
      });
    }

    $scope.readChecked = function() {
      var selected = selectedMessages(),
        ids = extractIds(selected);
      Message.markread({"ids": ids.join(".")}, function() {
        // on real backend request here could be displayed messages filter
      });
      angular.forEach(selected, function(message) {
        message.unread = false;
      });
    }

    Message.query(function(data) {
      $scope.messages = data.messages;
    });

  }])

  app.directive("ngConfirmClick", [
    function(){
      return {
        link: function (scope, element, attrs) {
          var msg = attrs.ngConfirmClick || "Are you sure?";
          element.bind("click",function (e) {
            if (!window.confirm(msg)) {
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          });
        }
      }
    }
  ]);

}).call(this);

