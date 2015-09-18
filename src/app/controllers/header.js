angular.module("proton.controllers.Header", [])

.controller("HeaderController", function(
    $log,
    $rootScope,
    $scope,
    $state,
    $stateParams,
    authentication,
    wizardModal
) {
    $scope.params = {
        searchMessageInput: $stateParams.words || '',
        searchContactInput: ''
    };

    $scope.showSidebar = $rootScope.showSidebar;

    function openWizardModal(title, version) {
        wizardModal.activate({
            params: {
                title: title,
                version: version,
                cancel: function() {
                    wizardModal.deactivate();
                }
            }
        });
    }

    $scope.isContactsView = function() {
        return $state.is('secured.contacts');
    };

    $scope.sidebarToggle = function() {
        $rootScope.$broadcast('sidebarMobileToggle');
    };

    $scope.searchMessages = function() {
        if($scope.params.searchMessageInput.length > 0) {
            $rootScope.$broadcast('searchMessages', $scope.params.searchMessageInput);
        } else {
            $state.go('secured.inbox');
        }
    };

    $scope.searchContacts = function() {
        if($scope.params.searchContactInput.length > 0) {
            $rootScope.$broadcast('searchContacts', $scope.params.searchContactInput);
        } else {
            $state.go('secured.contacts');
        }
    };

    $scope.closeMobileDropdown = function() {
        $(".navbar-toggle").click();
    };

    $scope.openNewMessage = function() {
        $rootScope.$broadcast('newMessage');
    };

    $scope.openSearchModal = function() {
        $rootScope.$broadcast('openSearchModal', $scope.params.searchMessageInput);
    };

    $scope.openReportModal = function() {
        $rootScope.$broadcast('openReportModal');
    };

    $scope.openWizard = function() {
        openWizardModal('ProtonMail Wizard', 'startWizard');
    };

    $scope.displayName = function() {
        var displayName = '';

        if(authentication.user) {
            displayName = authentication.user.DisplayName || authentication.user.Name;
        } else if($rootScope.tempUser && $rootScope.tempUser.username) {
            displayName = $rootScope.tempUser.username;
        }

        // Truncate
        if (displayName && displayName.length > 20) {
            displayName = displayName.substring(0, 17) + '...';
        }

        return displayName;
    };

    $scope.email = function() {
        if (authentication.user) {
            var address = _.findWhere(authentication.user.Addresses, {Send: 1});
            if (address) {
                return address.Email;
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    };

    $scope.toggleLayoutMode = function() {
        if($rootScope.layoutMode === 'rows') {
            $rootScope.layoutMode = 'columns';
        } else {
            $rootScope.layoutMode = 'rows';
        }
    };
});