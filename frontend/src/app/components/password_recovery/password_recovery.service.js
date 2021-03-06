(function () {
  'use strict';

  angular
    .module('zoomtivity')
    .factory('PasswordRecoveryService', PasswordRecoveryService);

  /** @ngInject */
  function PasswordRecoveryService($modal, UserService, User, toastr, $state) {
    return {
      openModal: openModal,
      recoveryPassword: recoveryPassword,
      resetPassword: resetPassword
    };

    function openModal(template, controller) {
      $modal.open({
        templateUrl: template,
        controller: controller,
        controllerAs: 'modal',
        modalClass: 'authentication'
      });
    }

    /*
     * Send password recovery form
     * @param form {ngForm}
     * @param vm {Object} input data
     * @param $modalInstance {Object}
     */
    function recoveryPassword(form, vm, $modalInstance) {
      if (form.$valid) {
        User.recoveryPassword(vm,
          function success(user) {
            toastr.success('Further instructions was sent to your email');
            $modalInstance.dismiss('close');
          }, function error(resp) {
            toastr.error('That Email does not exist in our system');
          });
      }
    }

    /*
     * Send reset password form
     * @param form {ngForm}
     * @param vm {Object} input data
     * @param $modalInstance {Object}
     */
    function resetPassword(form, vm, $modalInstance) {
      if (form.$valid) {
        User.resetPassword(vm,
          function success(user) {
            toastr.success('Password successfully changed');
            UserService.setCurrentUser(user);
            $modalInstance.dismiss('close');
            //$state.go('index');
          }, function error(resp) {
            toastr.error('That Email does not exist in our system');
          });
      }
    }


  }

})();
