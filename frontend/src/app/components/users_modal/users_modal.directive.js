(function () {
  'use strict';

  angular
    .module('zoomtivity')
    .directive('usersModal', UsersModal);

  /** @ngInject */
  function UsersModal($modal, $rootScope, $state) {
    return {
      restrict: 'A',
      scope: {
        user: '=',
        type: '@usersModal'
      },
      link: UsersModalLink
    };

    /** @ngInject */
    function UsersModalLink(s, e, a) {
      e.click(function () {
        if (angular.element(window).width() <= 992) {
          $state.go(s.type, {user_id: s.user.alias || s.user.id});
        } else {
          $modal.open({
            templateUrl: 'FollowersModal.html',
            controller: FollowersModalController,
            controllerAs: 'modal',
            modalClass: 'authentication',
            resolve: {
              usersType: function () {
                return s.type;
              },
              user: function () {
                return s.user;
              },
              users: function (User, Spot) {
                console.log(s.type);
                switch (s.type) {
                  case 'followers':
                    return User.followers({user_id: s.user.id}).$promise;
                  case 'followings':
                    return User.followings({user_id: s.user.id}).$promise;
                  case 'members':
                    return Spot.members({id: s.user.id}).$promise;
                }
              }
            }
          });
        }
      });
    }

    /** @ngInject */
    function FollowersModalController(usersType, user, users, $modalInstance) {
      var vm = this;
      vm.usersType = usersType;
      vm.user = user;
      vm.users = users;

      //close modal
      vm.close = function () {
        $modalInstance.close();
      };
    }
  }
})
();
